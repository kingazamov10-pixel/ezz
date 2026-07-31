"use client";

import type { AIFeedback } from "@/lib/feedback";
import { BandBadge } from "./BandBadge";

export function FeedbackPanel({ feedback }: { feedback: AIFeedback }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Overall Band</p>
          <div className="mt-2 flex items-center gap-4">
            <BandBadge band={feedback.overallBand} size="lg" />
            <div>
              <p className="text-sm text-slate-700">
                Word count: <span className="font-semibold">{feedback.wordCount}</span>
              </p>
              <p className="text-xs text-slate-500">
                Feedback engine:{" "}
                <span className="font-mono">
                  {feedback.provider === "gemini"
                    ? "🔷 Google Gemini AI"
                    : "🧠 Heuristic IELTS engine"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {feedback.criteria.map((c) => (
          <div key={c.name} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">{c.name}</p>
              <BandBadge band={c.band} size="sm" />
            </div>
            <p className="mt-2 text-xs text-slate-600">{c.comment}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-emerald-50 p-4">
          <p className="mb-2 text-sm font-semibold text-emerald-800">✅ Strengths</p>
          <ul className="space-y-1 text-sm text-emerald-900">
            {feedback.strengths.length === 0 ? (
              <li className="text-slate-500">—</li>
            ) : (
              feedback.strengths.map((s, i) => (
                <li key={i} className="leading-snug">
                  • {s}
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="rounded-xl bg-amber-50 p-4">
          <p className="mb-2 text-sm font-semibold text-amber-800">💡 To improve</p>
          <ul className="space-y-1 text-sm text-amber-900">
            {feedback.improvements.length === 0 ? (
              <li className="text-slate-500">—</li>
            ) : (
              feedback.improvements.map((s, i) => (
                <li key={i} className="leading-snug">
                  • {s}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {feedback.correctedExtract && (
        <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
          <p className="mb-1 text-sm font-semibold text-indigo-800">✨ Suggested rewrite</p>
          <p className="text-sm italic text-indigo-900">&ldquo;{feedback.correctedExtract}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
