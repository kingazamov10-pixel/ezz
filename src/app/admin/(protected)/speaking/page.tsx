import Link from "next/link";
import { db } from "@/db";
import { speakingPrompts } from "@/db/schema";
import { asc, desc } from "drizzle-orm";
import { deleteSpeaking } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminSpeakingList() {
  const rows = await db
    .select()
    .from(speakingPrompts)
    .orderBy(asc(speakingPrompts.part), desc(speakingPrompts.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🎤 Speaking Prompts</h1>
          <p className="mt-1 text-sm text-slate-600">
            For each part (1, 2, 3) the most recent <strong>active</strong> record is used.
          </p>
        </div>
        <Link
          href="/admin/speaking/new"
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-600"
        >
          + Add new
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          No speaking prompts yet. Students currently see the built-in sample prompts.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => {
            const qCount = Array.isArray(r.questions) ? r.questions.length : 0;
            return (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      PART {r.part}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">{r.label}</span>
                    {r.isActive ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                        DRAFT
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {r.part === 2
                      ? (r.prompt ?? "").slice(0, 140)
                      : `${qCount} questions`}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {r.timeMinutes} min • Created {new Date(r.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/speaking/${r.id}`}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </Link>
                  <form action={deleteSpeaking}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
