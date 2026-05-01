import { Message } from 'whatsapp-web.js';

const HELP_TEXT = `*QuartierBot – Befehle*

!hilfe       – Diese Übersicht
!info        – Infos über den Bot
!ankündigung – [Admin] Nachricht an alle senden

Bei Fragen einfach schreiben!`;

export async function handleHelp(msg: Message): Promise<void> {
  await msg.reply(HELP_TEXT);
}
