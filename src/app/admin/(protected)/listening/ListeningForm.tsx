import Link from "next/link";
import { saveListening } from "@/app/admin/actions";

type Row = {
  id: number;
  title: string;
  intro: string;
  transcript: string;
  questions: unknown;
  isActive: boolean;
};

const SAMPLE = `[
  {
    "id": "L1",
    "type": "fill",
    "question": "The student's name is __________",
    "answer": "anna",
    "acceptable": ["anna petrov"]
  },
  {
    "id": "L2",
    "type": "mcq",
    "question": "Which course did she choose?",
    "options": ["Business", "General English", "IELTS", "Academic"],
    "answer": 1
  },
  {
    "id": "L3",
    "type": "tfng",
    "question": "The course lasts 12 weeks.",
    "answer": "TRUE"
  }
]`;

export function ListeningForm({ row }: { row?: Row }) {
  const questionsJson = row?.questions ? JSON.stringify(row.questions, null, 2) : SAMPLE;
  return (
    <form action={saveListening} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {row?.id && <input type="hidden" name="id" value={row.id} />}
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-700">Title *</label>
        <input
          name="title"
          required
          defaultValue={row?.title ?? ""}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
          placeholder="Section 1 — Booking a Language Course"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-700">
          Intro (short description shown to students)
        </label>
        <textarea
          name="intro"
          rows={2}
          defaultValue={row?.intro ?? ""}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
          placeholder="You will hear a conversation between..."
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-700">
          Transcript * (played via browser TTS)
        </label>
        <textarea
          name="transcript"
          required
          rows={10}
          defaultValue={row?.transcript ?? ""}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs focus:border-sky-500 focus:outline-none"
          placeholder="Speaker A: Good morning...&#10;Speaker B: Hi, I'd like to..."
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-700">Questions (JSON) *</label>
        <p className="mb-1 text-[11px] text-slate-500">
          Array of question objects. Types: <code>mcq</code>, <code>fill</code>,{" "}
          <code>tfng</code>. Each needs a unique <code>id</code>.
        </p>
        <textarea
          name="questions"
          required
          rows={14}
          defaultValue={questionsJson}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs focus:border-sky-500 focus:outline-none"
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
          href="/admin/listening"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
        >
          {row?.id ? "Save changes" : "Create"}
        </button>
      </div>
    </form>
  );
}
