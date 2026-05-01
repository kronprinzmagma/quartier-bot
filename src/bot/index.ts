import { Client, Message } from 'whatsapp-web.js';
import { handleHelp } from './handlers/help';
import { isAdmin } from './middleware/isAdmin';

export function registerHandlers(client: Client): void {
  client.on('message', async (msg: Message) => {
    const body = msg.body.trim().toLowerCase();

    if (body === '!hilfe' || body === '!help') {
      await handleHelp(msg);
      return;
    }

    if (body === '!info') {
      await msg.reply('QuartierBot – dein lokaler Nachbarschafts-Assistent.');
      return;
    }

    if (body.startsWith('!ankündigung') && isAdmin(msg)) {
      const text = msg.body.slice('!ankündigung'.length).trim();
      if (text) {
        const chat = await msg.getChat();
        await chat.sendMessage(`📢 *Ankündigung:*\n\n${text}`);
      }
      return;
    }
  });
}
