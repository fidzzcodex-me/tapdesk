"use client";

import Script from "next/script";

export default function DemoPage() {
  function fireGetOk() {
    fetch("https://jsonplaceholder.typicode.com/todos/1");
  }
  function fireGet404() {
    fetch("https://jsonplaceholder.typicode.com/does-not-exist-xyz");
  }
  function firePost() {
    fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "halo", body: "dari tapdesk demo", userId: 1 }),
    });
  }
  function logStuff() {
    console.log("log biasa dari halaman demo", { angka: 42 });
    console.warn("ini peringatan contoh");
    console.error("ini error contoh, bukan error sungguhan");
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-16 font-sans">
      <p className="font-mono text-xs uppercase tracking-wide text-blue">
        halaman target
      </p>
      <h1 className="mt-3 text-2xl font-semibold">Halaman uji tapdesk</h1>
      <p className="mt-3 max-w-md text-sm text-text-dim">
        Panel di pojok kanan bawah datang dari satu baris script — bukan
        bagian dari halaman ini. Halaman ini sengaja polos: tanpa partikel,
        tanpa tema situs tapdesk, supaya kelihatan jelas mana panel dan mana
        konten asli.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={fireGetOk}
          className="rounded-lg bg-blue px-4 py-2 text-sm font-medium text-white hover:bg-blue-dark"
        >
          Kirim GET sukses
        </button>
        <button
          onClick={fireGet404}
          className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:border-blue hover:text-blue"
        >
          Kirim GET 404
        </button>
        <button
          onClick={firePost}
          className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:border-blue hover:text-blue"
        >
          Kirim POST
        </button>
        <button
          onClick={logStuff}
          className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:border-blue hover:text-blue"
        >
          Tulis ke console
        </button>
      </div>

      <p className="mt-10 text-xs text-text-dim">
        Klik tombol biru bulat di pojok untuk buka panel Network / Console /
        Info / Setting.
      </p>

      <Script
        src="/tapdesk.js"
        data-session="demo-local"
        data-sync="false"
        strategy="afterInteractive"
      />
    </main>
  );
}
