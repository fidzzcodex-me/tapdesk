"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

type Phase = "memorize" | "recall" | "wrong" | "loading";

function makeCode() {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join(
    ""
  );
}

export default function GatePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("memorize");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCode(makeCode());
  }, []);

  useEffect(() => {
    if (phase !== "memorize") return;
    const t = setTimeout(() => setPhase("recall"), 2200);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase === "recall") inputRef.current?.focus();
  }, [phase]);

  function submit() {
    if (input === code) {
      setPhase("loading");
      const delay = 2000 + Math.random() * 1000;
      setTimeout(() => router.push("/dashboard"), delay);
    } else {
      setPhase("wrong");
      setTimeout(() => {
        setCode(makeCode());
        setInput("");
        setPhase("memorize");
      }, 900);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-xs text-center">
        <p className="font-mono text-xs uppercase tracking-wide text-blue">
          gate
        </p>

        {phase === "memorize" && (
          <>
            <h1 className="mt-4 text-sm text-text-dim">Ingat kode ini</h1>
            <div
              key={code}
              className="mt-6 animate-rise-in font-mono text-5xl font-semibold tracking-[0.3em] text-text"
            >
              {code}
            </div>
            <p className="mt-6 text-xs text-text-dim">hilang dalam sesaat…</p>
          </>
        )}

        {(phase === "recall" || phase === "wrong") && (
          <>
            <h1 className="mt-4 text-sm text-text-dim">
              Ketik ulang kodenya
            </h1>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) =>
                setInput(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              onKeyDown={(e) => e.key === "Enter" && input.length === 4 && submit()}
              inputMode="numeric"
              className="mt-6 w-full rounded-lg border border-line bg-paper-dim px-4 py-3 text-center font-mono text-3xl tracking-[0.4em] outline-none focus:border-blue dark:border-line-dark dark:bg-ink-dim"
              maxLength={4}
              autoFocus
            />
            {phase === "wrong" && (
              <p className="mt-3 text-xs text-blue">meleset, kode baru dibuat</p>
            )}
            <button
              onClick={submit}
              disabled={input.length !== 4}
              className="mt-6 w-full rounded-lg bg-blue px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-dark disabled:opacity-30"
            >
              Masuk
            </button>
          </>
        )}

        {phase === "loading" && (
          <div className="mt-10 flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-blue dark:border-line-dark" />
            <p className="font-mono text-xs text-text-dim">
              menyiapkan sesi…
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
