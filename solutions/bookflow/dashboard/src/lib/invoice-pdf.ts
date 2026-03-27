// ─── Invoice Data Generator ─────────────────────────────────────────────────
// Generates structured invoice data for display and future PDF export.
// Stripe not available in French Polynesia — invoices are for bank transfer.

interface InvoiceBusiness {
  name: string;
  email: string | null;
  phone: string;
  plan: string | null;
}

interface InvoiceRow {
  id: string;
  period_start: string;
  period_end: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  created_at: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  periodLabel: string;
  business: {
    name: string;
    email: string;
    phone: string;
  };
  issuer: {
    name: string;
    legal: string;
    email: string;
    phone: string;
  };
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  total: number;
  currency: string;
  paymentMethod: string;
  bankDetails: {
    bank: string;
    iban: string;
    bic: string;
    reference: string;
  };
  legalMentions: string[];
}

function formatDateFR(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function formatPeriodLabel(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const monthStart = s.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const monthEnd = e.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  if (monthStart === monthEnd) return monthStart;
  return `${monthStart} — ${monthEnd}`;
}

function formatXPF(amount: number): string {
  return `${amount.toLocaleString('fr-FR')} XPF`;
}

const PLAN_LABELS: Record<string, string> = {
  starter: 'Plan Starter',
  pro: 'Plan Pro',
  business: 'Plan Business',
  enterprise: 'Plan Enterprise',
  decouverte: 'Plan Decouverte',
};

export function getPlanLabel(plan: string | null): string {
  if (!plan) return 'Aucun plan';
  return PLAN_LABELS[plan.toLowerCase()] ?? plan;
}

export function generateInvoiceData(
  business: InvoiceBusiness,
  invoice: InvoiceRow,
): InvoiceData {
  const planLabel = getPlanLabel(business.plan);
  const invoiceNumber = `VEA-${new Date(invoice.created_at).getFullYear()}-${invoice.id.slice(0, 8).toUpperCase()}`;

  const issueDate = formatDateFR(invoice.created_at);
  const dueDate = formatDateFR(
    new Date(new Date(invoice.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  );
  const periodLabel = formatPeriodLabel(invoice.period_start, invoice.period_end);

  return {
    invoiceNumber,
    issueDate,
    dueDate,
    periodLabel,
    business: {
      name: business.name,
      email: business.email ?? '',
      phone: business.phone,
    },
    issuer: {
      name: "PACIFIK'AI",
      legal: 'EI Jordy TOOFA — Patente G67367',
      email: 'jordy@pacifikai.com',
      phone: '+689 89 55 81 89',
    },
    lineItems: [
      {
        description: `Abonnement Ve'a — ${planLabel} (${periodLabel})`,
        quantity: 1,
        unitPrice: invoice.amount,
        total: invoice.amount,
      },
    ],
    subtotal: invoice.amount,
    total: invoice.amount,
    currency: 'XPF',
    paymentMethod: 'Virement bancaire',
    bankDetails: {
      bank: 'Banque de Polynesie',
      iban: 'A fournir sur demande',
      bic: 'A fournir sur demande',
      reference: invoiceNumber,
    },
    legalMentions: [
      "PACIFIK'AI — EI Jordy TOOFA — Patente G67367",
      'TVA non applicable — regime de la Polynesie francaise',
      `Montant total : ${formatXPF(invoice.amount)}`,
      'Paiement par virement bancaire sous 30 jours',
    ],
  };
}

export { formatXPF, formatDateFR };
