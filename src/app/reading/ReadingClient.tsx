"use client";

import { useState } from "react";
import type { Question } from "@/lib/ielts-data";
import { BandBadge } from "@/components/BandBadge";
import { Timer } from "@/components/Timer";

type GradeResult = {
  correct: number;
  total: number;
  band: number;
  details: { id: string; question: string; expected: string; given: string; isCorrect: boolean }[];
};

export function ReadingClient({
  title,
  passage,
  questions,
}: {
  title: string;
  passage: string;
  questions: Question[];
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<GradeResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timerRunning, setTimerRunning] = useState(true);

  async function submit() {
    setSubmitting(true);
    setTimerRunning(false);
    const res = await fetch("/api/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: "reading", answers }),
    });
    const data = (await res.json()) as GradeResult;
    setResult(data);
    await fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section: "reading",
        taskLabel: title,
        bandScore: data.band,
        rawScore: data.correct,
        totalQuestions: data.total,
        userResponse: JSON.stringify(answers),
        feedback: data,
      }),
    });
    setSubmitting(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        <Timer seconds={15 * 60} running={timerRunning} onExpire={submit} />
      </div>

      {result && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-6">
            <BandBadge band={result.band} size="lg" />
            <div>
              <p className="text-sm font-medium text-emerald-800">Your score</p>
              <p className="text-2xl font-bold text-emerald-900">
                {result.correct} / {result.total} correct
              </p>
              <p className="text-xs text-emerald-700">Estimated IELTS band: {result.band.toFixed(1)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-3 text-lg font-bold text-slate-900">{title}</h3>
          <div className="prose prose-sm max-w-none whitespace-pre-line text-slate-700">
            {passage}
          </div>
        </article>

        <div className="space-y-3">
          {questions.map((q, i) => {
            const detail = result?.details.find((d) => d.id === q.id);
            const isRight = detail?.isCorrect;
            return (
              <div
                key={q.id}
                className={`rounded-xl border bg-white p-4 shadow-sm ${
                  detail ? (isRight ? "border-emerald-300" : "border-rose-300") : "border-slate-200"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{q.question}</p>
                    <div className="mt-2">
                      {q.type === "mcq" && (
                        <div className="space-y-1">
                          {q.options.map((opt, idx) => (
                            <label
                              key={idx}
                              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-slate-50"
                            >
                              <input
                                type="radio"
                                name={q.id}
                                value={idx}
                                checked={answers[q.id] === String(idx)}
                                onChange={(e) =>
                                  setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                                }
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      {q.type === "fill" && (
                        <input
                          type="text"
                          value={answers[q.id] ?? ""}
                          onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                          className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
                          placeholder="Type your answer"
                        />
                      )}
                      {q.type === "tfng" && (
                        <div className="flex flex-wrap gap-2">
                          {(["TRUE", "FALSE", "NOT GIVEN"] as const).map((v) => (
                            <label
                              key={v}
                              className={`cursor-pointer rounded-lg border px-3 py-1 text-xs font-semibold ${
                                answers[q.id] === v
                                  ? "border-emerald-600 bg-emerald-600 text-white"
                                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <input
                                type="radio"
                                name={q.id}
                                value={v}
                                className="hidden"
                                checked={answers[q.id] === v}
                                onChange={(e) =>
                                  setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                                }
                              />
                              {v}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    {detail && (
                      <p
                        className={`mt-2 text-xs ${isRight ? "text-emerald-700" : "text-rose-700"}`}
                      >
                        {isRight ? "✓ Correct" : `✗ Correct answer: ${detail.expected}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="sticky bottom-4 flex justify-end">
        <button
          onClick={submit}
          disabled={submitting}
          className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-emerald-700 disabled:opacity-50"
        >
          {submitting ? "Submitting…" : result ? "Re-check answers" : "Submit answers"}
        </button>
      </div>
    </div>
  );
}
