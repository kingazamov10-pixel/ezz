import Link from "next/link";
import { db } from "@/db";
import { attempts, appSettings } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { readEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

const SECTIONS = [
  {
    href: "/listening",
    title: "Listening",
    icon: "🎧",
    duration: "~10 min",
    description:
      "Listen to a conversation played through your browser's speech synthesis and answer 10 questions.",
    color: "from-sky-500 to-cyan-500",
  },
  {
    href: "/reading",
    title: "Reading",
    icon: "📖",
    duration: "~15 min",
    description:
      "Read an academic passage and answer TRUE/FALSE/NOT GIVEN, multiple choice and completion questions.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    href: "/writing",
    title: "Writing",
    icon: "✍️",
    duration: "60 min",
    description:
      "Complete Task 1 (data description) and Task 2 (essay). Get instant AI feedback on all 4 criteria.",
    color: "from-fuchsia-500 to-pink-500",
  },
  {
    href: "/speaking",
    title: "Speaking",
    icon: "🎤",
    duration: "11–14 min",
    description:
      "Answer Part 1, 2 and 3 prompts using voice or text. Receive AI feedback on fluency, lexis and grammar.",
    color: "from-amber-500 to-orange-500",
  },
];

export default async function HomePage() {
  const [recent, [dbGemini]] = await Promise.all([
    db.select().from(attempts).orderBy(desc(attempts.createdAt)).limit(4),
    db.select().from(appSettings).where(eq(appSettings.key, "GEMINI_API_KEY")).limit(1),
  ]);

  const envGemini = readEnv("GEMINI_API_KEY") || readEnv("GOOGLE_API_KEY");
  const hasGemini = !!(envGemini || dbGemini?.value?.trim());

  const aiEngine = hasGemini
    ? { label: "Google Gemini AI", icon: "🔷", tone: "bg-blue-100 text-blue-800" }
    : { label: "Heuristic engine (add Gemini API key in Admin)", icon: "🧠", tone: "bg-amber-100 text-amber-800" };

  return (
    <div className="space-y-10">
      <section className="rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 p-8 text-white shadow-xl sm:p-12">
        <p className="text-sm uppercase tracking-[0.2em] text-indigo-100">Full mock test</p>
        <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
          IELTS Simulator with AI Feedback
        </h1>
        <p className="mt-4 max-w-2xl text-indigo-50">
          Practice all four IELTS skills in one place. Timed questions, official-style scoring
          (0–9 band), and instant AI examiner feedback on your Writing and Speaking answers.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/listening"
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50"
          >
            Start Listening →
          </Link>
          <Link
            href="/writing"
            className="rounded-xl border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20"
          >
            Try Writing Task
          </Link>
        </div>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/20">
          <span>AI feedback engine:</span>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${aiEngine.tone}`}>
            <span>{aiEngine.icon}</span>
            <span>{aiEngine.label}</span>
          </span>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-slate-900">Choose a section</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${s.color}`} />
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{s.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{s.title}</h3>
                    <p className="text-xs text-slate-500">{s.duration}</p>
                  </div>
                </div>
                <span className="text-slate-300 group-hover:text-indigo-500">→</span>
              </div>
              <p className="mt-3 text-sm text-slate-600">{s.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {recent.length > 0 && (
        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-xl font-bold text-slate-900">Recent attempts</h2>
            <Link href="/results" className="text-sm text-indigo-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((a) => (
              <div key={a.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">{a.section}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 line-clamp-1">
                  {a.taskLabel}
                </p>
                <p className="mt-3 text-2xl font-bold text-indigo-600">
                  {a.bandScore.toFixed(1)}
                </p>
                <p className="text-[11px] text-slate-400">
                  {new Date(a.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
