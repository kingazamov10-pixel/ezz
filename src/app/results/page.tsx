import { db } from "@/db";
import { attempts } from "@/db/schema";
import { desc } from "drizzle-orm";
import { BandBadge } from "@/components/BandBadge";
import Link from "next/link";

export const dynamic = "force-dynamic";

const SECTION_META: Record<string, { icon: string; color: string; href: string }> = {
  listening: { icon: "🎧", color: "text-sky-600", href: "/listening" },
  reading: { icon: "📖", color: "text-emerald-600", href: "/reading" },
  writing: { icon: "✍️", color: "text-fuchsia-600", href: "/writing" },
  speaking: { icon: "🎤", color: "text-amber-600", href: "/speaking" },
};

export default async function ResultsPage() {
  const rows = await db
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
      <div>
        <h1 className="text-3xl font-bold text-slate-900">📊 Your Results</h1>
        <p className="mt-2 text-sm text-slate-600">
          Every attempt is stored and scored. Aim for an overall band of at least 6.5 for
          undergraduate study, or 7.0+ for competitive programmes.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-600">No attempts yet.</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Start a section
          </Link>
        </div>
      ) : (
        <>
          <section className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-6">
              <BandBadge band={overall} size="lg" />
              <div>
                <p className="text-xs uppercase tracking-wide text-indigo-600">Overall average</p>
                <p className="text-2xl font-bold text-slate-900">Band {overall.toFixed(1)}</p>
                <p className="text-xs text-slate-500">
                  Across {rows.length} attempts in {avgs.length} section(s)
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {avgs.map((a) => {
                const meta = SECTION_META[a.section];
                return (
                  <div key={a.section} className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className={`text-xs uppercase tracking-wide ${meta?.color ?? ""}`}>
                      {meta?.icon} {a.section}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{a.avg.toFixed(1)}</p>
                    <p className="text-[11px] text-slate-500">{a.count} attempt(s)</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold text-slate-900">All attempts</h2>
            <div className="space-y-3">
              {rows.map((r) => {
                const meta = SECTION_META[r.section];
                return (
                  <div
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <BandBadge band={r.bandScore} />
                      <div>
                        <p className={`text-xs uppercase tracking-wide ${meta?.color ?? ""}`}>
                          {meta?.icon} {r.section}
                        </p>
                        <p className="text-sm font-semibold text-slate-900">{r.taskLabel}</p>
                        <p className="text-[11px] text-slate-500">
                          {new Date(r.createdAt).toLocaleString()}
                          {r.rawScore != null && r.totalQuestions != null && (
                            <>
                              {" • "}
                              {r.rawScore} / {r.totalQuestions} correct
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    {meta && (
                      <Link
                        href={meta.href}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Retake →
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
