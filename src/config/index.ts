import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN ?? '',
};
