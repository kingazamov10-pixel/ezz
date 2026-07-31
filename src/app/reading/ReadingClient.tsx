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
  allPassages,
  currentId,
}: {
  title: string;
  passage: string;
  questions: Question[];
  allPassages?: { id: number; title: string }[];
  currentId?: number | null;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<GradeResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timerRunning, setTimerRunning] = useState(true);
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [explainingId, setExplainingId] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<Record<string, string>>({});

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

  function handleHighlight() {
    const sel = window.getSelection()?.toString().trim();
    if (sel && sel.length > 2) {
      if (!highlights.includes(sel)) {
        setHighlights([...highlights, sel]);
      }
    }
  }

  async function explainQuestion(q: Question, detail: GradeResult["details"][number]) {
    setExplainingId(q.id);
    try {
      const res = await fetch("/api/feedback/reading-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passage: passage.slice(0, 1500),
          question: q.question,
          expected: detail.expected,
          given: detail.given,
          isCorrect: detail.isCorrect,
        }),
      });
      const data = (await res.json()) as { explanation: string };
      setExplanations((e) => ({ ...e, [q.id]: data.explanation }));
    } catch {
      setExplanations((e) => ({ ...e, [q.id]: "Could not generate AI explanation." }));
    } finally {
      setExplainingId(null);
    }
  }

  const fontClass =
    fontSize === "sm" ? "text-xs" : fontSize === "lg" ? "text-base" : "text-sm";

  return (
    <div className="space-y-6">
      {/* Top Bar with Passage Selector, Timer, Font Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          {allPassages && allPassages.length > 1 && (
            <select
              defaultValue={currentId ?? ""}
              onChange={(e) => {
                if (e.target.value) window.location.href = `/reading?id=${e.target.value}`;
              }}
              className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              {allPassages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Font size toggles */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
            <button
              onClick={() => setFontSize("sm")}
              className={`rounded-lg px-2 py-1 ${fontSize === "sm" ? "bg-white text-slate-900 shadow-sm" : ""}`}
            >
              A-
            </button>
            <button
              onClick={() => setFontSize("base")}
              className={`rounded-lg px-2 py-1 ${fontSize === "base" ? "bg-white text-slate-900 shadow-sm" : ""}`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize("lg")}
              className={`rounded-lg px-2 py-1 ${fontSize === "lg" ? "bg-white text-slate-900 shadow-sm" : ""}`}
            >
              A+
            </button>
          </div>
          <Timer seconds={15 * 60} running={timerRunning} onExpire={submit} />
        </div>
      </div>

      {result && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-6">
            <BandBadge band={result.band} size="lg" />
            <div>
              <p className="text-sm font-medium text-emerald-800">Your score</p>
              <p className="text-2xl font-extrabold text-emerald-900">
                {result.correct} / {result.total} correct
              </p>
              <p className="text-xs text-emerald-700">Estimated IELTS band: {result.band.toFixed(1)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Reading Workspace */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Passage Article */}
        <article
          onMouseUp={handleHighlight}
          className="glass-card rounded-3xl p-6 sm:p-8 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 border border-amber-200">
              💡 Tip: Select text to highlight
            </span>
          </div>

          {highlights.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 space-y-1.5">
              <p className="text-xs font-bold text-amber-800">Highlighted Notes ({highlights.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {highlights.map((h, hIdx) => (
                  <span
                    key={hIdx}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-200/70 px-2.5 py-1 text-xs text-amber-900 font-medium"
                  >
                    &ldquo;{h}&rdquo;
                    <button
                      onClick={() => setHighlights(highlights.filter((_, i) => i !== hIdx))}
                      className="text-amber-700 hover:text-amber-900 font-bold ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div
            className={`prose max-w-none whitespace-pre-line text-slate-700 leading-relaxed ${fontClass}`}
          >
            {passage}
          </div>
        </article>

        {/* Questions Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Questions</h3>
            <span className="text-xs text-slate-400">{questions.length} questions total</span>
          </div>

          {questions.map((q, i) => {
            const detail = result?.details.find((d) => d.id === q.id);
            const isRight = detail?.isCorrect;
            const explanation = explanations[q.id];
            const isExplaining = explainingId === q.id;

            return (
              <div
                key={q.id}
                className={`glass-card rounded-2xl p-5 shadow-sm transition-all ${
                  detail ? (isRight ? "border-emerald-300 bg-emerald-50/20" : "border-rose-300 bg-rose-50/20") : "border-slate-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-emerald-100 text-xs font-extrabold text-emerald-700 shadow-sm">
                    {i + 1}
                  </span>
                  <div className="flex-1 space-y-3">
                    <p className="text-sm font-semibold text-slate-900 leading-relaxed">{q.question}</p>
                    <div>
                      {q.type === "mcq" && (
                        <div className="space-y-2">
                          {q.options.map((opt, idx) => (
                            <label
                              key={idx}
                              className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-slate-100/80"
                            >
                              <input
                                type="radio"
                                name={q.id}
                                value={idx}
                                checked={answers[q.id] === String(idx)}
                                onChange={(e) =>
                                  setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                                }
                                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                              />
                              <span className="text-slate-700">{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      {q.type === "fill" && (
                        <input
                          type="text"
                          value={answers[q.id] ?? ""}
                          onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                          className="w-full max-w-sm rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none shadow-sm"
                          placeholder="Type your answer"
                        />
                      )}
                      {q.type === "tfng" && (
                        <div className="flex flex-wrap gap-2">
                          {(["TRUE", "FALSE", "NOT GIVEN"] as const).map((v) => (
                            <label
                              key={v}
                              className={`cursor-pointer rounded-xl border px-4 py-2 text-xs font-bold transition-all ${
                                answers[q.id] === v
                                  ? "border-emerald-600 bg-emerald-600 text-white shadow-md"
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
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-bold ${isRight ? "text-emerald-700" : "text-rose-700"}`}>
                            {isRight ? "✓ Correct" : `✗ Correct answer: ${detail.expected}`}
                          </p>
                          <button
                            onClick={() => explainQuestion(q, detail)}
                            disabled={isExplaining}
                            className="rounded-lg bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors disabled:opacity-50"
                          >
                            {isExplaining ? "AI analyzing..." : "🤖 Ask AI Tutor"}
                          </button>
                        </div>
                        {explanation && (
                          <div className="rounded-xl bg-indigo-50/80 border border-indigo-100 p-3 text-xs text-indigo-900 leading-relaxed">
                            <p className="font-bold mb-1">💡 AI Explanation:</p>
                            {explanation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="sticky bottom-6 flex justify-end z-30">
        <button
          onClick={submit}
          disabled={submitting}
          className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-emerald-600/25 hover:scale-105 hover:shadow-emerald-600/40 transition-all disabled:opacity-50"
        >
          {submitting ? "Evaluating test..." : result ? "Re-check answers" : "Submit Reading Test →"}
        </button>
      </div>
    </div>
  );
}
