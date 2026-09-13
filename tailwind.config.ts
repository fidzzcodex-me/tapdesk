import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FFFFFF",
        "paper-dim": "#F4F6F9",
        ink: "#0E1116",
        "ink-dim": "#151920",
        text: "#12161C",
        "text-dim": "#5B6472",
        "text-invert": "#E7EBF2",
        line: "#DEE3EA",
        "line-dark": "#242A33",
        blue: "#2F6FED",
        "blue-dim": "#E8EEFC",
        "blue-dark": "#1F4FBF",
      },
      fontFamily: {
        sans: ["var(--font-plex-sans)", "ui-sans-serif", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        lg: "10px",
      },
      keyframes: {
        "rise-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "rise-in": "rise-in 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
