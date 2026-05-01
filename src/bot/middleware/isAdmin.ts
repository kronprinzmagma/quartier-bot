import { Message } from 'whatsapp-web.js';
import { config } from '../../config';

export function isAdmin(msg: Message): boolean {
  const sender = msg.from.replace('@c.us', '').replace('+', '');
  return config.bot.adminNumbers.some((n) => n.replace('+', '') === sender);
}
