import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "tapdesk — DevTools yang kamu tempel sendiri",
  description:
    "Panel developer mengambang untuk halaman yang sedang kamu uji. Console, network, dan info dasar — tanpa buka F12.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${plexSans.variable} ${plexMono.variable} font-sans bg-paper text-text antialiased dark:bg-ink dark:text-text-invert transition-colors duration-300`}
      >
        {children}
      </body>
    </html>
  );
}
