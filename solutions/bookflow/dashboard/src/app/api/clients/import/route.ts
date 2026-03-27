import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { requireBusinessAccess } from '@/lib/auth';
import { rateLimitAsync } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { isValidEmail } from '@/lib/utils';

// ─── Column mapping (case-insensitive, flexible) ──────────────────────────────

const COLUMN_MAP: Record<string, string> = {
  nom: 'name',
  name: 'name',
  client_name: 'name',
  client: 'name',
  telephone: 'phone',
  phone: 'phone',
  tel: 'phone',
  téléphone: 'phone',
  email: 'email',
  mail: 'email',
  courriel: 'email',
  notes: 'notes',
  remarques: 'notes',
  note: 'notes',
  tags: 'tags',
  etiquettes: 'tags',
  étiquettes: 'tags',
};

function normalizeHeader(raw: string): string | null {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/^["']|["']$/g, '')       // strip quotes
    .replace(/\uFEFF/g, '')            // strip BOM
    .replace(/[_\-\s]+/g, '_');        // normalize separators

  return COLUMN_MAP[cleaned] ?? null;
}

// ─── CSV parser (handles BOM, semicolons, commas, quoted fields) ──────────────

function detectSeparator(firstLine: string): string {
  const semicolons = (firstLine.match(/;/g) ?? []).length;
  const commas = (firstLine.match(/,/g) ?? []).length;
  // Tabs
  const tabs = (firstLine.match(/\t/g) ?? []).length;
  if (tabs > semicolons && tabs > commas) return '\t';
  return semicolons >= commas ? ';' : ',';
}

function parseCSVLine(line: string, sep: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === sep) {
        fields.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseCSV(raw: string): { headers: string[]; rows: string[][] } {
  // Remove BOM
  const text = raw.replace(/^\uFEFF/, '');

  // Split lines, handle \r\n and \r
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  const sep = detectSeparator(lines[0]);
  const headers = parseCSVLine(lines[0], sep);
  const rows = lines.slice(1).map((line) => parseCSVLine(line, sep));

  return { headers, rows };
}

const businessIdSchema = z.string().uuid();

// ─── POST /api/clients/import ─────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const rawBusinessId = formData.get('businessId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'Fichier CSV requis' }, { status: 400 });
    }

    // File size limit: 5MB max to prevent memory exhaustion
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 5 Mo)' }, { status: 413 });
    }

    // MIME type validation
    const allowedTypes = ['text/csv', 'application/csv', 'text/plain', 'application/vnd.ms-excel'];
    if (file.type && !allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Format invalide — fichier CSV requis' }, { status: 400 });
    }

    const bidResult = businessIdSchema.safeParse(rawBusinessId);
    if (!bidResult.success) {
      return NextResponse.json(
        { error: 'Invalid businessId', details: bidResult.error.flatten() },
        { status: 400 },
      );
    }

    const businessId = bidResult.data;

    try {
      await requireBusinessAccess(businessId);
    } catch (authError) {
      if (authError instanceof NextResponse) return authError;
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { success } = await rateLimitAsync(`clients-import:${businessId}`, { interval: 60_000, limit: 3 })
    if (!success) {
      return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })
    }

    // Read file content
    const text = await file.text();
    const { headers, rows } = parseCSV(text);

    if (headers.length === 0) {
      return NextResponse.json({ error: 'Fichier CSV vide ou invalide' }, { status: 400 });
    }

    // Row count limit: 10k max to prevent excessive DB operations
    const MAX_ROWS = 10_000;
    if (rows.length > MAX_ROWS) {
      return NextResponse.json(
        { error: `Le fichier contient ${rows.length} lignes. Maximum autorise : ${MAX_ROWS}.` },
        { status: 413 },
      );
    }

    // Map headers to known columns
    const columnMapping: (string | null)[] = headers.map(normalizeHeader);

    const nameIdx = columnMapping.indexOf('name');
    if (nameIdx === -1) {
      return NextResponse.json(
        { error: 'Colonne "nom" (ou "name" / "client_name") introuvable dans le CSV.' },
        { status: 400 },
      );
    }

    const sb = supabaseAdmin();

    // Fetch existing clients for upsert check
    const { data: existing } = await sb
      .from('bookbot_clients')
      .select('id, phone')
      .eq('business_id', businessId)
      .not('phone', 'is', null);

    const existingByPhone = new Map<string, string>();
    for (const c of existing ?? []) {
      if (c.phone) existingByPhone.set(c.phone.trim(), c.id);
    }

    let imported = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const lineNum = i + 2; // +2 because: 0-indexed + header line

      // Build client object from row
      const record: Record<string, string | null> = {};
      for (let j = 0; j < columnMapping.length; j++) {
        const col = columnMapping[j];
        if (col) record[col] = row[j]?.trim() || null;
      }

      const name = record.name;
      if (!name) {
        skipped++;
        continue;
      }

      // Parse tags (comma-separated within the field)
      let tags: string[] | null = null;
      if (record.tags) {
        tags = record.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
        if (tags.length === 0) tags = null;
      }

      const rawPhone = record.phone || null;
      // Validate phone format: must start with + or digit, min 6 chars
      let phone: string | null = rawPhone;
      if (rawPhone && (!/^[+\d]/.test(rawPhone) || rawPhone.length < 6)) {
        errors.push(`Ligne ${lineNum}: numéro de téléphone invalide pour "${name}" — doit commencer par + ou un chiffre et faire au moins 6 caractères`);
        phone = null;
      }
      let email: string | null = record.email || null;
      if (email && !isValidEmail(email)) {
        errors.push(`Ligne ${lineNum}: adresse email invalide pour "${name}" — ignorée`);
        email = null;
      }
      const notes = record.notes || null;

      // Upsert logic: if same phone + business_id exists → update
      if (phone && existingByPhone.has(phone)) {
        const existingId = existingByPhone.get(phone)!;
        const { error } = await sb
          .from('bookbot_clients')
          .update({
            name,
            email,
            notes,
            ...(tags ? { tags } : {}),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingId);

        if (error) {
          logger.error('Import update error', { action: 'clients_import', line: lineNum, name, error: error.message });
          errors.push(`Ligne ${lineNum}: erreur mise à jour "${name}"`);
        } else {
          updated++;
        }
      } else {
        // Insert new client
        const { error } = await sb
          .from('bookbot_clients')
          .insert({
            business_id: businessId,
            name,
            phone,
            email,
            notes,
            tags,
          });

        if (error) {
          logger.error('Import insert error', { action: 'clients_import', line: lineNum, name, error: error.message });
          errors.push(`Ligne ${lineNum}: erreur insertion "${name}"`);
        } else {
          imported++;
          // Add to existing map for duplicate detection within same file
          if (phone) existingByPhone.set(phone, 'new');
        }
      }
    }

    return NextResponse.json({ imported, updated, skipped, errors });
  } catch (err: unknown) {
    logger.error('Import error', { action: 'clients_import', error: String(err) });
    return NextResponse.json({ error: 'Erreur lors de l\'import. Veuillez réessayer.' }, { status: 500 });
  }
}
