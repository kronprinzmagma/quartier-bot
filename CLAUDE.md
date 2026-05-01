# quartier-bot

WhatsApp-Bot für lokale Nachbarschaftskommunikation. Ermöglicht einfache Gruppen-Interaktionen, Admin-Ankündigungen und erweiterbare Befehls-Handler für Nachbarschaftsinitiativen und Quartiersprojekte.

## Stack

- **Runtime:** Node.js ≥ 18, TypeScript
- **WhatsApp-Client:** `whatsapp-web.js` (Multi-Device, Session via LocalAuth)
- **Einstiegspunkt:** `src/index.ts`

## Projektstruktur

```
src/
  bot/
    handlers/   # Ein Handler pro Befehl
    middleware/ # Querschnittsfunktionen (z.B. isAdmin)
    index.ts    # Handler-Registrierung
  services/
    whatsapp.ts # Client-Factory
  config/
    index.ts    # Zentrale Konfiguration (aus .env)
  index.ts      # App-Einstiegspunkt
tests/          # Jest-Tests
docs/           # Erweiterte Dokumentation
```

## Konfiguration

Kopiere `.env.example` nach `.env` und trage deine Werte ein.  
Pflichtfelder: `ADMIN_NUMBERS` (kommagetrennte Rufnummern ohne `+`).

## Starten

```bash
npm install
npm run dev   # Entwicklung (ts-node)
npm run build && npm start  # Produktion
```

Beim ersten Start wird ein QR-Code im Terminal angezeigt – mit WhatsApp scannen.

## Neue Befehle hinzufügen

1. Handler in `src/bot/handlers/<befehl>.ts` anlegen
2. In `src/bot/index.ts` registrieren
3. Hilfetext in `src/bot/handlers/help.ts` ergänzen
