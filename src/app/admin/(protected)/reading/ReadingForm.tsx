import Link from "next/link";
import { saveReading } from "@/app/admin/actions";

type Row = {
  id: number;
  title: string;
  passage: string;
  questions: unknown;
  isActive: boolean;
};

const SAMPLE = `[
  {
    "id": "R1",
    "type": "tfng",
    "question": "The story of Kaldi is well documented in ancient texts.",
    "answer": "NOT GIVEN"
  },
  {
    "id": "R2",
    "type": "mcq",
    "question": "Which country cultivated coffee first?",
    "options": ["Brazil", "Yemen", "Turkey", "Java"],
    "answer": 1
  },
  {
    "id": "R3",
    "type": "fill",
    "question": "Coffee reached Europe through the port of __________.",
    "answer": "venice"
  }
]`;

export function ReadingForm({ row }: { row?: Row }) {
  const questionsJson = row?.questions ? JSON.stringify(row.questions, null, 2) : SAMPLE;
  return (
    <form
      action={saveReading}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {row?.id && <input type="hidden" name="id" value={row.id} />}
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-700">Title *</label>
        <input
          name="title"
          required
          defaultValue={row?.title ?? ""}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          placeholder="The History of Coffee"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-700">Passage *</label>
        <textarea
          name="passage"
          required
          rows={16}
          defaultValue={row?.passage ?? ""}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm leading-relaxed focus:border-emerald-500 focus:outline-none"
          placeholder="Coffee is one of the most widely consumed beverages..."
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-700">Questions (JSON) *</label>
        <p className="mb-1 text-[11px] text-slate-500">
          Types: <code>mcq</code>, <code>fill</code>, <code>tfng</code>.
        </p>
        <textarea
          name="questions"
          required
          rows={14}
          defaultValue={questionsJson}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs focus:border-emerald-500 focus:outline-none"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={row?.isActive ?? true}
          className="h-4 w-4"
        />
        Active (shown to students)
      </label>
      <div className="flex justify-end gap-2">
        <Link
          href="/admin/reading"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          {row?.id ? "Save changes" : "Create"}
        </button>
      </div>
    </form>
  );
}
