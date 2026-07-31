"use client";

import { useState } from "react";
import Link from "next/link";
import { saveReading } from "@/app/admin/actions";
import type { Question } from "@/lib/ielts-data";

type Row = {
  id: number;
  title: string;
  passage: string;
  questions: unknown;
  isActive: boolean;
};

export function ReadingForm({ row }: { row?: Row }) {
  const initialQuestions: Question[] = Array.isArray(row?.questions)
    ? (row.questions as Question[])
    : [
        {
          id: "R1",
          type: "tfng",
          question: "The story of Kaldi is well documented in ancient texts.",
          answer: "NOT GIVEN",
        },
      ];

  const [questions, setQuestions] = useState<Question[]>(initialQuestions);

  function addQuestion(type: "mcq" | "fill" | "tfng") {
    const id = `R${questions.length + 1}`;
    if (type === "mcq") {
      setQuestions([
        ...questions,
        { id, type: "mcq", question: "", options: ["Option A", "Option B", "Option C", "Option D"], answer: 0 },
      ]);
    } else if (type === "fill") {
      setQuestions([
        ...questions,
        { id, type: "fill", question: "", answer: "", acceptable: [] },
      ]);
    } else {
      setQuestions([
        ...questions,
        { id, type: "tfng", question: "", answer: "TRUE" },
      ]);
    }
  }

  function updateQuestion(index: number, updated: Question) {
    const copy = [...questions];
    copy[index] = updated;
    setQuestions(copy);
  }

  function removeQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index));
  }

  return (
    <form action={saveReading} className="space-y-6">
      {row?.id && <input type="hidden" name="id" value={row.id} />}
      <input type="hidden" name="questions" value={JSON.stringify(questions)} />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Passage Information</h2>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Title *</label>
          <input
            name="title"
            required
            defaultValue={row?.title ?? ""}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
            placeholder="The History of Coffee"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Passage Text *</label>
          <textarea
            name="passage"
            required
            rows={12}
            defaultValue={row?.passage ?? ""}
            className="w-full rounded-xl border border-slate-300 p-3.5 text-sm leading-relaxed focus:border-emerald-500 focus:outline-none"
            placeholder="Paste academic reading passage here..."
          />
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={row?.isActive ?? true}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          Active (shown to students)
        </label>
      </div>

      {/* Visual Question Builder */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Reading Questions Builder</h2>
            <p className="text-xs text-slate-500">Add questions visually without writing JSON.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => addQuestion("tfng")}
              className="rounded-xl bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 transition-colors"
            >
              + True / False / NG
            </button>
            <button
              type="button"
              onClick={() => addQuestion("mcq")}
              className="rounded-xl bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-100 transition-colors"
            >
              + Multiple Choice
            </button>
            <button
              type="button"
              onClick={() => addQuestion("fill")}
              className="rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              + Fill in Blank
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={q.id || idx} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                  Question #{idx + 1} ({q.type.toUpperCase()})
                </span>
                <button
                  type="button"
                  onClick={() => removeQuestion(idx)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800"
                >
                  🗑 Remove
                </button>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Question Text *</label>
                <input
                  type="text"
                  required
                  value={q.question}
                  onChange={(e) => updateQuestion(idx, { ...q, question: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. Kaldi discovered coffee in the 9th century."
                />
              </div>

              {q.type === "tfng" && (
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Correct Answer *</label>
                  <select
                    value={q.answer}
                    onChange={(e) =>
                      updateQuestion(idx, {
                        ...q,
                        answer: e.target.value as "TRUE" | "FALSE" | "NOT GIVEN",
                      })
                    }
                    className="w-48 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="TRUE">TRUE</option>
                    <option value="FALSE">FALSE</option>
                    <option value="NOT GIVEN">NOT GIVEN</option>
                  </select>
                </div>
              )}

              {q.type === "mcq" && (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-700">Options & Correct Answer</label>
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-r-${idx}`}
                        checked={q.answer === oIdx}
                        onChange={() => updateQuestion(idx, { ...q, answer: oIdx })}
                        title="Mark as correct answer"
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...q.options];
                          newOpts[oIdx] = e.target.value;
                          updateQuestion(idx, { ...q, options: newOpts });
                        }}
                        className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
                        placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              {q.type === "fill" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Canonical Answer *</label>
                    <input
                      type="text"
                      required
                      value={q.answer}
                      onChange={(e) => updateQuestion(idx, { ...q, answer: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                      placeholder="e.g. venice"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Acceptable Synonyms</label>
                    <input
                      type="text"
                      value={(q.acceptable ?? []).join(", ")}
                      onChange={(e) =>
                        updateQuestion(idx, {
                          ...q,
                          acceptable: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                      placeholder="e.g. venice city"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Link
          href="/admin/reading"
          className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 transition-colors"
        >
          {row?.id ? "Save Changes" : "Create Passage"}
        </button>
      </div>
    </form>
  );
}
