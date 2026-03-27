/**
 * ICS (iCalendar) file generator
 * RFC 5545 compliant — works on iOS, Android, Google Calendar, Outlook
 */

export interface ICSParams {
  title: string;
  description: string;
  start: Date;
  end: Date;
  location?: string;
  uid?: string;
}

/** Format a Date to ICS UTC timestamp: 20260320T083000Z */
function toICSDate(d: Date): string {
  return d
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

/** Fold long lines per RFC 5545 (max 75 octets, fold with CRLF + space) */
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  chunks.push(line.slice(0, 75));
  let i = 75;
  while (i < line.length) {
    chunks.push(' ' + line.slice(i, i + 74));
    i += 74;
  }
  return chunks.join('\r\n');
}

/** Escape special chars in text values */
function escapeText(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export function generateICS(params: ICSParams): string {
  const {
    title,
    description,
    start,
    end,
    location,
    uid = `${Date.now()}-vea@pacifikai.com`,
  } = params;

  const now = toICSDate(new Date());
  const startStr = toICSDate(start);
  const endStr = toICSDate(end);

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ve\'a BookFlow//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    foldLine(`UID:${uid}`),
    `DTSTAMP:${now}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    foldLine(`SUMMARY:${escapeText(title)}`),
    foldLine(`DESCRIPTION:${escapeText(description)}`),
  ];

  if (location) {
    lines.push(foldLine(`LOCATION:${escapeText(location)}`));
  }

  lines.push(
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'END:VEVENT',
    'END:VCALENDAR',
  );

  return lines.join('\r\n');
}
