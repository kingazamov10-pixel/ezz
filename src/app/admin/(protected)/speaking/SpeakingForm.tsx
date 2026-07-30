"use client";

import { useState } from "react";
import Link from "next/link";
import { saveSpeaking } from "@/app/admin/actions";

type Row = {
  id: number;
  part: number;
  label: string;
  prompt: string | null;
  questions: unknown;
  timeMinutes: number;
  isActive: boolean;
};

export function SpeakingForm({ row }: { row?: Row }) {
  const [part, setPart] = useState<number>(row?.part ?? 1);
  const questionsText = Array.isArray(row?.questions) ? (row!.questions as string[]).join("\n") : "";

  return (
    <form
      action={saveSpeaking}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {row?.id && <input type="hidden" name="id" value={row.id} />}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Part *</label>
          <select
            name="part"
            value={part}
            onChange={(e) => setPart(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
          >
            <option value={1}>Part 1 (Interview)</option>
            <option value={2}>Part 2 (Cue card)</option>
            <option value={3}>Part 3 (Discussion)</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-slate-700">Label *</label>
          <input
            name="label"
            required
            defaultValue={row?.label ?? ""}
            placeholder={
              part === 2 ? "Part 2 — Long Turn (Cue Card)" : `Part ${part} — ${part === 1 ? "Interview" : "Discussion"}`
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-700">Time (minutes) *</label>
        <input
          type="number"
          name="timeMinutes"
          min={1}
          required
          defaultValue={row?.timeMinutes ?? (part === 2 ? 2 : part === 1 ? 4 : 5)}
          className="w-40 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
        />
      </div>

      {part === 2 ? (
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Cue card prompt *</label>
          <textarea
            name="prompt"
            required
            rows={8}
            defaultValue={row?.prompt ?? ""}
            placeholder={"Describe a skill you would like to learn.\nYou should say:\n  • what the skill is\n  • how you would learn it\n  • how long it might take\n  • and explain why you want to learn it."}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
          />
        </div>
      ) : (
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Questions * (one per line)
          </label>
          <textarea
            name="questionsList"
            required
            rows={8}
            defaultValue={questionsText}
            placeholder={"Where are you from?\nWhat do you like about your hometown?\nDo you prefer city or countryside?"}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
          />
        </div>
      )}

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={row?.isActive ?? true}
          className="h-4 w-4"
        />
        Active
      </label>
      <div className="flex justify-end gap-2">
        <Link
          href="/admin/speaking"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-600"
        >
          {row?.id ? "Save changes" : "Create"}
        </button>
      </div>
    </form>
  );
}
