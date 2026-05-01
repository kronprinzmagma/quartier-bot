import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { config } from '../config';

export function createClient(): Client {
  const client = new Client({
    authStrategy: new LocalAuth({ dataPath: config.bot.sessionPath }),
    puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] },
  });

  client.on('qr', (qr) => {
    console.log('Scan diesen QR-Code mit WhatsApp:');
    qrcode.generate(qr, { small: true });
  });

  client.on('authenticated', () => {
    console.log('WhatsApp-Session authentifiziert');
  });

  client.on('auth_failure', (msg) => {
    console.error('Authentifizierung fehlgeschlagen:', msg);
    process.exit(1);
  });

  client.on('ready', () => {
    console.log(`${config.bot.name} ist bereit`);
  });

  client.on('disconnected', (reason) => {
    console.warn('Client getrennt:', reason);
  });

  return client;
}
