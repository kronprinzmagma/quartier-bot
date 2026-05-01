import { Collection, WASTE_TYPE_LABELS } from '../services/openerz.js';

const DE_WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const DE_MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

export function formatGermanDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  const weekday = DE_WEEKDAYS[d.getDay()];
  const day = d.getDate();
  const month = DE_MONTHS[d.getMonth()];
  return `${weekday}, ${day}. ${month}`;
}

export function groupByType(collections: Collection[]): Map<string, string[]> {
  const grouped = new Map<string, string[]>();
  for (const c of collections) {
    const label = WASTE_TYPE_LABELS[c.waste_type] ?? c.waste_type;
    if (!grouped.has(label)) grouped.set(label, []);
    grouped.get(label)!.push(formatGermanDate(c.date));
  }
  return grouped;
}

export function formatCollectionSummary(collections: Collection[]): string {
  if (collections.length === 0) return 'Keine Termine gefunden.';

  const grouped = groupByType(collections);
  const lines: string[] = [];

  for (const [type, dates] of grouped) {
    lines.push(`*${type}:* ${dates.slice(0, 3).join(', ')}${dates.length > 3 ? ' …' : ''}`);
  }

  return lines.join('\n');
}
