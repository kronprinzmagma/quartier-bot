import { Router, Request, Response } from 'express';
import { getSession, setZip } from '../services/session.js';
import { fetchUpcoming } from '../services/openerz.js';
import { detectIntent, generateAnswer, generateZipConfirmation } from '../services/claude.js';

export const webhookRouter = Router();

const MSG_ASK_ZIP = 'Hallo! 👋 Ich bin der *QuartierBot* für Manegg/Greencity. Damit ich dir beim Abfallkalender helfen kann, brauche ich deine PLZ. Bitte schreib mir einfach deine Postleitzahl (z.B. _8041_).';

const MSG_UNKNOWN_ZIP = 'Diese PLZ kenne ich leider nicht. Bitte gib eine gültige Zürcher PLZ ein (z.B. 8041).';

const MSG_NO_DATA = 'Für deine PLZ wurden keine Abholtermine in den nächsten 30 Tagen gefunden.';

const MSG_OTHER = 'Ich helfe dir gerne beim Abfallkalender! Frag mich z.B. "Wann wird der Kehricht abgeholt?" oder "Wann kommt die Papiertonne?"';

function twiml(message: string): string {
  const escaped = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escaped}</Message></Response>`;
}

function isValidZip(zip: string): boolean {
  return /^8\d{3}$/.test(zip);
}

webhookRouter.post('/', async (req: Request, res: Response) => {
  res.type('text/xml');

  const phone: string = req.body?.From ?? 'unknown';
  const body: string = (req.body?.Body ?? '').trim();

  if (!body) {
    res.send(twiml(MSG_OTHER));
    return;
  }

  const session = getSession(phone);

  // No ZIP yet – check if this message is a ZIP, else ask
  if (!session.zip) {
    const rawZip = body.replace(/\s/g, '');
    if (/^\d{4}$/.test(rawZip)) {
      if (!isValidZip(rawZip)) {
        res.send(twiml(MSG_UNKNOWN_ZIP));
        return;
      }
      setZip(phone, rawZip);
      try {
        const confirmation = await generateZipConfirmation(rawZip);
        res.send(twiml(confirmation));
      } catch {
        res.send(twiml(`PLZ ${rawZip} gespeichert! Frag mich z.B. nach dem nächsten Kehrichttermin.`));
      }
      return;
    }
    // Not a ZIP – greet and ask
    res.send(twiml(MSG_ASK_ZIP));
    return;
  }

  // Session has ZIP – detect intent
  let intentResult;
  try {
    intentResult = await detectIntent(body, session.zip);
  } catch (err) {
    console.error('detectIntent error:', err);
    intentResult = { intent: 'ask_collection' as const };
  }

  // User provided a new ZIP
  if (intentResult.intent === 'provide_zip' && intentResult.zip) {
    const newZip = intentResult.zip.replace(/\s/g, '');
    if (!isValidZip(newZip)) {
      res.send(twiml(MSG_UNKNOWN_ZIP));
      return;
    }
    setZip(phone, newZip);
    try {
      const confirmation = await generateZipConfirmation(newZip);
      res.send(twiml(confirmation));
    } catch {
      res.send(twiml(`PLZ ${newZip} aktualisiert! Womit kann ich helfen?`));
    }
    return;
  }

  // Greeting
  if (intentResult.intent === 'greeting') {
    res.send(twiml(`Hallo! 😊 Deine PLZ ist *${session.zip}*. Frag mich gerne nach Abholterminen – z.B. \"Wann kommt der Kehricht?\"`));
    return;
  }

  // Waste collection query
  if (intentResult.intent === 'ask_collection' || intentResult.intent === 'ask_specific_type') {
    let collections;
    try {
      collections = await fetchUpcoming(session.zip);
    } catch (err) {
      console.error('OpenERZ error:', err);
      res.send(twiml('Entschuldigung, die Abfalldaten konnten gerade nicht abgerufen werden. Bitte versuch es später nochmal.'));
      return;
    }

    // Filter by type if specific type was requested
    if (intentResult.wasteTypes && intentResult.wasteTypes.length > 0) {
      collections = collections.filter((c) => intentResult.wasteTypes!.includes(c.waste_type));
    }

    if (collections.length === 0) {
      res.send(twiml(MSG_NO_DATA));
      return;
    }

    try {
      const answer = await generateAnswer(body, collections, session.zip);
      res.send(twiml(answer));
    } catch (err) {
      console.error('generateAnswer error:', err);
      // Fallback: plain text summary
      const { formatCollectionSummary } = await import('../utils/formatter.js');
      res.send(twiml(`Nächste Abholtermine für PLZ ${session.zip}:\n\n${formatCollectionSummary(collections)}`));
    }
    return;
  }

  // Other / unknown
  res.send(twiml(MSG_OTHER));
});
