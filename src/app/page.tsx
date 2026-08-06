import Link from "next/link";
import { db } from "@/db";
import { attempts } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getLoggedUser } from "@/lib/user-auth";

export const dynamic = "force-dynamic";

const SECTIONS = [
  {
    href: "/listening",
    title: "Listening Module",
    subtitle: "Audio Conversations & 10 Questions",
    icon: "🎧",
    duration: "~10 min",
    badge: "Section 1",
    description:
      "Practice Cambridge-style audio conversations with synthesized voice, multiple-choice, table completion, and interactive testing.",
    color: "from-sky-500 to-blue-600",
    bgLight: "bg-sky-50 text-sky-700 border-sky-200",
  },
  {
    href: "/reading",
    title: "Reading Module",
    subtitle: "Academic Passages & AI Tutor",
    icon: "📖",
    duration: "~15 min",
    badge: "Section 2",
    description:
      "Read rigorous academic texts with CBT highlighting, font adjustment, bilingual word translation, and AI tutor explanations.",
    color: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    href: "/writing",
    title: "Writing Lab",
    subtitle: "Task 1 & Task 2 with AI Feedback",
    icon: "✍️",
    duration: "60 min",
    badge: "Section 3",
    description:
      "Compose essays and data reports with live word counters. Receive detailed band scores across all 4 official IELTS criteria.",
    color: "from-fuchsia-500 to-purple-600",
    bgLight: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  },
  {
    href: "/speaking",
    title: "Speaking Interview",
    subtitle: "Parts 1, 2 & 3 with Voice Input",
    icon: "🎤",
    duration: "11–14 min",
    badge: "Section 4",
    description:
      "Simulate a live examiner interview using voice speech recognition or typed responses. Get instant fluency and grammar insights.",
    color: "from-amber-500 to-orange-600",
    bgLight: "bg-amber-50 text-amber-700 border-amber-200",
  },
];

const PILLARS = [
  { icon: "🎯", title: "Official Band Descriptors", desc: "Calibrated strictly to Cambridge & IDP grading standards (0–9 scale)." },
  { icon: "⚡", title: "Instant AI Examiner", desc: "Powered by Google Gemini AI for deep linguistic and structural feedback." },
  { icon: "🛡️", title: "Secure Cloud Storage", desc: "All test history and vocabulary notes are safely tied to your personal account." },
  { icon: "💻", title: "CBT Exam Experience", desc: "Built with computer-delivered IELTS features: timers, highlighting, & notes." },
];

export default async function HomePage() {
  const user = await getLoggedUser();
  let userRecent: (typeof attempts.$inferSelect)[] = [];

  if (user) {
    try {
      userRecent = await db
        .select()
        .from(attempts)
        .where(eq(attempts.userEmail, user.email))
        .orderBy(desc(attempts.createdAt))
        .limit(4)
        .catch(() => []);
    } catch {
      // Fallback
    }
  }

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 p-8 text-white shadow-2xl sm:p-14 border border-indigo-900/50">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-pink-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1.5 text-xs font-bold text-indigo-300 backdrop-blur-md border border-indigo-500/30 mb-6 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Certified IELTS Academic & General Training Simulator</span>
          </div>

          <h1 className="text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl leading-[1.08]">
            Achieve Your Target{" "}
            <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              Band 8.0+
            </span>{" "}
            with AI
          </h1>

          <p className="mt-6 text-lg text-slate-300 sm:text-xl font-normal leading-relaxed">
            The most advanced computer-delivered IELTS platform. Practice Listening, Reading, Writing, 
            and Speaking with real-time AI examiner evaluations and personalized feedback.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/listening"
              className="group inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 text-sm font-extrabold text-white shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 hover:shadow-indigo-600/50"
            >
              <span>Start Free Practice Test</span>
              <span className="transition-transform group-hover:translate-x-1.5">→</span>
            </Link>
            {!user && (
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-7 py-4 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/30"
              >
                🔐 Sign In to Save Progress
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Trust Pillars */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PILLARS.map((p, idx) => (
          <div key={idx} className="glass-card rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <span className="text-3xl block">{p.icon}</span>
            <h3 className="text-base font-extrabold text-slate-900">{p.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </section>

      {/* Sections Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-indigo-600 font-extrabold">Comprehensive Curriculum</p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Four Official Test Modules</h2>
          </div>
          <p className="text-sm text-slate-500 max-w-md">
            Simulate exact exam conditions with timed interfaces and comprehensive performance analytics.
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
                <p className="mt-4 text-sm font-semibold text-slate-700">{s.subtitle}</p>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{s.description}</p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1">⏱ Estimated {s.duration}</span>
                <span className="text-indigo-600 group-hover:underline">Start module session →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* User's Own Recent Attempts (Only shown if signed in and has history) */}
      {user && userRecent.length > 0 && (
        <section className="space-y-4 pt-4">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-indigo-600 font-extrabold">Personal Dashboard</p>
              <h2 className="text-2xl font-black text-slate-900 mt-1">Your Recent Test Attempts</h2>
            </div>
            <Link href="/results" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
              View full report card →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {userRecent.map((a) => (
              <div key={a.id} className="glass-card rounded-2xl p-5 shadow-sm flex flex-col justify-between border border-slate-200">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {a.section}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-bold text-slate-900 line-clamp-2">
                    {a.taskLabel}
                  </p>
                </div>
                <div className="mt-4 flex items-baseline justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-500 font-medium">Band Score</span>
                  <span className="text-2xl font-black text-indigo-600">
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
