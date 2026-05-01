# quartier-bot

WhatsApp-Chatbot für das Quartier Manegg/Greencity (PLZ 8041, Zürich).
V1 Kern-Feature: Abfallkalender — Nutzer fragen per WhatsApp nach Abholterminen,
der Bot antwortet auf Deutsch mit echten Daten von der Stadt Zürich.

## Stack

- **Runtime:** Node.js ≥ 18, TypeScript
- **WhatsApp:** Twilio Sandbox (Webhook, kein eigenständiger Client nötig)
- **KI:** Anthropic Claude Haiku (`claude-haiku-4-5`) für natürliche deutsche Antworten
- **Daten:** OpenERZ API (`openerz.metaodi.ch`) – offizielle Zürcher Abfalldaten, kein API-Key nötig
- **Session:** In-Memory-Map pro Telefonnummer (kein DB nötig in V1)

## Architektur

```
WhatsApp-Nutzer
     │  POST (form-encoded)
     ▼
Twilio Sandbox  ──→  POST /webhook
                         │
                    src/routes/webhook.ts
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
       session.ts   openerz.ts  claude.ts
       (ZIP-Store)  (Abfalldata) (Antwort)
```

## Projektstruktur

```
src/
  routes/
    webhook.ts        # Twilio POST-Handler, TwiML-Response
  services/
    claude.ts         # Claude Haiku: Intent-Erkennung + Antworterzeugung
    openerz.ts        # OpenERZ REST-Client (zip → Abholdaten)
    session.ts        # In-Memory-Session pro Telefonnummer
  utils/
    formatter.ts      # Datums-/Textformatierung (Deutsch)
  index.ts            # Express-App
```

## Konfiguration (.env)

```
ANTHROPIC_API_KEY=sk-ant-...
TWILIO_AUTH_TOKEN=...          # Optional: Webhook-Signaturvalidierung
PORT=3000
```

## Starten

```bash
npm install
npm run dev        # ts-node (Entwicklung)
npm run build && npm start  # Produktion
```

Für lokale Tests Twilio-Webhook auf den lokalen Port tunneln (z.B. mit ngrok):
```bash
ngrok http 3000
# → Twilio Sandbox Webhook-URL: https://<ngrok-id>.ngrok.io/webhook
```

## Gesprächsfluss

1. Nutzer schreibt zum ersten Mal → Bot fragt nach PLZ
2. Nutzer nennt PLZ (z.B. "8041") → Bot speichert und bestätigt
3. Nutzer fragt nach Abfallkalender → Bot ruft OpenERZ ab, Claude formuliert Antwort

## OpenERZ API

- Endpoint: `https://openerz.metaodi.ch/api/calendar.json`
- Parameter: `zip`, `types` (waste, paper, cardboard, organic, …), `start`, `end`, `limit`
- Kein API-Key erforderlich
- Abfalltypen für 8041/Zürich: `waste` (Kehricht), `paper` (Altpapier), `cardboard` (Karton), `organic` (Grüngut)

## Neues V1-Feature hinzufügen

1. Neuen Intent in `src/services/claude.ts` → `detectIntent()` ergänzen
2. Handler in `src/routes/webhook.ts` → `handleMessage()` ergänzen
3. Bei Bedarf neuen OpenERZ-Query in `src/services/openerz.ts`
