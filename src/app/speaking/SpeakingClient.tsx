"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { Timer } from "@/components/Timer";
import type { AIFeedback } from "@/lib/feedback";

type SpeakingTest = {
  part1: { label: string; timeMinutes: number; questions: string[] };
  part2: { label: string; timeMinutes: number; prompt: string };
  part3: { label: string; timeMinutes: number; questions: string[] };
};

// Minimal SpeechRecognition types (browser prefixed)
type SpeechRecognitionEventLike = {
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: { transcript: string };
    };
  };
};
type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: unknown) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export function SpeakingClient({ test }: { test: SpeakingTest }) {
  const [active, setActive] = useState<"p1" | "p2" | "p3">("p1");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, AIFeedback>>({});
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [recordingKey, setRecordingKey] = useState<string | null>(null);
  const [supportsSpeech, setSupportsSpeech] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    setSupportsSpeech(!!Ctor);
  }, []);

  function toggleRecord(key: string) {
    if (typeof window === "undefined") return;
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;
    if (recordingKey === key) {
      recRef.current?.stop();
      setRecordingKey(null);
      return;
    }
    if (recRef.current) recRef.current.stop();
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    let finalText = answers[key] ?? "";
    rec.onresult = (e: SpeechRecognitionEventLike) => {
      let interim = "";
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript + " ";
        else interim += r[0].transcript;
      }
      setAnswers((a) => ({ ...a, [key]: (finalText + interim).trim() }));
    };
    rec.onend = () => setRecordingKey(null);
    rec.onerror = () => setRecordingKey(null);
    recRef.current = rec;
    rec.start();
    setRecordingKey(key);
  }

  function speakPrompt(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.lang = "en-GB";
    window.speechSynthesis.speak(u);
  }

  async function getFeedback(key: string, prompt: string, partLabel: string) {
    const response = answers[key];
    if (!response || !response.trim()) return;
    setLoadingKey(key);
    try {
      const res = await fetch("/api/feedback/speaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, response, partLabel }),
      });
      const data = (await res.json()) as AIFeedback;
      setFeedbacks((f) => ({ ...f, [key]: data }));
      await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "speaking",
          taskLabel: `${partLabel} — ${prompt.slice(0, 60)}`,
          bandScore: data.overallBand,
          userResponse: response,
          feedback: data,
        }),
      });
    } finally {
      setLoadingKey(null);
    }
  }

  const current = active === "p1" ? test.part1 : active === "p2" ? test.part2 : test.part3;

  const items = useMemo(() => {
    if (active === "p1") return test.part1.questions.map((q, i) => ({ key: `p1-${i}`, q }));
    if (active === "p3") return test.part3.questions.map((q, i) => ({ key: `p3-${i}`, q }));
    return [{ key: "p2-0", q: test.part2.prompt }];
  }, [active, test]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex gap-2">
          {(["p1", "p2", "p3"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setActive(k)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                active === k
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {k === "p1" ? "Part 1" : k === "p2" ? "Part 2" : "Part 3"}
            </button>
          ))}
        </div>
        <Timer seconds={current.timeMinutes * 60} running={true} />
      </div>

      {!supportsSpeech && (
        <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
          Voice input is not supported in this browser. You can still type your responses.
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-amber-600">{current.label}</p>
        {active === "p2" && (
          <div className="mt-3 whitespace-pre-line rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
            <p className="mb-2 text-xs font-semibold text-slate-500">Cue card</p>
            {test.part2.prompt}
          </div>
        )}
        {active === "p2" && (
          <p className="mt-3 text-xs text-slate-500">
            You will have 1 minute to prepare, then talk for 1–2 minutes.
          </p>
        )}
      </div>

      <div className="space-y-4">
        {items.map((item, i) => {
          const feedback = feedbacks[item.key];
          const isRecording = recordingKey === item.key;
          return (
            <div key={item.key} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="whitespace-pre-line font-medium text-slate-900">{item.q}</p>
                    <button
                      onClick={() => speakPrompt(item.q)}
                      className="shrink-0 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      🔊 Listen
                    </button>
                  </div>
                  <textarea
                    value={answers[item.key] ?? ""}
                    onChange={(e) =>
                      setAnswers((a) => ({ ...a, [item.key]: e.target.value }))
                    }
                    placeholder="Speak your answer or type it here…"
                    className="mt-3 h-32 w-full resize-y rounded-lg border border-slate-300 p-3 text-sm focus:border-amber-500 focus:outline-none"
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {supportsSpeech && (
                      <button
                        onClick={() => toggleRecord(item.key)}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold shadow-sm ${
                          isRecording
                            ? "animate-pulse bg-rose-600 text-white hover:bg-rose-700"
                            : "bg-slate-800 text-white hover:bg-slate-900"
                        }`}
                      >
                        {isRecording ? "⏹ Stop recording" : "🎙 Record answer"}
                      </button>
                    )}
                    <button
                      onClick={() => getFeedback(item.key, item.q, current.label)}
                      disabled={loadingKey === item.key || !(answers[item.key] ?? "").trim()}
                      className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 disabled:opacity-50"
                    >
                      {loadingKey === item.key ? "Analysing…" : "Get AI feedback"}
                    </button>
                    <span className="text-xs text-slate-500">
                      {(answers[item.key] ?? "").trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                  {feedback && (
                    <div className="mt-4">
                      <FeedbackPanel feedback={feedback} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
