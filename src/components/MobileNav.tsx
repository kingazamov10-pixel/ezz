"use client";

import { useState } from "react";
import Link from "next/link";

const NAV = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/listening", label: "Listening", icon: "🎧" },
  { href: "/reading", label: "Reading", icon: "📖" },
  { href: "/writing", label: "Writing", icon: "✍️" },
  { href: "/speaking", label: "Speaking", icon: "🎤" },
  { href: "/results", label: "Results", icon: "📊" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden flex items-center">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 focus:outline-none"
        aria-label="Toggle menu"
      >
        <span className="text-xl">{open ? "✕" : "☰"}</span>
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b border-slate-200 bg-white/95 backdrop-blur-xl p-4 shadow-xl transition-all">
          <nav className="flex flex-col gap-2">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <span className="text-lg">{n.icon}</span>
                <span>{n.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
