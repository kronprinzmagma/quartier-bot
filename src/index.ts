import express from 'express';
import { config } from './config/index.js';
import { webhookRouter } from './routes/webhook.js';

const app = express();

// Twilio sends form-encoded POST bodies
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/webhook', webhookRouter);

app.listen(config.port, () => {
  console.log(`QuartierBot läuft auf Port ${config.port}`);
  console.log(`Webhook-URL: http://localhost:${config.port}/webhook`);
});
