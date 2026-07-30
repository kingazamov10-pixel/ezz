import Link from "next/link";
import { db } from "@/db";
import { readingTests } from "@/db/schema";
import { desc } from "drizzle-orm";
import { deleteReading } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminReadingList() {
  const rows = await db.select().from(readingTests).orderBy(desc(readingTests.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">📖 Reading Passages</h1>
          <p className="mt-1 text-sm text-slate-600">
            The most recently created <strong>active</strong> passage is shown to students.
          </p>
        </div>
        <Link
          href="/admin/reading/new"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          + Add new
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          No reading passages yet. Students currently see the built-in sample.
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
                    <span className="text-sm font-semibold text-slate-900">{r.title}</span>
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
                    {qCount} questions • {r.passage.length} chars • Created{" "}
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/reading/${r.id}`}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </Link>
                  <form action={deleteReading}>
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
