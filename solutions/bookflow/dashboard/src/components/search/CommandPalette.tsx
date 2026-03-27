'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Clock, User, Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCommandPalette } from '@/hooks/useCommandPalette';
import { searchPages, PAGE_INDEX, type PageEntry } from '@/lib/search-index';
import { useAppStore } from '@/lib/store';
import { getSupabaseBrowser } from '@/lib/supabase';
import { useFocusTrap } from '@/hooks/useFocusTrap';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ClientResult {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

interface AppointmentResult {
  id: string;
  client_name: string;
  client_phone: string | null;
  appointment_date: string;
  service: string | null;
  status: string;
}

type ResultItem =
  | { kind: 'page'; entry: PageEntry }
  | { kind: 'client'; data: ClientResult }
  | { kind: 'appointment'; data: AppointmentResult }
  | { kind: 'recent'; entry: PageEntry };

// ── Recent pages helpers ───────────────────────────────────────────────────────

const RECENT_KEY = 'cmd_palette_recent';
const MAX_RECENT = 5;

function getRecentPages(): PageEntry[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const hrefs: string[] = JSON.parse(raw);
    return hrefs
      .map((href) => PAGE_INDEX.find((p) => p.href === href))
      .filter((p): p is PageEntry => !!p);
  } catch {
    return [];
  }
}

function saveRecentPage(href: string) {
  try {
    const current = getRecentPages().map((p) => p.href);
    const updated = [href, ...current.filter((h) => h !== href)].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {
    // localStorage unavailable (SSR / private mode)
  }
}

// ── Status helpers ────────────────────────────────────────────────────────────

function statusColor(status: string) {
  switch (status) {
    case 'confirmed': return 'text-emerald-400';
    case 'pending':   return 'text-yellow-400';
    case 'cancelled': return 'text-red-400';
    default:          return 'text-gray-400';
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'confirmed': return 'Confirmé';
    case 'pending':   return 'En attente';
    case 'cancelled': return 'Annulé';
    default:          return status;
  }
}

// ── Main component ────────────────────────────────────────────────────────────

export function CommandPalette() {
  const { isOpen, close } = useCommandPalette();
  const router = useRouter();
  const businessId = useAppStore((s) => s.businessId);
  const trapRef = useFocusTrap(isOpen);

  const [query, setQuery] = useState('');
  const [clients, setClients] = useState<ClientResult[]>([]);
  const [appointments, setAppointments] = useState<AppointmentResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setClients([]);
      setAppointments([]);
      setActiveIndex(0);
      // Small defer so the modal is mounted before focus
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // DB search with debounce
  const runDbSearch = useCallback(
    async (q: string) => {
      if (!businessId || q.trim().length < 2) {
        setClients([]);
        setAppointments([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const supabase = getSupabaseBrowser();
      // Escape ilike special characters to prevent wildcard abuse
      const escaped = q.replace(/[%_\\]/g, '\\$&');

      const [clientsRes, apptRes] = await Promise.all([
        supabase
          .from('bookbot_clients')
          .select('id, name, phone, email')
          .eq('business_id', businessId)
          .or(`name.ilike.%${escaped}%,phone.ilike.%${escaped}%,email.ilike.%${escaped}%`)
          .limit(4),
        supabase
          .from('bookbot_appointments')
          .select('id, client_name, client_phone, appointment_date, service, status')
          .eq('business_id', businessId)
          .or(`client_name.ilike.%${escaped}%,service.ilike.%${escaped}%`)
          .order('appointment_date', { ascending: false })
          .limit(4),
      ]);

      setClients(clientsRes.data ?? []);
      setAppointments(apptRes.data ?? []);
      setLoading(false);
    },
    [businessId],
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    setActiveIndex(0);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runDbSearch(val), 300);
  }

  // Build flat results list for keyboard navigation
  const pageResults = searchPages(query);
  const recentPages = !query ? getRecentPages() : [];

  const allItems: ResultItem[] = [
    ...recentPages.map((entry): ResultItem => ({ kind: 'recent', entry })),
    ...pageResults.map((entry): ResultItem => ({ kind: 'page', entry })),
    ...clients.map((data): ResultItem => ({ kind: 'client', data })),
    ...appointments.map((data): ResultItem => ({ kind: 'appointment', data })),
  ];

  function navigateTo(href: string) {
    saveRecentPage(href);
    router.push(href);
    close();
  }

  function selectItem(item: ResultItem) {
    switch (item.kind) {
      case 'page':
      case 'recent':
        navigateTo(item.entry.href);
        break;
      case 'client':
        navigateTo(`/clients/${item.data.id}`);
        break;
      case 'appointment':
        navigateTo('/appointments');
        break;
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, allItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (allItems[activeIndex]) selectItem(allItems[activeIndex]);
        break;
      case 'Escape':
        close();
        break;
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const active = listRef.current.querySelector<HTMLElement>('[data-active="true"]');
    active?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (!isOpen) return null;

  // ── Flat index tracker (shared between sections) ───────────────────────────
  let flatIndex = 0;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      ref={trapRef}
      role="dialog"
      aria-modal="true"
      aria-label="Palette de commandes"
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4"
      onClick={close}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-xl bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '70vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Search input ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-700">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher une page, un client, un RDV..."
            autoComplete="off"
            spellCheck={false}
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
            aria-label="Recherche"
            aria-autocomplete="list"
            aria-controls="cmd-palette-results"
            aria-activedescendant={
              allItems[activeIndex] ? `cmd-item-${activeIndex}` : undefined
            }
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setClients([]); setAppointments([]); inputRef.current?.focus(); }}
              className="text-gray-500 hover:text-gray-300 transition-colors"
              aria-label="Effacer"
            >
              <X size={16} />
            </button>
          )}
          <kbd className="hidden sm:inline-flex shrink-0 items-center px-1.5 py-0.5 rounded border border-gray-600 text-[10px] text-gray-500 font-mono">
            Esc
          </kbd>
        </div>

        {/* ── Results ───────────────────────────────────────────────────────── */}
        <div
          id="cmd-palette-results"
          ref={listRef}
          role="listbox"
          className="overflow-y-auto flex-1"
        >
          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500">
              <div className="w-3.5 h-3.5 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
              Recherche…
            </div>
          )}

          {/* Empty state */}
          {!loading && allItems.length === 0 && query.trim().length >= 2 && (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              Aucun résultat pour{' '}
              <span className="text-gray-300 font-medium">« {query} »</span>
            </div>
          )}

          {/* Recent pages (shown when no query) */}
          {!query && recentPages.length > 0 && (
            <Section title="Récents">
              {recentPages.map((entry) => {
                const idx = flatIndex++;
                const Icon = entry.icon;
                return (
                  <ResultRow
                    key={`recent-${entry.href}`}
                    id={`cmd-item-${idx}`}
                    isActive={activeIndex === idx}
                    onSelect={() => navigateTo(entry.href)}
                    onHover={() => setActiveIndex(idx)}
                    icon={<Clock size={15} className="text-gray-400" />}
                    title={entry.title}
                    subtitle={entry.subtitle}
                  />
                );
              })}
            </Section>
          )}

          {/* Empty state: no query, no recents → show top pages */}
          {!query && recentPages.length === 0 && (
            <Section title="Pages">
              {PAGE_INDEX.slice(0, 5).map((entry) => {
                const idx = flatIndex++;
                const Icon = entry.icon;
                return (
                  <ResultRow
                    key={`page-default-${entry.href}`}
                    id={`cmd-item-${idx}`}
                    isActive={activeIndex === idx}
                    onSelect={() => navigateTo(entry.href)}
                    onHover={() => setActiveIndex(idx)}
                    icon={<Icon size={15} className="text-gray-400" />}
                    title={entry.title}
                    subtitle={entry.subtitle}
                  />
                );
              })}
            </Section>
          )}

          {/* Page results */}
          {pageResults.length > 0 && (
            <Section title="Pages">
              {pageResults.map((entry) => {
                const idx = flatIndex++;
                const Icon = entry.icon;
                return (
                  <ResultRow
                    key={`page-${entry.href}`}
                    id={`cmd-item-${idx}`}
                    isActive={activeIndex === idx}
                    onSelect={() => navigateTo(entry.href)}
                    onHover={() => setActiveIndex(idx)}
                    icon={<Icon size={15} className="text-gray-400" />}
                    title={entry.title}
                    subtitle={entry.subtitle}
                    hint={entry.href}
                  />
                );
              })}
            </Section>
          )}

          {/* Client results */}
          {clients.length > 0 && (
            <Section title="Clients">
              {clients.map((client) => {
                const idx = flatIndex++;
                return (
                  <ResultRow
                    key={`client-${client.id}`}
                    id={`cmd-item-${idx}`}
                    isActive={activeIndex === idx}
                    onSelect={() => navigateTo(`/clients/${client.id}`)}
                    onHover={() => setActiveIndex(idx)}
                    icon={
                      <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                        <User size={12} className="text-gray-400" />
                      </div>
                    }
                    title={client.name}
                    subtitle={client.phone ?? client.email ?? 'Client'}
                  />
                );
              })}
            </Section>
          )}

          {/* Appointment results */}
          {appointments.length > 0 && (
            <Section title="Rendez-vous">
              {appointments.map((appt) => {
                const idx = flatIndex++;
                return (
                  <ResultRow
                    key={`appt-${appt.id}`}
                    id={`cmd-item-${idx}`}
                    isActive={activeIndex === idx}
                    onSelect={() => navigateTo('/appointments')}
                    onHover={() => setActiveIndex(idx)}
                    icon={
                      <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                        <Calendar size={12} className="text-gray-400" />
                      </div>
                    }
                    title={appt.client_name}
                    subtitle={
                      [
                        appt.service,
                        statusLabel(appt.status),
                        format(new Date(appt.appointment_date), 'd MMM yyyy', { locale: fr }),
                      ]
                        .filter(Boolean)
                        .join(' · ')
                    }
                    statusColor={statusColor(appt.status)}
                  />
                );
              })}
            </Section>
          )}

          {/* Bottom padding */}
          <div className="h-2" />
        </div>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-700 bg-gray-800/50">
          <div className="flex items-center gap-3 text-[11px] text-gray-500">
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center w-5 h-5 rounded border border-gray-600 bg-gray-700 text-[10px] text-gray-400 font-mono">↵</kbd>
              Ouvrir
            </span>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center w-5 h-5 rounded border border-gray-600 bg-gray-700 text-[10px] text-gray-400 font-mono">↑</kbd>
              <kbd className="inline-flex items-center justify-center w-5 h-5 rounded border border-gray-600 bg-gray-700 text-[10px] text-gray-400 font-mono">↓</kbd>
              Naviguer
            </span>
          </div>
          <span className="text-[11px] text-gray-600">
            <kbd className="inline-flex items-center px-1.5 py-0.5 rounded border border-gray-600 bg-gray-700 text-[10px] text-gray-400 font-mono">Esc</kbd>
            {' '}fermer
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
        {title}
      </p>
      {children}
    </div>
  );
}

interface ResultRowProps {
  id: string;
  isActive: boolean;
  onSelect: () => void;
  onHover: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  hint?: string;
  statusColor?: string;
}

function ResultRow({
  id,
  isActive,
  onSelect,
  onHover,
  icon,
  title,
  subtitle,
  hint,
  statusColor,
}: ResultRowProps) {
  return (
    <button
      id={id}
      role="option"
      aria-selected={isActive}
      data-active={isActive}
      onClick={onSelect}
      onMouseEnter={onHover}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
        isActive ? 'bg-gray-700/70' : 'hover:bg-gray-700/40'
      }`}
    >
      {/* Icon */}
      <div className="shrink-0 text-gray-400">{icon}</div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{title}</p>
        {subtitle && (
          <p className={`text-xs truncate mt-0.5 ${statusColor ?? 'text-gray-500'}`}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Hint / path */}
      {hint && (
        <span className="shrink-0 text-xs text-gray-600 font-mono hidden sm:block">{hint}</span>
      )}

      {/* Arrow */}
      {isActive && (
        <ArrowRight size={14} className="shrink-0 text-gray-500" />
      )}
    </button>
  );
}
