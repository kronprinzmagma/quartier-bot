import { createClient } from './services/whatsapp';
import { registerHandlers } from './bot';

async function main(): Promise<void> {
  const client = createClient();
  registerHandlers(client);
  await client.initialize();
}

main().catch((err) => {
  console.error('Fataler Fehler:', err);
  process.exit(1);
});
