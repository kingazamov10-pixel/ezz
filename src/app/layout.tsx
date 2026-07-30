import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "IELTS Simulator — 4 Sections with AI Feedback",
  description:
    "Complete IELTS practice test: Listening, Reading, Writing, and Speaking with AI-powered feedback and band scoring.",
};

const NAV = [
  { href: "/", label: "Home" },
  { href: "/listening", label: "🎧 Listening" },
  { href: "/reading", label: "📖 Reading" },
  { href: "/writing", label: "✍️ Writing" },
  { href: "/speaking", label: "🎤 Speaking" },
  { href: "/results", label: "📊 Results" },
  { href: "/admin", label: "👑 Admin" },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="text-slate-900 antialiased">
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <span className="text-lg font-bold">IE</span>
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-slate-900">IELTS Simulator</p>
                <p className="text-[11px] text-slate-500">AI-powered practice</p>
              </div>
            </Link>
            <nav className="flex flex-wrap items-center gap-1">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-slate-500">
          Built for IELTS practice. Not affiliated with the British Council or IDP.
        </footer>
      </body>
    </html>
  );
}
