import dotenv from 'dotenv';

dotenv.config();

export const config = {
  bot: {
    name: process.env.BOT_NAME ?? 'QuartierBot',
    adminNumbers: (process.env.ADMIN_NUMBERS ?? '').split(',').filter(Boolean),
    sessionPath: process.env.SESSION_PATH ?? './.wwebjs_auth',
  },
  api: {
    port: parseInt(process.env.API_PORT ?? '3000', 10),
    secret: process.env.API_SECRET ?? '',
  },
  webhook: {
    url: process.env.WEBHOOK_URL ?? '',
    secret: process.env.WEBHOOK_SECRET ?? '',
  },
  logLevel: process.env.LOG_LEVEL ?? 'info',
};
