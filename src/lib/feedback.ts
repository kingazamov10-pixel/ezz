// AI-style feedback engine for IELTS Writing & Speaking.
// Tries Google Gemini → OpenAI → heuristic scoring, in that order.

import { readEnv, readEnvAsync } from "./env";

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
  provider: "gemini" | "openai" | "heuristic";
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
  const rounded = Math.round(n * 2) / 2; // to nearest 0.5
  return Math.max(3, Math.min(9, rounded));
}

// ---------------- Heuristic scoring ----------------
function heuristicWritingFeedback(text: string, minWords: number, taskLabel: string): AIFeedback {
  const wc = countWords(text);
  const sentences = splitSentences(text);
  const avgSentLen = sentences.length > 0 ? wc / sentences.length : 0;
  const diversity = uniqueRatio(text);
  const connectorCount = countMatches(text, CONNECTORS);
  const advancedCount = countMatches(text, ADVANCED_VOCAB);
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;

  // Task Response
  let taskBand = 5;
  if (wc >= minWords) taskBand += 1;
  if (wc >= minWords * 1.15) taskBand += 0.5;
  if (paragraphs >= 3) taskBand += 0.5;
  if (paragraphs >= 4) taskBand += 0.5;
  if (wc < minWords * 0.6) taskBand -= 1.5;
  else if (wc < minWords) taskBand -= 0.5;

  // Coherence & Cohesion
  let coherence = 5;
  if (connectorCount >= 3) coherence += 0.5;
  if (connectorCount >= 6) coherence += 0.5;
  if (connectorCount >= 10) coherence += 0.5;
  if (paragraphs >= 3) coherence += 0.5;
  if (paragraphs >= 4) coherence += 0.5;
  if (sentences.length < 5) coherence -= 1;

  // Lexical Resource
  let lexical = 5;
  if (diversity > 0.45) lexical += 0.5;
  if (diversity > 0.55) lexical += 0.5;
  if (diversity > 0.65) lexical += 0.5;
  if (advancedCount >= 3) lexical += 0.5;
  if (advancedCount >= 7) lexical += 0.5;
  if (advancedCount >= 12) lexical += 0.5;
  if (wc < minWords * 0.7) lexical -= 1;

  // Grammatical Range & Accuracy
  let grammar = 5;
  if (avgSentLen >= 12) grammar += 0.5;
  if (avgSentLen >= 16) grammar += 0.5;
  if (avgSentLen >= 20 && avgSentLen <= 28) grammar += 0.5;
  if (sentences.length >= 10) grammar += 0.5;
  const hasSubordination = /\b(because|although|while|whereas|since|whenever|whereas|which|that|who)\b/i.test(text);
  if (hasSubordination) grammar += 0.5;
  const looksLikeCaps = /^[a-z]/.test(text.trim());
  if (looksLikeCaps) grammar -= 0.5;

  taskBand = clampBand(taskBand);
  coherence = clampBand(coherence);
  lexical = clampBand(lexical);
  grammar = clampBand(grammar);

  const overall = clampBand((taskBand + coherence + lexical + grammar) / 4);

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (wc >= minWords) strengths.push(`You met the word count requirement (${wc}/${minWords} words).`);
  else improvements.push(`Your response is too short (${wc} words). Aim for at least ${minWords}.`);

  if (connectorCount >= 6) strengths.push(`Good use of cohesive devices (${connectorCount} connectors detected).`);
  else improvements.push("Use more linking words such as 'however', 'furthermore', 'consequently'.");

  if (diversity > 0.55) strengths.push("Good lexical variety — you avoid repeating the same words.");
  else improvements.push("Try to widen your vocabulary and use more synonyms.");

  if (advancedCount >= 5) strengths.push(`You used ${advancedCount} academic / advanced vocabulary items.`);
  else improvements.push("Incorporate more academic vocabulary (e.g. 'significant', 'contribute', 'demonstrate').");

  if (avgSentLen >= 15) strengths.push("Sentence length shows a range of complex structures.");
  else improvements.push("Combine short sentences using relative clauses and subordinators.");

  if (paragraphs >= 4) strengths.push("Clear paragraphing structure.");
  else improvements.push("Organise your essay into 4 clear paragraphs (intro, body 1, body 2, conclusion).");

  return {
    overallBand: overall,
    wordCount: wc,
    provider: "heuristic",
    criteria: [
      {
        name: "Task Response",
        band: taskBand,
        comment: `Your response covers the ${taskLabel} prompt. Length: ${wc} words, ${paragraphs} paragraph(s).`,
      },
      {
        name: "Coherence & Cohesion",
        band: coherence,
        comment: `Detected ${connectorCount} cohesive devices across ${sentences.length} sentences.`,
      },
      {
        name: "Lexical Resource",
        band: lexical,
        comment: `Lexical diversity: ${(diversity * 100).toFixed(0)}%. Advanced vocabulary hits: ${advancedCount}.`,
      },
      {
        name: "Grammatical Range & Accuracy",
        band: grammar,
        comment: `Average sentence length: ${avgSentLen.toFixed(1)} words. ${hasSubordination ? "Complex structures present." : "Add more subordinate clauses."}`,
      },
    ],
    strengths,
    improvements,
  };
}

function heuristicSpeakingFeedback(text: string, partLabel: string): AIFeedback {
  const wc = countWords(text);
  const sentences = splitSentences(text);
  const diversity = uniqueRatio(text);
  const connectorCount = countMatches(text, CONNECTORS);
  const advancedCount = countMatches(text, ADVANCED_VOCAB);
  const fillerCount = countMatches(text, ["um","uh","er","like","you know"]);

  let fluency = 5;
  if (wc >= 60) fluency += 0.5;
  if (wc >= 100) fluency += 0.5;
  if (wc >= 160) fluency += 0.5;
  if (sentences.length >= 5) fluency += 0.5;
  if (connectorCount >= 3) fluency += 0.5;
  if (fillerCount > 5) fluency -= 0.5;

  let lexical = 5;
  if (diversity > 0.5) lexical += 0.5;
  if (diversity > 0.6) lexical += 0.5;
  if (advancedCount >= 2) lexical += 0.5;
  if (advancedCount >= 5) lexical += 0.5;
  if (advancedCount >= 8) lexical += 0.5;

  let grammar = 5;
  const hasSubordination = /\b(because|although|while|whereas|since|when|if|which|that|who)\b/i.test(text);
  if (hasSubordination) grammar += 1;
  if (sentences.length >= 6) grammar += 0.5;
  const avgSentLen = sentences.length > 0 ? wc / sentences.length : 0;
  if (avgSentLen >= 10) grammar += 0.5;
  if (avgSentLen >= 14) grammar += 0.5;

  // Pronunciation: we can't hear speech, so give a neutral estimate anchored to fluency
  const pronunciation = clampBand(fluency - 0.5 + (Math.random() * 0.5));

  fluency = clampBand(fluency);
  lexical = clampBand(lexical);
  grammar = clampBand(grammar);
  const overall = clampBand((fluency + lexical + grammar + pronunciation) / 4);

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (wc >= 80) strengths.push(`You gave a developed answer (${wc} words).`);
  else improvements.push("Extend your answers — aim for at least 80 words per response.");

  if (connectorCount >= 3) strengths.push("Good use of discourse markers.");
  else improvements.push("Use linking phrases like 'to be honest', 'on top of that', 'the thing is'.");

  if (advancedCount >= 3) strengths.push("Nice range of topic-specific vocabulary.");
  else improvements.push("Use more precise, less common vocabulary.");

  if (hasSubordination) strengths.push("You are producing complex sentences.");
  else improvements.push("Use more complex grammar (because, although, if, which…).");

  if (fillerCount > 5) improvements.push(`Reduce filler words (detected ${fillerCount}).`);

  return {
    overallBand: overall,
    wordCount: wc,
    provider: "heuristic",
    criteria: [
      {
        name: "Fluency & Coherence",
        band: fluency,
        comment: `${wc} words across ${sentences.length} sentences with ${connectorCount} connectors.`,
      },
      {
        name: "Lexical Resource",
        band: lexical,
        comment: `Diversity ${(diversity * 100).toFixed(0)}%, ${advancedCount} advanced items.`,
      },
      {
        name: "Grammatical Range & Accuracy",
        band: grammar,
        comment: `${hasSubordination ? "Complex structures observed." : "Mostly simple structures."} Avg sentence: ${avgSentLen.toFixed(1)} words.`,
      },
      {
        name: "Pronunciation (est.)",
        band: pronunciation,
        comment: `${partLabel}: pronunciation estimated from fluency (audio not analysed).`,
      },
    ],
    strengths,
    improvements,
  };
}

// ---------------- Shared prompt builder ----------------
function buildPrompts(
  kind: "writing" | "speaking",
  prompt: string,
  response: string,
  minWords: number,
  taskLabel: string,
) {
  const criteriaList =
    kind === "writing"
      ? ["Task Response", "Coherence & Cohesion", "Lexical Resource", "Grammatical Range & Accuracy"]
      : ["Fluency & Coherence", "Lexical Resource", "Grammatical Range & Accuracy", "Pronunciation"];

  const systemPrompt = `You are a certified IELTS examiner. Assess the candidate's ${kind} response strictly using the official IELTS band descriptors. Return ONLY valid JSON (no markdown, no code fences) with this exact shape:
{
  "overallBand": number (3.0 - 9.0, in 0.5 steps),
  "criteria": [{"name": string, "band": number, "comment": string}],
  "strengths": string[],
  "improvements": string[],
  "correctedExtract": string
}
Use EXACTLY these criterion names, in this order: ${criteriaList.join(", ")}.
Give 3-5 concrete strengths and 3-5 concrete improvements. The "correctedExtract" should be 1-2 improved sentences rewritten from the candidate's response.`;

  const userPrompt = `Task: ${taskLabel} (minimum ${minWords} words)

PROMPT:
${prompt}

CANDIDATE RESPONSE:
${response}`;

  return { systemPrompt, userPrompt, criteriaList };
}

function normaliseAIResponse(
  raw: string,
  provider: "gemini" | "openai",
  response: string,
): AIFeedback | null {
  try {
    // Strip common markdown code fences if the model returned them
    const cleaned = raw
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    const parsed = JSON.parse(cleaned) as Partial<AIFeedback>;
    return {
      overallBand: clampBand(Number(parsed.overallBand) || 6),
      wordCount: countWords(response),
      provider,
      criteria: (parsed.criteria || []).map((c) => ({
        name: c.name,
        band: clampBand(Number(c.band) || 6),
        comment: c.comment || "",
      })),
      strengths: parsed.strengths || [],
      improvements: parsed.improvements || [],
      correctedExtract: parsed.correctedExtract,
    };
  } catch {
    return null;
  }
}

// ---------------- Google Gemini ----------------
async function geminiFeedback(
  kind: "writing" | "speaking",
  prompt: string,
  response: string,
  minWords: number,
  taskLabel: string,
): Promise<AIFeedback | null> {
  const apiKey =
    (await readEnvAsync("GEMINI_API_KEY")) ||
    (await readEnvAsync("GOOGLE_API_KEY"));
  if (!apiKey) return null;

  const model = readEnv("GEMINI_MODEL") || "gemini-flash-latest";
  const { systemPrompt, userPrompt } = buildPrompts(kind, prompt, response, minWords, taskLabel);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.4,
            maxOutputTokens: 2048,
          },
        }),
      },
    );
    if (!res.ok) {
      // Try to log Gemini's error message to server console for debugging
      const errText = await res.text().catch(() => "");
      console.warn(`[Gemini] ${res.status}: ${errText.slice(0, 300)}`);
      return null;
    }
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    return normaliseAIResponse(text, "gemini", response);
  } catch (err) {
    console.warn("[Gemini] request failed:", err);
    return null;
  }
}

// ---------------- Optional OpenAI ----------------
async function openAIFeedback(
  kind: "writing" | "speaking",
  prompt: string,
  response: string,
  minWords: number,
  taskLabel: string,
): Promise<AIFeedback | null> {
  const apiKey = readEnv("OPENAI_API_KEY");
  if (!apiKey) return null;

  const { systemPrompt, userPrompt } = buildPrompts(kind, prompt, response, minWords, taskLabel);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: readEnv("OPENAI_MODEL") || "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.4,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn(`[OpenAI] ${res.status}: ${errText.slice(0, 300)}`);
      return null;
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    return normaliseAIResponse(content, "openai", response);
  } catch (err) {
    console.warn("[OpenAI] request failed:", err);
    return null;
  }
}

export async function generateWritingFeedback(
  prompt: string,
  response: string,
  minWords: number,
  taskLabel: string,
): Promise<AIFeedback> {
  // Priority: Gemini → OpenAI → heuristic fallback
  const gemini = await geminiFeedback("writing", prompt, response, minWords, taskLabel);
  if (gemini) return gemini;
  const openai = await openAIFeedback("writing", prompt, response, minWords, taskLabel);
  if (openai) return openai;
  return heuristicWritingFeedback(response, minWords, taskLabel);
}

export async function generateSpeakingFeedback(
  prompt: string,
  response: string,
  partLabel: string,
): Promise<AIFeedback> {
  const gemini = await geminiFeedback("speaking", prompt, response, 50, partLabel);
  if (gemini) return gemini;
  const openai = await openAIFeedback("speaking", prompt, response, 50, partLabel);
  if (openai) return openai;
  return heuristicSpeakingFeedback(response, partLabel);
}
