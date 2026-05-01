import Anthropic from '@anthropic-ai/sdk';
import { Collection, WASTE_TYPE_LABELS } from './openerz.js';
import { formatCollectionSummary } from '../utils/formatter.js';

const client = new Anthropic();

const SYSTEM_PROMPT = `Du bist QuartierBot, ein freundlicher WhatsApp-Assistent für das Quartier Manegg/Greencity in Zürich (PLZ 8041).

Deine Hauptaufgabe: Nutzern bei Fragen zum Zürcher Abfallkalender helfen.
Antworte immer auf Deutsch, knapp und freundlich. Nutze WhatsApp-Formatierung (*fett*, _kursiv_).

Verfügbare Abfalltypen in Zürich:
${Object.entries(WASTE_TYPE_LABELS).map(([k, v]) => `- ${k} → ${v}`).join('\n')}

Verhalte dich so:
- Wenn der Nutzer eine PLZ nennt, extrahiere sie.
- Wenn der Nutzer nach Kehricht, Papier, Karton, Grüngut oder allgemein nach Abholterminen fragt, beantworte es mit den gegebenen Daten.
- Wenn keine Daten vorhanden sind, sage das ehrlich.
- Bleibe beim Abfallthema. Für andere Fragen verweise höflich auf die Quartierswebsite.`;

export type Intent = 'provide_zip' | 'ask_collection' | 'ask_specific_type' | 'greeting' | 'other';

export interface IntentResult {
  intent: Intent;
  zip?: string;
  wasteTypes?: string[];
}

export async function detectIntent(message: string, currentZip: string | null): Promise<IntentResult> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 256,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Analysiere diese Nachricht: "${message}"
Aktuelle gespeicherte PLZ: ${currentZip ?? 'keine'}

Antworte NUR mit JSON (kein Markdown, kein Text drumherum):
{
  "intent": "provide_zip" | "ask_collection" | "ask_specific_type" | "greeting" | "other",
  "zip": "<PLZ falls genannt, sonst null>",
  "wasteTypes": ["waste"|"paper"|"cardboard"|"organic"|... falls spezifisch gefragt, sonst []]
}`,
      },
    ],
  });

  const text = response.content.find((b) => b.type === 'text')?.text ?? '{}';
  try {
    // Strip potential markdown code fences
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned) as IntentResult;
  } catch {
    return { intent: 'other' };
  }
}

export async function generateAnswer(
  userMessage: string,
  collections: Collection[],
  zip: string,
): Promise<string> {
  const dataSummary = formatCollectionSummary(collections);

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 512,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Nutzerfrage: "${userMessage}"
PLZ: ${zip}
Abholtermine (nächste 30 Tage):
${dataSummary}

Formuliere eine hilfreiche, natürliche Antwort auf Deutsch. Maximal 3-4 Sätze.`,
      },
    ],
  });

  return response.content.find((b) => b.type === 'text')?.text ?? 'Entschuldigung, ich konnte keine Antwort generieren.';
}

export async function generateZipConfirmation(zip: string): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 128,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Der Nutzer hat die PLZ ${zip} angegeben. Bestätige kurz und frage, womit du helfen kannst (Abfallkalender). 1-2 Sätze.`,
      },
    ],
  });

  return response.content.find((b) => b.type === 'text')?.text ?? `PLZ ${zip} gespeichert! Womit kann ich helfen?`;
}
