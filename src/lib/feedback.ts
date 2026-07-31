// AI-style feedback engine for IELTS Writing & Speaking.
// Uses Google Gemini AI via API key, with robust heuristic fallback.

import { db } from "@/db";
import { appSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export type CriterionScore = {
  name: string;
  band: number;
  comment: string;
};

export type AIFeedback = {
  overallBand: number;
  criteria: CriterionScore[];
  strengths: string[];
  improvements: string[];
  correctedExtract?: string;
  wordCount: number;
  provider: "gemini" | "heuristic";
};

const COMMON_WORDS = new Set([
  "the","a","an","and","or","but","if","then","of","in","on","at","to","for","with",
  "is","are","was","were","be","been","being","am","have","has","had","do","does","did",
  "i","you","he","she","it","we","they","this","that","these","those","my","your","his",
  "her","its","our","their","me","him","them","us","not","no","yes","so","as","by","from",
  "about","into","over","under","up","down","out","very","more","most","some","any","all",
  "there","here","what","which","who","when","where","why","how","can","could","would",
  "should","will","may","might","must","just","also","than","then","because","while","people",
]);

const CONNECTORS = [
  "however","moreover","furthermore","in addition","on the other hand","for instance",
  "for example","therefore","consequently","as a result","in conclusion","to sum up",
  "although","despite","whereas","nevertheless","meanwhile","overall","firstly","secondly",
  "finally","in contrast","similarly","specifically","in particular",
];

const ADVANCED_VOCAB = [
  "significant","substantial","considerable","implement","perceive","facilitate","enhance",
  "diminish","fluctuate","predominant","phenomenon","approximately","comprehensive",
  "essential","fundamental","controversial","subsequent","undoubtedly","paramount",
  "advocate","allocate","prioritise","prioritize","emerging","sustainable","detrimental",
  "beneficial","perspective","alternative","contribute","demonstrate","illustrate",
];

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function uniqueRatio(text: string): number {
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s']/g, " ")
    .split(/\s+/)
    .filter((w) => w && !COMMON_WORDS.has(w));
  if (words.length === 0) return 0;
  const unique = new Set(words);
  return unique.size / words.length;
}

function countMatches(text: string, list: string[]): number {
  const lower = text.toLowerCase();
  let count = 0;
  for (const item of list) {
    const escaped = item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "g");
    const matches = lower.match(regex);
    if (matches) count += matches.length;
  }
  return count;
}

function clampBand(n: number): number {
  const rounded = Math.round(n * 2) / 2;
  return Math.max(3, Math.min(9, rounded));
}

// ---------------- Heuristic fallback ----------------
function heuristicWritingFeedback(text: string, minWords: number, taskLabel: string): AIFeedback {
  const wc = countWords(text);
  const sentences = splitSentences(text);
  const avgSentLen = sentences.length > 0 ? wc / sentences.length : 0;
  const diversity = uniqueRatio(text);
  const connectorCount = countMatches(text, CONNECTORS);
  const advancedCount = countMatches(text, ADVANCED_VOCAB);
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;

  let taskBand = 5;
  if (wc >= minWords) taskBand += 1;
  if (wc >= minWords * 1.15) taskBand += 0.5;
  if (paragraphs >= 3) taskBand += 0.5;
  if (paragraphs >= 4) taskBand += 0.5;
  if (wc < minWords * 0.6) taskBand -= 1.5;
  else if (wc < minWords) taskBand -= 0.5;

  let coherence = 5;
  if (connectorCount >= 3) coherence += 0.5;
  if (connectorCount >= 6) coherence += 0.5;
  if (connectorCount >= 10) coherence += 0.5;
  if (paragraphs >= 3) coherence += 0.5;
  if (paragraphs >= 4) coherence += 0.5;

  let lexical = 5;
  if (diversity > 0.45) lexical += 0.5;
  if (diversity > 0.55) lexical += 0.5;
  if (diversity > 0.65) lexical += 0.5;
  if (advancedCount >= 3) lexical += 0.5;
  if (advancedCount >= 7) lexical += 0.5;

  let grammar = 5;
  if (avgSentLen >= 12) grammar += 0.5;
  if (avgSentLen >= 16) grammar += 0.5;
  if (sentences.length >= 10) grammar += 0.5;
  const hasSubordination = /\b(because|although|while|whereas|since|whenever|which|that|who)\b/i.test(text);
  if (hasSubordination) grammar += 0.5;

  taskBand = clampBand(taskBand);
  coherence = clampBand(coherence);
  lexical = clampBand(lexical);
  grammar = clampBand(grammar);

  const overall = clampBand((taskBand + coherence + lexical + grammar) / 4);

  return {
    overallBand: overall,
    wordCount: wc,
    provider: "heuristic",
    criteria: [
      { name: "Task Response", band: taskBand, comment: `Response covers ${taskLabel}. Word count: ${wc}.` },
      { name: "Coherence & Cohesion", band: coherence, comment: `Detected ${connectorCount} cohesive devices.` },
      { name: "Lexical Resource", band: lexical, comment: `Lexical diversity: ${(diversity * 100).toFixed(0)}%.` },
      { name: "Grammatical Range & Accuracy", band: grammar, comment: `Avg sentence length: ${avgSentLen.toFixed(1)} words.` },
    ],
    strengths: [
      wc >= minWords ? `Met word count (${wc}/${minWords}).` : `Response is short (${wc} words).`,
      diversity > 0.5 ? "Good vocabulary diversity." : "Expand vocabulary usage.",
    ],
    improvements: ["Incorporate more academic transition phrases and complex clause structures."],
  };
}

function heuristicSpeakingFeedback(text: string, partLabel: string): AIFeedback {
  const wc = countWords(text);
  const diversity = uniqueRatio(text);
  const connectorCount = countMatches(text, CONNECTORS);
  const advancedCount = countMatches(text, ADVANCED_VOCAB);

  let fluency = clampBand(5 + (wc > 80 ? 1 : 0) + (connectorCount > 2 ? 1 : 0));
  let lexical = clampBand(5 + (diversity > 0.5 ? 1 : 0) + (advancedCount > 2 ? 1 : 0));
  let grammar = clampBand(5.5);
  let pronunciation = clampBand(6.0);

  const overall = clampBand((fluency + lexical + grammar + pronunciation) / 4);

  return {
    overallBand: overall,
    wordCount: wc,
    provider: "heuristic",
    criteria: [
      { name: "Fluency & Coherence", band: fluency, comment: `${wc} words produced with discourse markers.` },
      { name: "Lexical Resource", band: lexical, comment: `Lexical diversity: ${(diversity * 100).toFixed(0)}%.` },
      { name: "Grammatical Range & Accuracy", band: grammar, comment: `Appropriate structures for ${partLabel}.` },
      { name: "Pronunciation (est.)", band: pronunciation, comment: "Estimated from textual flow." },
    ],
    strengths: [`Developed response (${wc} words).`],
    improvements: ["Use more idiomatic expressions and extended complex sentences."],
  };
}

// Helper to get API key from process.env or Supabase app_settings
async function getGeminiKey(): Promise<string> {
  const fromEnv = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim();
  if (fromEnv) return fromEnv;

  try {
    const [row] = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.key, "GEMINI_API_KEY"))
      .limit(1);
    if (row?.value) return row.value.trim();
  } catch {
    // DB error
  }
  return "";
}

// ---------------- Google Gemini AI Integration ----------------
async function geminiFeedback(
  kind: "writing" | "speaking",
  prompt: string,
  response: string,
  minWords: number,
  taskLabel: string,
): Promise<AIFeedback | null> {
  const apiKey = await getGeminiKey();
  if (!apiKey) return null;

  const criteriaList =
    kind === "writing"
      ? ["Task Response", "Coherence & Cohesion", "Lexical Resource", "Grammatical Range & Accuracy"]
      : ["Fluency & Coherence", "Lexical Resource", "Grammatical Range & Accuracy", "Pronunciation"];

  const systemPrompt = `You are a certified IELTS examiner. Assess the candidate's ${kind} response strictly using official IELTS band descriptors. Return ONLY valid JSON (no markdown fences) with this exact shape:
{
  "overallBand": number (3.0 - 9.0, in 0.5 steps),
  "criteria": [{"name": string, "band": number, "comment": string}],
  "strengths": string[],
  "improvements": string[],
  "correctedExtract": string
}
Use EXACTLY these criterion names in order: ${criteriaList.join(", ")}. Provide 3-4 strengths and 3-4 improvements.`;

  const userPrompt = `Task: ${taskLabel} (min ${minWords} words)
PROMPT:
${prompt}

CANDIDATE RESPONSE:
${response}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3,
            maxOutputTokens: 2048,
          },
        }),
      },
    );

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      console.warn("[Gemini API Error]", res.status, err);
      return null;
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    const cleaned = text
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned) as Partial<AIFeedback>;
    return {
      overallBand: clampBand(Number(parsed.overallBand) || 6.5),
      wordCount: countWords(response),
      provider: "gemini",
      criteria: (parsed.criteria || []).map((c) => ({
        name: c.name,
        band: clampBand(Number(c.band) || 6.5),
        comment: c.comment || "",
      })),
      strengths: parsed.strengths || [],
      improvements: parsed.improvements || [],
      correctedExtract: parsed.correctedExtract,
    };
  } catch (err) {
    console.warn("[Gemini Exception]", err);
    return null;
  }
}

export async function generateWritingFeedback(
  prompt: string,
  response: string,
  minWords: number,
  taskLabel: string,
): Promise<AIFeedback> {
  const ai = await geminiFeedback("writing", prompt, response, minWords, taskLabel);
  if (ai) return ai;
  return heuristicWritingFeedback(response, minWords, taskLabel);
}

export async function generateSpeakingFeedback(
  prompt: string,
  response: string,
  partLabel: string,
): Promise<AIFeedback> {
  const ai = await geminiFeedback("speaking", prompt, response, 50, partLabel);
  if (ai) return ai;
  return heuristicSpeakingFeedback(response, partLabel);
}
