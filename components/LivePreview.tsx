"use client";

import { useEffect, useState } from "react";

type Row = {
  id: number;
  method: string;
  url: string;
  status: number;
  duration: number;
};

const SAMPLE: Omit<Row, "id">[] = [
  { method: "GET", url: "/api/user/session", status: 200, duration: 42 },
  { method: "POST", url: "/api/cart/add", status: 201, duration: 118 },
  { method: "GET", url: "/api/products?page=2", status: 200, duration: 76 },
  { method: "GET", url: "/api/promo/check", status: 404, duration: 33 },
  { method: "PATCH", url: "/api/user/address", status: 200, duration: 95 },
  { method: "GET", url: "/api/inventory/812", status: 200, duration: 51 },
  { method: "POST", url: "/api/analytics/ping", status: 500, duration: 210 },
  { method: "GET", url: "/api/cart", status: 200, duration: 28 },
];

const TABS = ["Network", "Console", "Source", "Resource", "System"];

function statusColor(status: number) {
  if (status >= 500) return "text-red-400";
  if (status >= 400) return "text-amber-400";
  return "text-emerald-400";
}

export default function LivePreview() {
  const [rows, setRows] = useState<Row[]>([]);
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCursor((c) => {
        const next = SAMPLE[c % SAMPLE.length];
        setRows((prev) => [...prev.slice(-5), { ...next, id: c }]);
        return c + 1;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-sm overflow-hidden rounded-lg border border-line-dark bg-ink text-text-invert shadow-2xl shadow-blue/10">
      <div className="flex items-center justify-between border-b border-line-dark px-3 py-2">
        <span className="font-mono text-xs font-semibold">tapdesk</span>
        <span className="h-2 w-2 rounded-full bg-blue" />
      </div>
      <div className="flex border-b border-line-dark">
        {TABS.map((tab, i) => (
          <span
            key={tab}
            className={`flex-1 px-1 py-1.5 text-center font-mono text-[9px] tracking-tight ${
              i === 0
                ? "border-b-2 border-blue text-text-invert"
                : "text-text-invert/40"
            }`}
          >
            {tab}
          </span>
        ))}
      </div>
      <div className="h-44 overflow-hidden">
        {rows.length === 0 && (
          <p className="p-4 font-mono text-[10px] text-text-invert/40">
            menunggu request…
          </p>
        )}
        {rows.map((r) => (
          <div
            key={r.id}
            className="animate-rise-in flex items-center gap-2 border-b border-line-dark/60 px-3 py-1.5 font-mono text-[10px]"
          >
            <span className="w-8 shrink-0 text-text-invert/40">
              {r.method}
            </span>
            <span className="flex-1 truncate text-text-invert/70">
              {r.url}
            </span>
            <span className={`w-7 shrink-0 text-right ${statusColor(r.status)}`}>
              {r.status}
            </span>
            <span className="w-10 shrink-0 text-right text-text-invert/40">
              {r.duration}ms
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
