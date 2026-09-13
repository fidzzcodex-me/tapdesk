"use client";

import { useEffect, useRef, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import Reveal from "@/components/Reveal";

type SessionData = {
  sessionId: string;
  snippet: string;
  bookmarklet: string;
};

type TapEvent = {
  id: string;
  type: "network" | "console";
  method?: string;
  url?: string;
  status?: number;
  duration?: number;
  level?: string;
  message?: string;
  timestamp: number;
};

export default function DashboardPage() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [active, setActive] = useState(true);
  const [events, setEvents] = useState<TapEvent[]>([]);
  const [copied, setCopied] = useState<"snippet" | "bookmarklet" | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/session", { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setSession(data);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    async function poll() {
      if (!session) return;
      const res = await fetch(`/api/tap/${session.sessionId}`);
      if (!res.ok) return;
      const data = await res.json();
      setActive(data.active);
      setEvents(data.events ?? []);
    }
    poll();
    pollRef.current = setInterval(poll, 2000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [session]);

  async function toggleSync() {
    if (!session) return;
    const method = active ? "DELETE" : "PATCH";
    const res = await fetch(`/api/tap/${session.sessionId}`, { method });
    if (res.ok) {
      const data = await res.json();
      setActive(data.active);
    }
  }

  function copy(text: string, which: "snippet" | "bookmarklet") {
    navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-sm font-medium">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue text-[11px] text-white">
            td
          </span>
          tapdesk / dashboard
        </div>
        <ThemeToggle />
      </header>

      {!session ? (
        <p className="mt-10 font-mono text-sm text-text-dim">
          menyiapkan sesi…
        </p>
      ) : (
        <div className="mt-10 space-y-8">
          <Reveal>
            <div className="flex items-center justify-between rounded-lg border border-line p-4 dark:border-line-dark">
              <div>
                <p className="text-xs text-text-dim">sessionId</p>
                <p className="font-mono text-sm">{session.sessionId}</p>
              </div>
              <span
                className={`rounded-lg px-3 py-1 font-mono text-xs ${
                  active
                    ? "bg-blue-dim text-blue-dark dark:bg-blue/10 dark:text-blue"
                    : "bg-paper-dim text-text-dim dark:bg-ink-dim"
                }`}
              >
                {active ? "hidup" : "mati"}
              </span>
            </div>
          </Reveal>

          <Reveal delay={60}>
            <div>
              <p className="mb-2 text-sm font-medium">Snippet</p>
              <div className="rounded-lg border border-line bg-paper-dim p-4 dark:border-line-dark dark:bg-ink-dim">
                <code className="block overflow-x-auto whitespace-pre font-mono text-xs text-text-dim">
                  {session.snippet}
                </code>
              </div>
              <button
                onClick={() => copy(session.snippet, "snippet")}
                className="mt-2 rounded-lg border border-line px-3 py-1.5 text-xs font-medium transition hover:border-blue hover:text-blue dark:border-line-dark"
              >
                {copied === "snippet" ? "tersalin" : "salin snippet"}
              </button>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div>
              <p className="mb-2 text-sm font-medium">Bookmarklet</p>
              <p className="mb-2 text-xs text-text-dim">
                Tarik tombol ini ke bilah bookmark browser.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={session.bookmarklet}
                  onClick={(e) => e.preventDefault()}
                  className="cursor-grab rounded-lg bg-blue px-4 py-2 text-xs font-medium text-white active:cursor-grabbing"
                >
                  tapdesk
                </a>
                <button
                  onClick={() => copy(session.bookmarklet, "bookmarklet")}
                  className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium transition hover:border-blue hover:text-blue dark:border-line-dark"
                >
                  {copied === "bookmarklet" ? "tersalin" : "salin tautan"}
                </button>
              </div>
            </div>
          </Reveal>

          <Reveal delay={180}>
            <div className="flex items-center justify-between rounded-lg border border-line p-4 dark:border-line-dark">
              <div>
                <p className="text-sm font-medium">Kirim salinan ke dashboard</p>
                <p className="text-xs text-text-dim">
                  Kalau mati, panel tetap jalan di halaman tapi tidak
                  mengirim apa pun ke sini.
                </p>
              </div>
              <button
                onClick={toggleSync}
                className={`h-7 w-12 rounded-full transition ${
                  active ? "bg-blue" : "bg-line dark:bg-line-dark"
                }`}
                aria-label="toggle sync"
              >
                <span
                  className={`block h-5 w-5 translate-y-1 rounded-full bg-white transition ${
                    active ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </Reveal>

          <Reveal delay={240}>
            <div>
              <p className="mb-2 text-sm font-medium">
                Preview event ({events.length})
              </p>
              <div className="max-h-72 overflow-y-auto rounded-lg border border-line dark:border-line-dark">
                {events.length === 0 ? (
                  <p className="p-4 text-xs text-text-dim">
                    Belum ada event masuk. Tempel snippet di halaman yang
                    diuji lalu lakukan sesuatu di sana.
                  </p>
                ) : (
                  <ul className="divide-y divide-line dark:divide-line-dark">
                    {[...events].reverse().map((ev) => (
                      <li
                        key={ev.id}
                        className="flex items-center justify-between px-4 py-2 font-mono text-xs"
                      >
                        <span className="truncate text-text-dim">
                          {ev.type === "network"
                            ? `${ev.method} ${ev.url}`
                            : `[${ev.level}] ${ev.message}`}
                        </span>
                        {ev.type === "network" && (
                          <span className="ml-3 shrink-0 text-blue">
                            {ev.status}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      )}
    </main>
  );
}
