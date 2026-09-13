"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Particles from "@/components/Particles";
import Reveal from "@/components/Reveal";
import ThemeToggle from "@/components/ThemeToggle";

function greeting(hour: number) {
  if (hour >= 5 && hour < 11) return "Selamat pagi";
  if (hour >= 11 && hour < 15) return "Selamat siang";
  if (hour >= 15 && hour < 18) return "Selamat sore";
  return "Selamat malam";
}

export default function LandingPage() {
  const router = useRouter();
  const [greet, setGreet] = useState("Halo");

  useEffect(() => {
    setGreet(greeting(new Date().getHours()));
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-40 dark:opacity-20" />
      <div className="relative">
        <Particles />
      </div>

      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 font-mono text-sm font-medium">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue text-[11px] text-white">
            td
          </span>
          tapdesk
        </div>
        <ThemeToggle />
      </header>

      <section className="relative z-10 mx-auto grid max-w-5xl gap-12 px-6 pb-24 pt-10 md:grid-cols-[1.1fr_0.9fr] md:pt-16">
        <div>
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-wide text-blue">
              {greet}
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.15] tracking-tight md:text-5xl">
              Devtools kecil yang kamu
              <br />
              tempel ke halaman sendiri.
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-5 max-w-md text-text-dim">
              tapdesk taruh satu tombol bulat di halaman yang sedang kamu uji.
              Klik, dan kamu dapat network log, console, dan info dasar —
              tanpa buka F12, tanpa remote device.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <button
              onClick={() => router.push("/gate")}
              className="mt-8 rounded-lg bg-blue px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-dark"
            >
              Aktifkan Tap
            </button>
          </Reveal>
          <Reveal delay={300}>
            <p className="mt-4 text-xs text-text-dim">
              Hanya menangkap fetch/XHR di halaman tempat script dipasang.
              Tidak melihat all network HP/laptop.
            </p>
          </Reveal>
        </div>

        <div className="flex flex-col justify-center">
          <ol className="space-y-6">
            {[
              {
                n: "1",
                title: "Aktifkan",
                desc: "Masuk lewat gate ringan, sistem membuat satu sessionId.",
              },
              {
                n: "2",
                title: "Salin snippet",
                desc: "Satu baris <script>, atau tarik bookmarklet ke bilah bookmark.",
              },
              {
                n: "3",
                title: "Tempel di halaman yang diuji",
                desc: "Tombol biru muncul di pojok. Klik untuk buka panel.",
              },
            ].map((step, i) => (
              <Reveal key={step.n} delay={i * 100}>
                <div className="step-rule pl-4">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-sm text-blue">
                      {step.n}
                    </span>
                    <h3 className="font-medium">{step.title}</h3>
                  </div>
                  <p className="mt-1 text-sm text-text-dim">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </ol>

          <Reveal delay={320}>
            <div className="mt-8 rounded-lg border border-line bg-paper-dim p-4 font-mono text-xs text-text-dim dark:border-line-dark dark:bg-ink-dim">
              <span className="text-blue">$</span> tempel satu baris, panel
              muncul di halaman kamu dalam &lt;1 detik.
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="relative z-10 mx-auto max-w-5xl px-6 pb-10 text-xs text-text-dim">
        tapdesk bukan proxy device, bukan crack, bukan aktivator lisensi. Alat
        debug untuk halaman milikmu sendiri.
      </footer>
    </main>
  );
}
