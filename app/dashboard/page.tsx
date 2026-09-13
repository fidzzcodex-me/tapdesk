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

function statusColor(status?: number) {
  if (!status) return "text-red-500";
  if (status >= 500) return "text-red-500";
  if (status >= 400) return "text-amber-500";
  return "text-emerald-500";
}

function elapsed(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const rs = s % 60;
  return `${String(m).padStart(2, "0")}:${String(rs).padStart(2, "0")}`;
}

export default function DashboardPage() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [active, setActive] = useState(true);
  const [createdAt, setCreatedAt] = useState<number | null>(null);
  const [events, setEvents] = useState<TapEvent[]>([]);
  const [now, setNow] = useState(Date.now());
  const [copied, setCopied] = useState<"snippet" | "bookmarklet" | null>(null);
  const [previewTab, setPreviewTab] = useState<"network" | "console">("network");
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
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!session) return;
    async function poll() {
      if (!session) return;
      const res = await fetch(`/api/tap/${session.sessionId}`);
      if (!res.ok) return;
      const data = await res.json();
      setActive(data.active);
      setCreatedAt(data.createdAt ?? null);
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

  const networkEvents = events.filter((e) => e.type === "network");
  const consoleEvents = events.filter((e) => e.type === "console");
  const list = previewTab === "network" ? networkEvents : consoleEvents;

  return (
    <main className="mx-auto min-h-screen max-w-4xl overflow-x-hidden px-6 py-10">
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
        <div className="mt-10 grid gap-6 md:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <div className="min-w-0 space-y-6">
            <Reveal>
              <div className="rounded-lg border border-line p-4 dark:border-line-dark">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    {active && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue opacity-60" />
                    )}
                    <span
                      className={`relative inline-flex h-2 w-2 rounded-full ${
                        active ? "bg-blue" : "bg-text-dim/40"
                      }`}
                    />
                  </span>
                  <span className="font-mono text-xs">
                    {active ? "hidup" : "mati"}
                  </span>
                  {createdAt && (
                    <span className="ml-auto font-mono text-[11px] text-text-dim">
                      {elapsed(now - createdAt)}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-xs text-text-dim">sessionId</p>
                <p className="break-all font-mono text-xs">
                  {session.sessionId}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-3 text-center dark:border-line-dark">
                  <div>
                    <p className="font-mono text-lg font-semibold">
                      {networkEvents.length}
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-text-dim">
                      network
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-lg font-semibold">
                      {consoleEvents.length}
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-text-dim">
                      console
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div className="rounded-lg border border-line p-4 dark:border-line-dark">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Kirim ke dashboard</p>
                  <button
                    onClick={toggleSync}
                    className={`h-6 w-11 rounded-full transition ${
                      active ? "bg-blue" : "bg-line dark:bg-line-dark"
                    }`}
                    aria-label="toggle sync"
                  >
                    <span
                      className={`block h-4 w-4 translate-y-1 rounded-full bg-white transition ${
                        active ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <p className="mt-2 text-xs text-text-dim">
                  Kalau mati, panel di halaman tetap jalan tapi berhenti
                  mengirim salinan ke sini.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Main */}
          <div className="min-w-0 space-y-6">
            <Reveal>
              <div className="rounded-lg border border-line p-4 dark:border-line-dark">
                <p className="mb-2 text-sm font-medium">Snippet</p>
                <div className="rounded-lg bg-paper-dim p-3 dark:bg-ink-dim">
                  <code className="block max-w-full overflow-x-auto whitespace-pre font-mono text-xs text-text-dim">
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

            <Reveal delay={60}>
              <div className="rounded-lg border border-line p-4 dark:border-line-dark">
                <p className="mb-1 text-sm font-medium">Bookmarklet</p>
                <p className="mb-3 text-xs text-text-dim">
                  Tarik ke bilah bookmark browser.
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

            <Reveal delay={120}>
              <div className="overflow-hidden rounded-lg border border-line-dark bg-ink text-text-invert">
                <div className="flex items-center justify-between border-b border-line-dark px-4 py-2">
                  <span className="font-mono text-xs font-semibold">
                    preview langsung
                  </span>
                  <div className="flex gap-1">
                    {(["network", "console"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setPreviewTab(tab)}
                        className={`rounded px-2 py-1 font-mono text-[10px] capitalize ${
                          previewTab === tab
                            ? "bg-blue text-white"
                            : "text-text-invert/50 hover:text-text-invert"
                        }`}
                      >
                        {tab} ({tab === "network" ? networkEvents.length : consoleEvents.length})
                      </button>
                    ))}
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {list.length === 0 ? (
                    <p className="p-4 font-mono text-xs text-text-invert/40">
                      Belum ada event. Tempel snippet di halaman yang diuji,
                      lalu lakukan sesuatu di sana.
                    </p>
                  ) : (
                    [...list].reverse().map((ev) => (
                      <div
                        key={ev.id}
                        className="animate-rise-in flex items-center gap-2 border-b border-line-dark/60 px-4 py-2 font-mono text-[11px]"
                      >
                        {ev.type === "network" ? (
                          <>
                            <span className="w-10 shrink-0 text-text-invert/40">
                              {ev.method}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-text-invert/70">
                              {ev.url}
                            </span>
                            <span className={`shrink-0 ${statusColor(ev.status)}`}>
                              {ev.status}
                            </span>
                          </>
                        ) : (
                          <span className="min-w-0 flex-1 truncate text-text-invert/70">
                            [{ev.level}] {ev.message}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      )}
    </main>
  );
}
