'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { usePipelineStore } from '@/stores/pipelineStore';
import { useProspects } from '@/hooks/useProspects';
import { STATUS_CONFIG, SECTOR_CONFIG } from '@/lib/constants';
import { ContactSection } from '@/components/detail/ContactSection';
import { PrototypeLinks } from '@/components/detail/PrototypeLinks';
import { NotesSection } from '@/components/detail/NotesSection';
import { EmailTimeline } from '@/components/detail/EmailTimeline';
import { FacebookSection } from '@/components/detail/FacebookSection';
import { ActionBar } from '@/components/detail/ActionBar';
import { ColorBadge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

type Tab = 'contact' | 'prototypes' | 'emails' | 'facebook' | 'notes';

const TABS: { id: Tab; label: string }[] = [
  { id: 'contact',    label: 'Contact' },
  { id: 'prototypes', label: 'Prototypes' },
  { id: 'emails',     label: 'Emails' },
  { id: 'facebook',   label: 'Facebook' },
  { id: 'notes',      label: 'Notes' },
];

export function DetailPanel() {
  const { detailOpen, selectedProspect, closeDetail } = usePipelineStore();
  const { data: prospects = [] } = useProspects();
  const [activeTab, setActiveTab] = useState<Tab>('contact');
  const [goToNotes, setGoToNotes] = useState(false);

  const prospect = prospects.find((p) => p.id === selectedProspect) ?? null;

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && detailOpen) closeDetail();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [detailOpen, closeDetail]);

  // Reset tab when prospect changes
  useEffect(() => {
    setActiveTab('contact');
  }, [selectedProspect]);

  // Handle "Add note" from ActionBar
  useEffect(() => {
    if (goToNotes) {
      setActiveTab('notes');
      setGoToNotes(false);
    }
  }, [goToNotes]);

  if (!detailOpen || !prospect) return null;

  const statusCfg = STATUS_CONFIG[prospect.status];
  const sectorCfg = SECTOR_CONFIG[prospect.sector];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 bg-black/30"
        onClick={closeDetail}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={cn(
          'fixed right-0 top-0 z-40 flex h-full w-[480px] flex-col border-l border-[#222233] bg-[#141420] shadow-2xl',
          'transition-transform duration-300 ease-out',
          detailOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label={`Détail : ${prospect.name}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#222233] px-5 py-4">
          <div className="flex flex-col gap-1.5 min-w-0">
            <h2 className="truncate text-base font-semibold text-[#e0e0e0]">{prospect.name}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <ColorBadge
                label={statusCfg.label}
                color={statusCfg.color}
                showDot
              />
              <ColorBadge
                label={sectorCfg.label}
                color={sectorCfg.color.replace('text-', '')}
              />
              {prospect.city && (
                <span className="text-xs text-[#888]">{prospect.city}</span>
              )}
            </div>
          </div>
          <button
            onClick={closeDetail}
            className="flex-shrink-0 rounded-md p-1.5 text-[#888] transition-colors hover:bg-[#1a1a2e] hover:text-[#e0e0e0]"
            aria-label="Fermer le panneau"
          >
            <X size={16} />
          </button>
        </div>

        {/* ICP score */}
        <div className="flex items-center gap-3 border-b border-[#222233] px-5 py-3">
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#888]">Score ICP</span>
              <span className={cn(
                'text-xs font-semibold',
                prospect.icp_score >= 60 ? 'text-green-400' :
                prospect.icp_score >= 30 ? 'text-amber-400' : 'text-red-400'
              )}>
                {prospect.icp_score}/100
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#222233] overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  prospect.icp_score >= 60 ? 'bg-green-500' :
                  prospect.icp_score >= 30 ? 'bg-amber-500' : 'bg-red-500'
                )}
                style={{ width: `${prospect.icp_score}%` }}
              />
            </div>
          </div>
          {prospect.batch !== null && (
            <span className="text-xs text-[#888]">Batch #{prospect.batch}</span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#222233]">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 px-2 py-3 text-xs font-medium transition-colors',
                activeTab === tab.id
                  ? 'border-b-2 border-[#0D9488] text-[#0D9488]'
                  : 'text-[#888] hover:text-[#e0e0e0]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'contact'    && <ContactSection prospect={prospect} />}
          {activeTab === 'prototypes' && <PrototypeLinks prospect={prospect} />}
          {activeTab === 'emails'     && <EmailTimeline prospect={prospect} />}
          {activeTab === 'facebook'   && <FacebookSection prospect={prospect} />}
          {activeTab === 'notes'      && <NotesSection prospectId={prospect.id} />}
        </div>

        {/* Action bar */}
        <ActionBar prospect={prospect} onAddNote={() => setGoToNotes(true)} />
      </aside>
    </>
  );
}
