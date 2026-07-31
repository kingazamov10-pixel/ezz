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
    return NextResponse.json({ explanation: `The correct answer is "${body.expected}" based on the reading passage.` });
  }

  const systemPrompt = `You are an expert IELTS Reading tutor. Explain clearly in 2-3 concise sentences why the answer to the reading question is correct, referencing the context of the passage.`;
  const userPrompt = `Passage excerpt:
${body.passage}

Question: ${body.question}
Correct Answer: ${body.expected}
Student's Answer: ${body.given} (${body.isCorrect ? "Correct" : "Incorrect"})

Explain why this answer is correct and where it matches the passage.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 512 },
        }),
      },
    );

    if (!res.ok) {
      return NextResponse.json({ explanation: `The correct answer is "${body.expected}" based on the reading passage.` });
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return NextResponse.json({ explanation: text || `The correct answer is "${body.expected}".` });
  } catch {
    return NextResponse.json({ explanation: `The correct answer is "${body.expected}".` });
  }
}
