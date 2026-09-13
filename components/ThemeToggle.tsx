"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("tapdesk-theme");
    const isDark = stored
      ? stored === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("tapdesk-theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      aria-label="Ganti tema"
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-text-dim transition hover:border-blue hover:text-blue dark:border-line-dark dark:text-text-invert/70 dark:hover:border-blue dark:hover:text-blue"
    >
      {dark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M20.5 14.5a8.5 8.5 0 1 1-9-11.9 7 7 0 0 0 9 11.9Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
