// Penyimpanan in-memory. Cukup untuk dev/demo satu proses.
// Untuk produksi, ganti dengan Redis/DB — struktur data sudah dipisah di sini
// supaya gampang diganti.

export type TapEvent = {
  id: string;
  type: "network" | "console";
  method?: string;
  url?: string;
  status?: number;
  duration?: number;
  level?: "log" | "warn" | "error";
  message?: string;
  timestamp: number;
};

export type TapSession = {
  id: string;
  createdAt: number;
  active: boolean;
  events: TapEvent[];
};

type Store = {
  sessions: Map<string, TapSession>;
};

const globalForStore = globalThis as unknown as { __tapdeskStore?: Store };

export const store: Store =
  globalForStore.__tapdeskStore ??
  (globalForStore.__tapdeskStore = { sessions: new Map() });

const MAX_EVENTS_PER_SESSION = 300;

export function createSession(): TapSession {
  const id = generateId();
  const session: TapSession = {
    id,
    createdAt: Date.now(),
    active: true,
    events: [],
  };
  store.sessions.set(id, session);
  return session;
}

export function getSession(id: string): TapSession | undefined {
  return store.sessions.get(id);
}

export function pushEvent(id: string, event: Omit<TapEvent, "id">): TapSession | null {
  const session = store.sessions.get(id);
  if (!session || !session.active) return null;
  session.events.push({ ...event, id: generateId() });
  if (session.events.length > MAX_EVENTS_PER_SESSION) {
    session.events.splice(0, session.events.length - MAX_EVENTS_PER_SESSION);
  }
  return session;
}

export function deactivateSession(id: string): TapSession | undefined {
  const session = store.sessions.get(id);
  if (session) session.active = false;
  return session;
}

function generateId(): string {
  return Array.from({ length: 16 }, () =>
    "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]
  ).join("");
}
