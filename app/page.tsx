"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Particles from "@/components/Particles";
import Reveal from "@/components/Reveal";
import ThemeToggle from "@/components/ThemeToggle";
import LivePreview from "@/components/LivePreview";

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

      <section className="relative z-10 mx-auto max-w-5xl border-t border-line px-6 py-16 dark:border-line-dark md:grid md:grid-cols-[0.9fr_1.1fr] md:items-center md:gap-14">
        <div>
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-wide text-blue">
              lihat sendiri
            </p>
          </Reveal>
          <Reveal delay={60}>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              Ini bukan mockup. Ini panelnya.
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-3 max-w-sm text-sm text-text-dim">
              Simulasi di samping meniru persis tampilan panel yang muncul di
              halamanmu: baris request datang satu per satu, method, status,
              durasi. Coba yang asli di halaman{" "}
              <code className="rounded bg-paper-dim px-1 py-0.5 font-mono text-xs dark:bg-ink-dim">
                /demo
              </code>
              .
            </p>
          </Reveal>
        </div>
        <Reveal delay={160} className="mt-8 flex justify-center md:mt-0">
          <LivePreview />
        </Reveal>
      </section>

      <section className="relative z-10 mx-auto max-w-5xl border-t border-line px-6 py-16 dark:border-line-dark">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-wide text-blue">
            lima tab
          </p>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="mt-3 max-w-md text-2xl font-semibold tracking-tight">
            Semua yang kamu cek manual di F12, dikumpulkan di satu tombol.
          </h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-5">
          {[
            {
              t: "Network",
              d: "Method, url, status, durasi. Klik satu baris untuk detail header dan body.",
            },
            {
              t: "Console",
              d: "log/warn/error apa adanya, tanpa disaring.",
            },
            {
              t: "Source",
              d: "HTML halaman saat ini, siap disalin.",
            },
            {
              t: "Resource",
              d: "Local storage, session storage, cookie.",
            },
            {
              t: "System",
              d: "UA, viewport, koneksi, dan tombol matikan panel.",
            },
          ].map((tab, i) => (
            <Reveal key={tab.t} delay={i * 70}>
              <div className="border-t-2 border-blue pt-3">
                <h3 className="font-mono text-sm font-medium">{tab.t}</h3>
                <p className="mt-1 text-xs leading-relaxed text-text-dim">
                  {tab.d}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-5xl border-t border-line px-6 py-16 dark:border-line-dark">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-wide text-blue">
            dibanding buka f12
          </p>
        </Reveal>
        <div className="mt-8 grid gap-8 md:grid-cols-2 md:divide-x md:divide-line md:dark:divide-line-dark">
          <Reveal delay={60}>
            <div className="md:pr-8">
              <h3 className="text-sm font-medium text-text-dim">
                Cara biasa
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-text-dim">
                <li>Buka DevTools, cari tab Network di antara belasan tab lain.</li>
                <li>Console dan Network di panel terpisah, harus bolak-balik.</li>
                <li>Susah ditunjukkan ke orang lain lewat layar HP.</li>
                <li>Tidak bisa dipasang di halaman yang lagi dibuka orang lain untuk dites bareng.</li>
              </ul>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="md:pl-8">
              <h3 className="text-sm font-medium text-blue">Dengan tapdesk</h3>
              <ul className="mt-3 space-y-2 text-sm text-text-dim">
                <li>Satu tombol bulat, satu klik, semua tab di satu tempat.</li>
                <li>Jalan di HP juga — tidak butuh keyboard atau F12.</li>
                <li>Satu baris script, tempel di halaman siapa pun yang kamu uji.</li>
                <li>Opsional disinkron ke dashboard supaya bisa dipantau dari perangkat lain.</li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="relative z-10 mx-auto max-w-5xl px-6 pb-10 pt-6 text-xs text-text-dim">
        tapdesk bukan proxy device, bukan crack, bukan aktivator lisensi. Alat
        debug untuk halaman milikmu sendiri.
      </footer>
    </main>
  );
}
