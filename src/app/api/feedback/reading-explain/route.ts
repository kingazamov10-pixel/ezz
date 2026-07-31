import { NextResponse } from "next/server";
import { readEnv } from "@/lib/env";
import { db } from "@/db";
import { appSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function getGeminiKey(): Promise<string> {
  const fromEnv = readEnv("GEMINI_API_KEY") || readEnv("GOOGLE_API_KEY");
  if (fromEnv) return fromEnv;
  try {
    const [row] = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.key, "GEMINI_API_KEY"))
      .limit(1);
    if (row?.value) return row.value.trim();
  } catch {
    // ignore
  }
  return "";
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    passage: string;
    question: string;
    expected: string;
    given: string;
    isCorrect: boolean;
  };

  const apiKey = await getGeminiKey();
  if (!apiKey) {
    return NextResponse.json({
      explanation: `The correct answer is "${body.expected}" based on the reading text.`,
    });
  }

  const systemPrompt = `You are an expert IELTS Reading examiner and tutor. Provide a detailed, insightful explanation for why a reading question has a specific answer. State the correct answer clearly, quote or reference the exact sentence from the passage that proves it, and explain the logical reasoning in 3-4 professional sentences.`;

  const userPrompt = `PASSAGE:
${body.passage}

QUESTION: ${body.question}
CORRECT ANSWER: ${body.expected}
STUDENT'S ANSWER: ${body.given} (${body.isCorrect ? "Correct" : "Incorrect"})

Provide a detailed IELTS tutor explanation with passage evidence.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
        }),
      },
    );

    if (!res.ok) {
      return NextResponse.json({
        explanation: `The correct answer is "${body.expected}".`,
      });
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return NextResponse.json({ explanation: text || `The correct answer is "${body.expected}".` });
  } catch {
    return NextResponse.json({
      explanation: `The correct answer is "${body.expected}".`,
    });
  }
}
