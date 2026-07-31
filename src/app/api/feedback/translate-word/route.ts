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
  const body = (await request.json()) as { word: string; context: string };
  const apiKey = await getGeminiKey();

  if (!apiKey) {
    return NextResponse.json({
      definition: `Definition for "${body.word}": (AI key not configured).`,
    });
  }

  const systemPrompt = `You are a helpful IELTS vocabulary tutor. Provide a concise, clear definition of the given word/phrase in English, and its translation/meaning in Uzbek. Keep it under 2 sentences.`;
  const userPrompt = `Word/Phrase: "${body.word}"
Context sentence: "${body.context}"

Provide definition and meaning.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 256 },
        }),
      },
    );

    if (!res.ok) {
      return NextResponse.json({ definition: `Definition unavailable for "${body.word}".` });
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return NextResponse.json({ definition: text || `Definition for "${body.word}".` });
  } catch {
    return NextResponse.json({ definition: `Definition unavailable for "${body.word}".` });
  }
}
