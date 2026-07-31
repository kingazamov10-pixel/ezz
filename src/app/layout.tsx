import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "IELTS Simulator Pro — 4 Sections with AI Feedback",
  description:
    "Complete IELTS practice test: Listening, Reading, Writing, and Speaking with AI-powered feedback and band scoring.",
};

const NAV = [
  { href: "/", label: "Home" },
  { href: "/listening", label: "🎧 Listening" },
  { href: "/reading", label: "Reading" },
  { href: "/writing", label: "Writing" },
  { href: "/speaking", label: "Speaking" },
  { href: "/results", label: "Results" },
  { href: "/admin", label: "👑 Admin" },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link href="/" className="group flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-600 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <span className="text-lg font-black tracking-tight">IS</span>
              </span>
              <div className="leading-tight">
                <p className="text-sm font-extrabold text-slate-900 tracking-tight">IELTS Pro</p>
                <p className="text-[11px] font-medium text-indigo-600">AI Simulator</p>
              </div>
            </Link>
            <nav className="flex flex-wrap items-center gap-1 sm:gap-2">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-100/85 hover:text-indigo-600"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>

        <footer className="border-t border-slate-200/85 bg-white/50 backdrop-blur-sm mt-16">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 IELTS Simulator Pro. All rights reserved.</p>
            <p className="flex items-center gap-2">
              <span>Powered by Next.js & Google Gemini AI</span>
              <span>•</span>
              <span className="text-emerald-600 font-semibold">● Supabase Cloud DB</span>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
