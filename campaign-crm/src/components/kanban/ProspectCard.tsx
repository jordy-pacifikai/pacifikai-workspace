'use client';

import { Draggable } from '@hello-pangea/dnd';
import { Mail, MapPin, Globe, ExternalLink } from 'lucide-react';
import { usePipelineStore } from '@/stores/pipelineStore';
import { STATUS_CONFIG, SECTOR_CONFIG } from '@/lib/constants';
import type { Prospect } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ProspectCardProps {
  prospect: Prospect;
  index: number;
}

export function ProspectCard({ prospect, index }: ProspectCardProps) {
  const { selectProspect } = usePipelineStore();
  const statusCfg = STATUS_CONFIG[prospect.status];
  const sectorCfg = SECTOR_CONFIG[prospect.sector];

  const icpColor =
    prospect.icp_score >= 60
      ? 'bg-green-500'
      : prospect.icp_score >= 30
      ? 'bg-amber-500'
      : 'bg-red-500';

  return (
    <Draggable draggableId={prospect.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => selectProspect(prospect.id)}
          className={cn(
            'flex flex-col gap-2 rounded-lg border bg-[#141420] p-3 cursor-pointer',
            'transition-all duration-150 select-none',
            snapshot.isDragging
              ? 'shadow-xl ring-1 ring-[#0D9488] rotate-1 scale-105'
              : `border-[#222233] hover:border-[${statusCfg.color === 'gray' ? '#555' : ''}]`,
            !snapshot.isDragging && `hover:${statusCfg.borderColor}`
          )}
          style={{
            ...provided.draggableProps.style,
            borderColor: snapshot.isDragging ? '#0D9488' : undefined,
          }}
        >
          {/* Name */}
          <p className="text-sm font-semibold text-[#e0e0e0] leading-tight line-clamp-2">
            {prospect.name}
          </p>

          {/* Sector + city row */}
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
                sectorCfg.bgColor,
                sectorCfg.color
              )}
            >
              {sectorCfg.label}
            </span>

            {prospect.city && (
              <span className="flex items-center gap-0.5 text-[10px] text-[#888] truncate max-w-[90px]">
                <MapPin size={9} />
                {prospect.city}
              </span>
            )}
          </div>

          {/* ICP score bar */}
          <div className="flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#222233]">
              <div
                className={cn('h-full rounded-full', icpColor)}
                style={{ width: `${prospect.icp_score}%` }}
              />
            </div>
            <span className="text-[10px] font-medium text-[#888]">{prospect.icp_score}</span>
          </div>

          {/* Email indicator */}
          {prospect.email && (
            <div className="flex items-center gap-1">
              <Mail size={10} className="text-[#0D9488]" />
              <span className="text-[10px] text-[#888] truncate">{prospect.email}</span>
            </div>
          )}

          {/* External links row */}
          {(prospect.facebook_url || prospect.website || (prospect.prototype_urls && prospect.prototype_urls.length > 0)) && (
            <div
              className="flex items-center gap-2 pt-1 border-t border-[#222233]"
              onClick={(e) => e.stopPropagation()}
            >
              {prospect.facebook_url && (
                <a
                  href={prospect.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Page Facebook"
                  className="flex items-center gap-0.5 text-[10px] text-[#0D9488] hover:text-[#0fbfb0] transition-colors"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                  <span>FB</span>
                </a>
              )}
              {prospect.website && (
                <a
                  href={prospect.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Site web"
                  className="flex items-center gap-0.5 text-[10px] text-[#666] hover:text-[#aaa] transition-colors"
                >
                  <Globe size={9} />
                  <span>Site</span>
                </a>
              )}
              {prospect.prototype_urls && prospect.prototype_urls.length > 0 && (
                <a
                  href={prospect.prototype_urls[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`${prospect.prototype_urls.length} prototype${prospect.prototype_urls.length > 1 ? 's' : ''}`}
                  className="flex items-center gap-0.5 text-[10px] text-[#0D9488] hover:text-[#0fbfb0] transition-colors"
                >
                  <ExternalLink size={9} />
                  <span>{prospect.prototype_urls.length} proto</span>
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
