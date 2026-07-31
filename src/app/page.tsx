import Link from "next/link";
import { db } from "@/db";
import { attempts } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

const SECTIONS = [
  {
    href: "/listening",
    title: "Listening Section",
    subtitle: "Audio Conversation & 10 Questions",
    icon: "🎧",
    duration: "~10 min",
    badge: "Section 1",
    description:
      "Listen to real IELTS-style audio conversations and answer multiple-choice, table completion, and matching questions.",
    color: "from-sky-500 to-blue-600",
    bgLight: "bg-sky-50 text-sky-700 border-sky-200",
  },
  {
    href: "/reading",
    title: "Reading Section",
    subtitle: "Academic Passage & Analysis",
    icon: "📖",
    duration: "~15 min",
    badge: "Section 2",
    description:
      "Read complex academic texts with built-in timer, answering TRUE/FALSE/NOT GIVEN and summary completion tasks.",
    color: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    href: "/writing",
    title: "Writing Tasks",
    subtitle: "Task 1 & Task 2 with AI",
    icon: "✍️",
    duration: "60 min",
    badge: "Section 3",
    description:
      "Draft data summaries and essays with live word count. Receive instant AI examiner feedback across all 4 official criteria.",
    color: "from-fuchsia-500 to-purple-600",
    bgLight: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  },
  {
    href: "/speaking",
    title: "Speaking Test",
    subtitle: "Parts 1, 2 & 3 with Voice",
    icon: "🎤",
    duration: "11–14 min",
    badge: "Section 4",
    description:
      "Record your voice responses or type answers. Get detailed AI band scores on fluency, pronunciation, lexis, and grammar.",
    color: "from-amber-500 to-orange-600",
    bgLight: "bg-amber-50 text-amber-700 border-amber-200",
  },
];

export default async function HomePage() {
  let recent: (typeof attempts.$inferSelect)[] = [];

  try {
    const recentRows = await db
      .select()
      .from(attempts)
      .orderBy(desc(attempts.createdAt))
      .limit(4)
      .catch(() => []);
    recent = recentRows;
  } catch {
    // Graceful fallback
  }

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-violet-900 to-slate-900 p-8 text-white shadow-2xl sm:p-14">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-md border border-white/20 mb-6 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Official IELTS Band 9.0 Standard Simulator</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-[1.1]">
            Master IELTS with{" "}
            <span className="bg-gradient-to-r from-indigo-300 via-pink-300 to-amber-300 bg-clip-text text-transparent">
              AI Examiner
            </span>
          </h1>

          <p className="mt-6 text-lg text-slate-300 sm:text-xl font-normal leading-relaxed">
            Practice all 4 official IELTS sections with realistic timed tests, speech synthesis, 
            voice recognition, and instant professional AI feedback calibrated to official band descriptors.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/listening"
              className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 hover:shadow-indigo-500/40"
            >
              <span>Start Full Mock Test</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/writing"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-7 py-4 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/30"
            >
              ✍️ Try AI Writing Lab
            </Link>
          </div>
        </div>
      </section>

      {/* Sections Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-indigo-600 font-bold">Comprehensive Practice</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Choose a Test Section</h2>
          </div>
          <p className="text-sm text-slate-500 max-w-md">
            All sections follow official Cambridge IELTS format with dynamic question sets manageable via the Admin panel.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="glass-card group relative overflow-hidden rounded-3xl p-8 flex flex-col justify-between"
            >
              <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${s.color}`} />
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-3xl shadow-inner group-hover:scale-110 transition-transform">
                      {s.icon}
                    </span>
                    <div>
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold border mb-1 ${s.bgLight}`}>
                        {s.badge}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {s.title}
                      </h3>
                    </div>
                  </div>
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    →
                  </span>
                </div>
                <p className="mt-4 text-sm font-medium text-slate-700">{s.subtitle}</p>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{s.description}</p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-slate-400">
                <span className="flex items-center gap-1">⏱ {s.duration}</span>
                <span className="text-indigo-600 group-hover:underline">Start practice session →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Attempts */}
      {recent.length > 0 && (
        <section className="space-y-4 pt-4">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-indigo-600 font-bold">History & Progress</p>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">Recent Student Attempts</h2>
            </div>
            <Link href="/results" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
              View all results →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((a) => (
              <div key={a.id} className="glass-card rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {a.section}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-900 line-clamp-2">
                    {a.taskLabel}
                  </p>
                </div>
                <div className="mt-4 flex items-baseline justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-500">Band Score</span>
                  <span className="text-2xl font-extrabold text-indigo-600">
                    {a.bandScore.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
