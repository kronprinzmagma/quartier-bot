export interface Session {
  zip: string | null;
  lastActive: Date;
}

const store = new Map<string, Session>();

export function getSession(phone: string): Session {
  if (!store.has(phone)) {
    store.set(phone, { zip: null, lastActive: new Date() });
  }
  const session = store.get(phone)!;
  session.lastActive = new Date();
  return session;
}

export function setZip(phone: string, zip: string): void {
  const session = getSession(phone);
  session.zip = zip;
}
