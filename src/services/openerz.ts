const BASE_URL = 'https://openerz.metaodi.ch/api/calendar.json';

export interface Collection {
  date: string;
  waste_type: string;
  station: string;
  description: string;
}

export interface OpenErzResponse {
  _metadata: { total_count: number; row_count: number };
  result: Collection[];
}

// German labels for waste types
export const WASTE_TYPE_LABELS: Record<string, string> = {
  waste: 'Kehricht',
  paper: 'Altpapier',
  cardboard: 'Karton',
  organic: 'Grüngut',
  metal: 'Metall',
  mobile: 'Sperrmüll/Mobil',
  textile: 'Textilien',
  special: 'Sondermüll',
  incombustibles: 'Unbrennbares',
  chipping: 'Häcksel',
  etram: 'Entsorgungstram',
  cargotram: 'Cargo-Tram',
};

export async function fetchUpcoming(zip: string, days = 30): Promise<Collection[]> {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + days);

  const params = new URLSearchParams({
    zip,
    start: formatDate(start),
    end: formatDate(end),
    sort: 'date:asc',
    limit: '50',
  });

  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) {
    throw new Error(`OpenERZ API Fehler: ${res.status}`);
  }

  const data = (await res.json()) as OpenErzResponse;
  return data.result ?? [];
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}
