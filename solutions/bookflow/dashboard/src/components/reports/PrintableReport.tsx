'use client';

import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { MonthlyReport } from '@/hooks/useReports';

// ─── Source labels ────────────────────────────────────────────────────────────

const SOURCE_LABELS: Record<string, string> = {
  chatbot: 'Chatbot',
  whatsapp: 'WhatsApp',
  messenger: 'Messenger',
  manual: 'Manuel',
  manuel: 'Manuel',
  web: 'Site web',
  app: 'Application',
  gcal: 'Google Calendar',
  guest: 'Invité',
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface PrintableReportProps {
  report: MonthlyReport;
}

export function PrintableReport({ report }: PrintableReportProps) {
  const monthLabel = format(parseISO(`${report.month}-01`), 'MMMM yyyy', { locale: fr });
  const monthLabelCapitalized = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  const totalSources = Object.values(report.bookingSources).reduce((s, v) => s + v, 0);
  const completionRate =
    report.totalAppointments > 0
      ? Math.round((report.completedAppointments / report.totalAppointments) * 100)
      : 0;

  const growthSign = report.revenueGrowth >= 0 ? '+' : '';
  const growthColor = report.revenueGrowth >= 0 ? '#16a34a' : '#dc2626';

  return (
    <div id="printable-report" className="hidden print:block">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-report,
          #printable-report * { visibility: visible; }
          #printable-report {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background: white;
          }
        }
      `}</style>

      <div style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#111827',
        padding: '40px 48px',
        maxWidth: '794px',
        margin: '0 auto',
        background: 'white',
      }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '2px solid #111827',
          paddingBottom: '20px',
          marginBottom: '28px',
        }}>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#111827' }}>
              {report.businessName}
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
              Rapport mensuel
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
              {monthLabelCapitalized}
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
              Généré le {format(new Date(), 'dd/MM/yyyy')}
            </div>
          </div>
        </div>

        {/* ── KPI grid ────────────────────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '28px',
        }}>
          {[
            { label: 'Rendez-vous total', value: String(report.totalAppointments) },
            { label: 'Terminés', value: String(report.completedAppointments) },
            { label: 'Taux de complétion', value: `${completionRate}%` },
            { label: 'Annulations', value: String(report.cancelledAppointments) },
            { label: 'No-shows', value: String(report.noShows) },
            { label: 'Nouveaux clients', value: String(report.newClients) },
          ].map(({ label, value }) => (
            <div key={label} style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '14px 16px',
            }}>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#111827' }}>{value}</div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '3px' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* ── Comparison ──────────────────────────────────────────────────── */}
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '14px 16px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>
            Évolution vs mois précédent :
          </span>
          <span style={{
            fontSize: '15px',
            fontWeight: 700,
            color: growthColor,
          }}>
            {growthSign}{report.revenueGrowth}% RDV terminés
          </span>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>
            ({report.previousMonthRevenue} RDV le mois précédent)
          </span>
        </div>

        {/* ── Top services ────────────────────────────────────────────────── */}
        {report.topServices.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#111827',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '12px',
            }}>
              Détail par service
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  {['Service', 'Nb RDV', '% du total'].map((h) => (
                    <th key={h} style={{
                      textAlign: h === 'Service' ? 'left' : 'right',
                      padding: '8px 10px',
                      color: '#6b7280',
                      fontWeight: 600,
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.topServices.map((svc, idx) => (
                  <tr key={svc.name} style={{
                    borderBottom: '1px solid #f3f4f6',
                    backgroundColor: idx % 2 === 0 ? '#fff' : '#f9fafb',
                  }}>
                    <td style={{ padding: '9px 10px', color: '#111827', fontWeight: 500 }}>
                      {svc.name}
                    </td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', color: '#374151', fontVariantNumeric: 'tabular-nums' }}>
                      {svc.count}
                    </td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', color: '#374151', fontVariantNumeric: 'tabular-nums' }}>
                      {report.totalAppointments > 0
                        ? `${Math.round((svc.count / report.totalAppointments) * 100)}%`
                        : '0%'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Sources ─────────────────────────────────────────────────────── */}
        {Object.keys(report.bookingSources).length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#111827',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '12px',
            }}>
              Sources de réservation
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(report.bookingSources)
                .sort((a, b) => b[1] - a[1])
                .map(([src, count]) => {
                  const pct = totalSources > 0 ? Math.round((count / totalSources) * 100) : 0;
                  return (
                    <div key={src} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '12px', color: '#374151', width: '110px', flexShrink: 0 }}>
                        {SOURCE_LABELS[src] ?? src}
                      </span>
                      <div style={{
                        flex: 1,
                        height: '8px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${pct}%`,
                          backgroundColor: '#111827',
                          borderRadius: '4px',
                        }} />
                      </div>
                      <span style={{ fontSize: '12px', color: '#374151', width: '40px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        {count}
                      </span>
                      <span style={{ fontSize: '11px', color: '#9ca3af', width: '36px', textAlign: 'right' }}>
                        {pct}%
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div style={{
          borderTop: '1px solid #e5e7eb',
          paddingTop: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '10px',
          color: '#9ca3af',
        }}>
          <span>{report.businessName} — Rapport {monthLabelCapitalized}</span>
          <span>Ve&apos;a BookFlow</span>
        </div>
      </div>
    </div>
  );
}
