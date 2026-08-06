import Link from "next/link";
import { db } from "@/db";
import { attempts } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getLoggedUser } from "@/lib/user-auth";

export const dynamic = "force-dynamic";

const SECTIONS = [
  {
    href: "/listening",
    title: "Listening",
    badge: "4 parts · AI audio",
    description: "AI-generated exam audio with real voices, 10 questions per part, instant marking and transcript.",
    icon: "🎧",
    color: "bg-sky-50 text-sky-600 border-sky-100",
  },
  {
    href: "/reading",
    title: "Reading",
    badge: "60 minutes · 40 questions",
    description: "Three academic passages with the full range of IELTS question types, interactive highlighter, and AI tutor.",
    icon: "📖",
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  {
    href: "/writing",
    title: "Writing",
    badge: "60 minutes · 2 tasks",
    description: "Task 1 report and Task 2 essay with instant AI feedback, band estimation, and criteria breakdown.",
    icon: "✍️",
    color: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100",
  },
  {
    href: "/speaking",
    title: "Speaking",
    badge: "3 parts · AI examiner",
    description: "Three-part interview with an AI examiner: hear the question, record your answer, get band feedback.",
    icon: "🎤",
    color: "bg-amber-50 text-amber-600 border-amber-100",
  },
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
    <div className="space-y-12 pb-16 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto pt-6 space-y-4">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
          Choose Your Section
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Sign in to unlock full access to the simulator, questions, and your personal progress tracking.
        </p>
      </div>

      {/* Sections Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="kv-card group p-8 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl text-2xl border ${s.color}`}>
                  {s.icon}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {s.badge}
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {s.description}
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
              <span>Start {s.title} Practice</span>
              <span>→</span>
            </div>
          </Link>
        ))}
      </div>

      {/* User's Own Recent Attempts */}
      {user && userRecent.length > 0 && (
        <section className="space-y-4 pt-8 border-t border-slate-200">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-extrabold text-slate-900">Your Recent Test Attempts</h2>
            <Link href="/results" className="text-sm font-bold text-indigo-600 hover:underline">
              View all results →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {userRecent.map((a) => (
              <div key={a.id} className="kv-card p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
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
