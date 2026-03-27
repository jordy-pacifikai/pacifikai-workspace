'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, User, Calendar, X } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getSupabaseBrowser } from '@/lib/supabase';

interface ClientResult {
  id: string;
  name: string;
  phone: string | null;
}

interface AppointmentResult {
  id: string;
  client_name: string;
  client_phone: string | null;
  appointment_date: string;
  service: string | null;
  status: string;
}

interface SearchResults {
  clients: ClientResult[];
  appointments: AppointmentResult[];
}

interface GlobalSearchProps {
  businessId: string | null;
}

export function GlobalSearch({ businessId }: GlobalSearchProps) {
  const [active, setActive] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({ clients: [], appointments: [] });
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keyboard shortcut: "/" to focus
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setActive(true);
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        closeSearch();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeSearch();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeSearch = useCallback(() => {
    setActive(false);
    setQuery('');
    setResults({ clients: [], appointments: [] });
  }, []);

  const runSearch = useCallback(async (q: string) => {
    if (!businessId || q.trim().length < 2) {
      setResults({ clients: [], appointments: [] });
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
        .select('id, name, phone')
        .eq('business_id', businessId)
        .or(`name.ilike.%${escaped}%,phone.ilike.%${escaped}%`)
        .limit(5),
      supabase
        .from('bookbot_appointments')
        .select('id, client_name, client_phone, appointment_date, service, status')
        .eq('business_id', businessId)
        .or(`client_name.ilike.%${escaped}%,client_phone.ilike.%${escaped}%`)
        .limit(5),
    ]);

    setResults({
      clients: clientsRes.data ?? [],
      appointments: apptRes.data ?? [],
    });
    setLoading(false);
  }, [businessId]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch(val);
    }, 300);
  }

  const hasResults = results.clients.length > 0 || results.appointments.length > 0;
  const showDropdown = active && query.trim().length >= 2;

  function statusColor(status: string) {
    switch (status) {
      case 'confirmed': return 'text-emerald-400';
      case 'pending': return 'text-yellow-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  }

  function statusLabel(status: string) {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  }

  return (
    <div ref={containerRef} className="relative flex-1 max-w-sm mx-4" role="search" aria-label="Recherche globale">
      {/* Input */}
      <div
        className={`flex items-center gap-2 h-9 px-3 rounded-lg border transition-all duration-150 ${
          active
            ? 'bg-gray-900 border-gray-600 ring-1 ring-gray-600'
            : 'bg-gray-800/80 border-gray-700 hover:border-gray-600'
        } ${!businessId ? 'opacity-40 cursor-not-allowed' : 'cursor-text'}`}
        onClick={() => {
          if (!businessId) return;
          setActive(true);
          inputRef.current?.focus();
        }}
      >
        <Search size={14} className="text-gray-500 shrink-0" />
        <input
          ref={inputRef}
          data-global-search
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => businessId && setActive(true)}
          disabled={!businessId}
          placeholder="Chercher un client ou RDV…"
          className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none disabled:cursor-not-allowed"
        />
        {active && query.length > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); setQuery(''); setResults({ clients: [], appointments: [] }); }}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X size={13} />
          </button>
        )}
        {!active && (
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-gray-700 text-[10px] text-gray-500 font-mono">
            /
          </kbd>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-800 rounded-xl shadow-xl overflow-hidden z-50" role="listbox">
          {loading ? (
            <div className="px-4 py-3 text-sm text-gray-500">Recherche…</div>
          ) : !hasResults ? (
            <div className="px-4 py-3 text-sm text-gray-500">Aucun résultat pour « {query} »</div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {/* Clients section */}
              {results.clients.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-800">
                    Clients
                  </div>
                  {results.clients.map((client) => (
                    <Link
                      key={client.id}
                      href={`/clients/${client.id}`}
                      onClick={closeSearch}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800/60 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                        <User size={13} className="text-gray-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-white font-medium truncate">{client.name}</p>
                        {client.phone && (
                          <p className="text-xs text-gray-500 truncate">{client.phone}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Appointments section */}
              {results.appointments.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-800">
                    Rendez-vous
                  </div>
                  {results.appointments.map((appt) => (
                    <Link
                      key={appt.id}
                      href="/appointments"
                      onClick={closeSearch}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800/60 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                        <Calendar size={13} className="text-gray-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white font-medium truncate">{appt.client_name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {appt.service && (
                            <span className="text-xs text-gray-500 truncate">{appt.service}</span>
                          )}
                          <span className={`text-xs font-medium ${statusColor(appt.status)}`}>
                            {statusLabel(appt.status)}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-600 shrink-0">
                        {format(new Date(appt.appointment_date), 'd MMM', { locale: fr })}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
