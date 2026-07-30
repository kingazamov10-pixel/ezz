"use client";

import { useEffect, useRef, useState } from "react";
import type { Question } from "@/lib/ielts-data";
import { BandBadge } from "@/components/BandBadge";

type GradeResult = {
  correct: number;
  total: number;
  band: number;
  details: { id: string; question: string; expected: string; given: string; isCorrect: boolean }[];
};

export function ListeningClient({
  title,
  transcript,
  questions,
}: {
  title: string;
  transcript: string;
  questions: Question[];
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [supported, setSupported] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function playAudio() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(transcript);
    u.rate = 0.95;
    u.pitch = 1;
    u.lang = "en-GB";
    u.onend = () => setIsPlaying(false);
    u.onerror = () => setIsPlaying(false);
    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
    setIsPlaying(true);
  }

  function stopAudio() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setIsPlaying(false);
  }

  async function submit() {
    setSubmitting(true);
    const res = await fetch("/api/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: "listening", answers }),
    });
    const data = (await res.json()) as GradeResult;
    setResult(data);
    // Save attempt
    await fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section: "listening",
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
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500">
              Play the audio once (you cannot pause mid-question in the real exam).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!isPlaying ? (
              <button
                onClick={playAudio}
                disabled={!supported}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                ▶ Play audio
              </button>
            ) : (
              <button
                onClick={stopAudio}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700"
              >
                ■ Stop
              </button>
            )}
            <button
              onClick={() => setShowTranscript((v) => !v)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {showTranscript ? "Hide" : "Show"} transcript
            </button>
          </div>
        </div>
        {!supported && (
          <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
            Your browser does not support speech synthesis. Please use the transcript button below
            to read the passage.
          </p>
        )}
        {showTranscript && (
          <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
            {transcript}
          </pre>
        )}
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

      <div className="space-y-4">
        {questions.map((q, i) => {
          const detail = result?.details.find((d) => d.id === q.id);
          const isRight = detail?.isCorrect;
          return (
            <div
              key={q.id}
              className={`rounded-xl border bg-white p-5 shadow-sm ${
                detail ? (isRight ? "border-emerald-300" : "border-rose-300") : "border-slate-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{q.question}</p>
                  <div className="mt-3">
                    {q.type === "mcq" && (
                      <div className="space-y-2">
                        {q.options.map((opt, idx) => (
                          <label
                            key={idx}
                            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-slate-50"
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
                        className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                        placeholder="Type your answer"
                      />
                    )}
                    {q.type === "tfng" && (
                      <div className="flex flex-wrap gap-2">
                        {(["TRUE", "FALSE", "NOT GIVEN"] as const).map((v) => (
                          <label
                            key={v}
                            className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                              answers[q.id] === v
                                ? "border-indigo-600 bg-indigo-600 text-white"
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
                    <p className={`mt-2 text-xs ${isRight ? "text-emerald-700" : "text-rose-700"}`}>
                      {isRight ? "✓ Correct" : `✗ Correct answer: ${detail.expected}`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-4 flex justify-end">
        <button
          onClick={submit}
          disabled={submitting}
          className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? "Submitting…" : result ? "Re-check answers" : "Submit answers"}
        </button>
      </div>
    </div>
  );
}
