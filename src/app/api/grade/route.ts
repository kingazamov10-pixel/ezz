import { NextResponse } from "next/server";
import type { Question } from "@/lib/ielts-data";
import { getActiveListening, getActiveReading } from "@/lib/content";

export const dynamic = "force-dynamic";

function rawToBand(correct: number): number {
  const scaled = correct * 4;
  if (scaled >= 39) return 9.0;
  if (scaled >= 37) return 8.5;
  if (scaled >= 35) return 8.0;
  if (scaled >= 33) return 7.5;
  if (scaled >= 30) return 7.0;
  if (scaled >= 27) return 6.5;
  if (scaled >= 23) return 6.0;
  if (scaled >= 20) return 5.5;
  if (scaled >= 16) return 5.0;
  if (scaled >= 13) return 4.5;
  if (scaled >= 10) return 4.0;
  if (scaled >= 6) return 3.5;
  return 3.0;
}

function normalise(s: string): string {
  return s.trim().toLowerCase().replace(/[.,!?"']/g, "").replace(/\s+/g, " ");
}

function grade(questions: Question[], answers: Record<string, string>) {
  let correct = 0;
  const details = questions.map((q) => {
    const given = (answers[q.id] ?? "").toString();
    let isCorrect = false;
    let expected = "";
    if (q.type === "mcq") {
      expected = q.options[q.answer];
      isCorrect = Number(given) === q.answer;
    } else if (q.type === "fill") {
      expected = q.answer;
      const norm = normalise(given);
      const accept = [q.answer, ...(q.acceptable ?? [])].map(normalise);
      isCorrect = norm.length > 0 && accept.includes(norm);
    } else {
      expected = q.answer;
      isCorrect = normalise(given) === normalise(q.answer);
    }
    if (isCorrect) correct += 1;
    return { id: q.id, question: q.question, expected, given, isCorrect };
  });
  return { correct, total: questions.length, band: rawToBand(correct), details };
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    section: "listening" | "reading";
    answers: Record<string, string>;
  };
  const active =
    body.section === "listening" ? await getActiveListening() : await getActiveReading();
  const result = grade(active.questions, body.answers);
  return NextResponse.json(result);
}
