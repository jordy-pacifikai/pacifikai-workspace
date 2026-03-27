'use client';

import { useMemo } from 'react';
import { useClients } from '@/hooks/useClients';
import { SEGMENTS, getClientSegments } from '@/lib/segments';
import type { Client } from '@/types/database';
import type { SegmentId } from '@/lib/segments';

// ─── Return type ──────────────────────────────────────────────────────────────

export interface UseClientSegmentsResult {
  /** Map from segmentId -> list of clients in that segment */
  segments: Map<SegmentId, Client[]>;
  /** Quick count per segment for badge display */
  counts: Record<SegmentId, number>;
  /** Compute segments for a single client (memoized array, stable per client) */
  getSegmentsForClient: (clientId: string) => SegmentId[];
  isLoading: boolean;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useClientSegments(businessId: string | null): UseClientSegmentsResult {
  const { data: clients, isLoading } = useClients(businessId);

  const result = useMemo<Omit<UseClientSegmentsResult, 'isLoading'>>(() => {
    const allClients = clients ?? [];

    // Build a lookup: clientId -> segmentIds[]
    const clientSegmentMap = new Map<string, SegmentId[]>();
    for (const client of allClients) {
      clientSegmentMap.set(client.id, getClientSegments(client));
    }

    // Build segment -> client[] map
    const segments = new Map<SegmentId, Client[]>();
    for (const seg of SEGMENTS) {
      segments.set(seg.id as SegmentId, []);
    }

    for (const client of allClients) {
      const segs = clientSegmentMap.get(client.id) ?? [];
      for (const segId of segs) {
        const list = segments.get(segId);
        if (list) list.push(client);
      }
    }

    // Build counts
    const counts = {} as Record<SegmentId, number>;
    for (const seg of SEGMENTS) {
      counts[seg.id as SegmentId] = segments.get(seg.id as SegmentId)?.length ?? 0;
    }

    const getSegmentsForClient = (clientId: string): SegmentId[] =>
      clientSegmentMap.get(clientId) ?? [];

    return { segments, counts, getSegmentsForClient };
  }, [clients]);

  return { ...result, isLoading };
}
