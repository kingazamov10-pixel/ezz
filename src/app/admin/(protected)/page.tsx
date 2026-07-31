import Link from "next/link";
import { db } from "@/db";
import {
  listeningTests,
  readingTests,
  writingTasks,
  speakingPrompts,
  attempts,
} from "@/db/schema";
import { count } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [l] = await db.select({ n: count() }).from(listeningTests);
  const [r] = await db.select({ n: count() }).from(readingTests);
  const [w] = await db.select({ n: count() }).from(writingTasks);
  const [s] = await db.select({ n: count() }).from(speakingPrompts);
  const [a] = await db.select({ n: count() }).from(attempts);

  const counts: Record<string, number> = {
    listening: l.n,
    reading: r.n,
    writing: w.n,
    speaking: s.n,
  };

  const CARDS = [
    {
      href: "/admin/listening",
      title: "Listening Tests",
      icon: "🎧",
      color: "from-sky-500 to-cyan-500",
      table: "listening",
    },
    {
      href: "/admin/reading",
      title: "Reading Passages",
      icon: "📖",
      color: "from-emerald-500 to-teal-500",
      table: "reading",
    },
    {
      href: "/admin/writing",
      title: "Writing Tasks",
      icon: "✍️",
      color: "from-fuchsia-500 to-pink-500",
      table: "writing",
    },
    {
      href: "/admin/speaking",
      title: "Speaking Prompts",
      icon: "🎤",
      color: "from-amber-500 to-orange-500",
      table: "speaking",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">👑 Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage all IELTS content — add, edit, or remove tests, passages, and prompts.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${c.color}`} />
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{c.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{c.title}</h3>
                  <p className="text-xs text-slate-500">
                    {counts[c.table]} record{counts[c.table] === 1 ? "" : "s"} in database
                  </p>
                </div>
              </div>
              <span className="text-slate-300 group-hover:text-indigo-500">→</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-indigo-600 font-bold">Total Attempts</p>
          <p className="mt-1 text-3xl font-bold text-indigo-950">{a.n}</p>
          <p className="text-xs text-indigo-700 mt-0.5">Student submissions across all sections</p>
        </div>
        <Link
          href="/results"
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
        >
          View all results →
        </Link>
      </div>
    </div>
  );
}
