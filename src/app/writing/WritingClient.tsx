"use client";

import { useMemo, useState } from "react";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { Timer } from "@/components/Timer";
import type { AIFeedback } from "@/lib/feedback";

type Task = {
  label: string;
  minWords: number;
  timeMinutes: number;
  prompt: string;
  dataDescription?: string;
};

export function WritingClient({ task1, task2 }: { task1: Task; task2: Task }) {
  const [active, setActive] = useState<"t1" | "t2">("t1");
  const [t1Text, setT1Text] = useState("");
  const [t2Text, setT2Text] = useState("");
  const [t1Feedback, setT1Feedback] = useState<AIFeedback | null>(null);
  const [t2Feedback, setT2Feedback] = useState<AIFeedback | null>(null);
  const [loading, setLoading] = useState(false);

  const current = active === "t1" ? task1 : task2;
  const text = active === "t1" ? t1Text : t2Text;
  const setText = active === "t1" ? setT1Text : setT2Text;
  const feedback = active === "t1" ? t1Feedback : t2Feedback;
  const setFeedback = active === "t1" ? setT1Feedback : setT2Feedback;

  const wordCount = useMemo(
    () => text.trim().split(/\s+/).filter(Boolean).length,
    [text],
  );

  async function submit() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/feedback/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: current.prompt,
          response: text,
          minWords: current.minWords,
          taskLabel: current.label,
        }),
      });
      const data = (await res.json()) as AIFeedback;
      setFeedback(data);
      await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "writing",
          taskLabel: current.label,
          bandScore: data.overallBand,
          userResponse: text,
          feedback: data,
        }),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setActive("t1")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              active === "t1"
                ? "bg-fuchsia-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {task1.label}
          </button>
          <button
            onClick={() => setActive("t2")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              active === "t2"
                ? "bg-fuchsia-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {task2.label}
          </button>
        </div>
        <Timer seconds={current.timeMinutes * 60} running={true} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-2 text-xs uppercase tracking-wide text-fuchsia-600">
            {current.label} • min {current.minWords} words • {current.timeMinutes} min
          </p>
          <h3 className="text-lg font-semibold text-slate-900">Question</h3>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {current.prompt}
          </p>
          {current.dataDescription && (
            <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 font-mono text-xs text-slate-700">
              {current.dataDescription}
            </pre>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Your answer</h3>
            <span
              className={`text-xs font-semibold ${
                wordCount >= current.minWords ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              {wordCount} / {current.minWords} words
            </span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your response here…"
            className="h-80 w-full resize-y rounded-lg border border-slate-300 p-3 text-sm leading-relaxed focus:border-fuchsia-500 focus:outline-none"
          />
          <div className="mt-3 flex justify-end">
            <button
              onClick={submit}
              disabled={loading || !text.trim()}
              className="rounded-xl bg-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-fuchsia-700 disabled:opacity-50"
            >
              {loading ? "Getting AI feedback…" : "Submit for AI feedback"}
            </button>
          </div>
        </div>
      </div>

      {feedback && (
        <div>
          <h3 className="mb-3 text-lg font-bold text-slate-900">🧠 AI Examiner Feedback</h3>
          <FeedbackPanel feedback={feedback} />
        </div>
      )}
    </div>
  );
}
