'use client';

import { generateICS } from '@/lib/ics';
import { getBookingRef } from '@/lib/booking-ref';

interface ICSData {
  title: string;
  description: string;
  start: string;       // 'YYYY-MM-DD'
  startTime: string;   // 'HH:MM'
  end: string;         // 'YYYY-MM-DD'
  endTime: string;     // 'HH:MM'
  location?: string;
}

interface Props {
  icsData: ICSData;
  accent: string;
}

export default function DownloadICSButton({ icsData, accent }: Props) {
  function handleDownload() {
    const { start, startTime, end, endTime, title, description, location } = icsData;

    // Build UTC Date objects from local date + local time strings
    const [sy, sm, sd] = start.split('-').map(Number);
    const [sh, smin] = startTime.split(':').map(Number);
    const [ey, em, ed] = end.split('-').map(Number);
    const [eh, emin] = endTime.split(':').map(Number);

    const startDate = new Date(
      Number(sy), Number(sm) - 1, Number(sd), Number(sh), Number(smin), 0,
    );
    const endDate = new Date(
      Number(ey), Number(em) - 1, Number(ed), Number(eh), Number(emin), 0,
    );

    const icsContent = generateICS({
      title,
      description,
      start: startDate,
      end: endDate,
      location,
    });

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rdv-vea.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleDownload}
      className="flex items-center justify-center gap-2 w-full rounded-xl py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90"
      style={{ backgroundColor: accent }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
      Ajouter au calendrier
    </button>
  );
}
