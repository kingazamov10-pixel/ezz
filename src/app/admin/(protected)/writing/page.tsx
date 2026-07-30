import Link from "next/link";
import { db } from "@/db";
import { writingTasks } from "@/db/schema";
import { asc, desc } from "drizzle-orm";
import { deleteWriting } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminWritingList() {
  const rows = await db
    .select()
    .from(writingTasks)
    .orderBy(asc(writingTasks.taskNumber), desc(writingTasks.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">✍️ Writing Tasks</h1>
          <p className="mt-1 text-sm text-slate-600">
            For each task (1 or 2) the most recent <strong>active</strong> record is shown.
          </p>
        </div>
        <Link
          href="/admin/writing/new"
          className="rounded-lg bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-fuchsia-700"
        >
          + Add new
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          No writing tasks yet. Students currently see the built-in sample tasks.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-fuchsia-100 px-2 py-0.5 text-[10px] font-semibold text-fuchsia-700">
                    TASK {r.taskNumber}
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
                <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                  {r.prompt.slice(0, 140)}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  min {r.minWords} words • {r.timeMinutes} min • Created{" "}
                  {new Date(r.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/writing/${r.id}`}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Edit
                </Link>
                <form action={deleteWriting}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
