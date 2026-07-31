import { db } from "@/db";
import { attempts } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { BandBadge } from "@/components/BandBadge";
import Link from "next/link";
import { getLoggedUser } from "@/lib/user-auth";

export const dynamic = "force-dynamic";

const SECTION_META: Record<string, { icon: string; color: string; href: string }> = {
  listening: { icon: "🎧", color: "text-sky-600", href: "/listening" },
  reading: { icon: "📖", color: "text-emerald-600", href: "/reading" },
  writing: { icon: "✍️", color: "text-fuchsia-600", href: "/writing" },
  speaking: { icon: "🎤", color: "text-amber-600", href: "/speaking" },
};

export default async function ResultsPage() {
  const user = await getLoggedUser();

  const rows = user
    ? await db
        .select()
        .from(attempts)
        .where(eq(attempts.userEmail, user.email))
        .orderBy(desc(attempts.createdAt))
        .limit(100)
    : await db
        .select()
        .from(attempts)
        .orderBy(desc(attempts.createdAt))
        .limit(100);

  // Aggregate averages per section
  const bySection: Record<string, { total: number; sum: number }> = {};
  for (const r of rows) {
    if (!bySection[r.section]) bySection[r.section] = { total: 0, sum: 0 };
    bySection[r.section].total += 1;
    bySection[r.section].sum += r.bandScore;
  }
  const avgs = Object.entries(bySection).map(([section, s]) => ({
    section,
    avg: s.sum / s.total,
    count: s.total,
  }));
  const overall = avgs.length > 0 ? avgs.reduce((a, b) => a + b.avg, 0) / avgs.length : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">📊 Your Results & History</h1>
          <p className="mt-1 text-sm text-slate-600">
            {user ? (
              <>Showing attempts registered to <span className="font-bold text-indigo-600">{user.email}</span></>
            ) : (
              <>Sign in to track your personal test results and progress history.</>
            )}
          </p>
        </div>
        {!user && (
          <Link
            href="/auth/login?redirect=/results"
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700"
          >
            Sign In to View Your Results →
          </Link>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-200">
          <span className="text-4xl mb-3 block">📝</span>
          <h2 className="text-lg font-bold text-slate-900">No test attempts found</h2>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            {user
              ? "You haven't completed any practice tests yet. Start a section to record your first score!"
              : "Sign in with your email and complete practice tests to save your score history."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/listening"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700"
            >
              Start Practice Now →
            </Link>
          </div>
        </div>
      ) : (
        <>
          <section className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-indigo-50/30 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center gap-6">
              <BandBadge band={overall} size="lg" />
              <div>
                <p className="text-xs uppercase tracking-wide text-indigo-600 font-bold">Overall Average Band</p>
                <p className="text-3xl font-extrabold text-slate-900 mt-0.5">Band {overall.toFixed(1)}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Across {rows.length} verified attempt(s) in {avgs.length} section(s)
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {avgs.map((a) => {
                const meta = SECTION_META[a.section];
                return (
                  <div key={a.section} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                    <p className={`text-xs uppercase tracking-wide font-bold ${meta?.color ?? ""}`}>
                      {meta?.icon} {a.section}
                    </p>
                    <p className="mt-2 text-2xl font-extrabold text-slate-900">{a.avg.toFixed(1)}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{a.count} attempt(s)</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Attempt History</h2>
            <div className="space-y-3">
              {rows.map((r) => {
                const meta = SECTION_META[r.section];
                return (
                  <div
                    key={r.id}
                    className="glass-card flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <BandBadge band={r.bandScore} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs uppercase tracking-wide font-bold ${meta?.color ?? ""}`}>
                            {meta?.icon} {r.section}
                          </span>
                          {r.userEmail && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                              {r.userEmail}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">{r.taskLabel}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(r.createdAt).toLocaleString()}
                          {r.rawScore != null && r.totalQuestions != null && (
                            <>
                              {" • "}
                              <span className="font-semibold text-slate-700">
                                {r.rawScore} / {r.totalQuestions} correct
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    {meta && (
                      <Link
                        href={meta.href}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
                      >
                        Retake Section →
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
