"use server";

import { db } from "@/db";
import {
  listeningTests,
  readingTests,
  writingTasks,
  speakingPrompts,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";

async function requireAuth() {
  if (!(await isAuthenticated())) redirect("/admin/login");
}

function parseQuestionsJSON(raw: string): unknown {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("Questions JSON is required");
  try {
    return JSON.parse(trimmed);
  } catch {
    throw new Error("Invalid JSON in questions field");
  }
}

// ---------- Listening ----------
export async function saveListening(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id") || 0) || null;
  const title = String(formData.get("title") || "").trim();
  const intro = String(formData.get("intro") || "").trim();
  const transcript = String(formData.get("transcript") || "").trim();
  const questions = parseQuestionsJSON(String(formData.get("questions") || ""));
  const isActive = formData.get("isActive") === "on";
  if (!title || !transcript) throw new Error("Title and transcript are required");

  if (id) {
    await db
      .update(listeningTests)
      .set({ title, intro, transcript, questions, isActive })
      .where(eq(listeningTests.id, id));
  } else {
    await db.insert(listeningTests).values({ title, intro, transcript, questions, isActive });
  }
  revalidatePath("/admin/listening");
  revalidatePath("/listening");
  redirect("/admin/listening");
}

export async function deleteListening(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id"));
  if (id) await db.delete(listeningTests).where(eq(listeningTests.id, id));
  revalidatePath("/admin/listening");
  revalidatePath("/listening");
}

// ---------- Reading ----------
export async function saveReading(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id") || 0) || null;
  const title = String(formData.get("title") || "").trim();
  const passage = String(formData.get("passage") || "").trim();
  const questions = parseQuestionsJSON(String(formData.get("questions") || ""));
  const isActive = formData.get("isActive") === "on";
  if (!title || !passage) throw new Error("Title and passage are required");

  if (id) {
    await db
      .update(readingTests)
      .set({ title, passage, questions, isActive })
      .where(eq(readingTests.id, id));
  } else {
    await db.insert(readingTests).values({ title, passage, questions, isActive });
  }
  revalidatePath("/admin/reading");
  revalidatePath("/reading");
  redirect("/admin/reading");
}

export async function deleteReading(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id"));
  if (id) await db.delete(readingTests).where(eq(readingTests.id, id));
  revalidatePath("/admin/reading");
  revalidatePath("/reading");
}

// ---------- Writing ----------
export async function saveWriting(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id") || 0) || null;
  const taskNumber = Number(formData.get("taskNumber"));
  const label = String(formData.get("label") || "").trim();
  const prompt = String(formData.get("prompt") || "").trim();
  const minWords = Number(formData.get("minWords") || 150);
  const timeMinutes = Number(formData.get("timeMinutes") || 20);
  const dataDescription = String(formData.get("dataDescription") || "").trim() || null;
  const isActive = formData.get("isActive") === "on";
  if (!label || !prompt || !(taskNumber === 1 || taskNumber === 2)) {
    throw new Error("Label, prompt and taskNumber (1 or 2) are required");
  }

  if (id) {
    await db
      .update(writingTasks)
      .set({ taskNumber, label, prompt, minWords, timeMinutes, dataDescription, isActive })
      .where(eq(writingTasks.id, id));
  } else {
    await db.insert(writingTasks).values({
      taskNumber,
      label,
      prompt,
      minWords,
      timeMinutes,
      dataDescription,
      isActive,
    });
  }
  revalidatePath("/admin/writing");
  revalidatePath("/writing");
  redirect("/admin/writing");
}

export async function deleteWriting(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id"));
  if (id) await db.delete(writingTasks).where(eq(writingTasks.id, id));
  revalidatePath("/admin/writing");
  revalidatePath("/writing");
}

// ---------- Speaking ----------
export async function saveSpeaking(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id") || 0) || null;
  const part = Number(formData.get("part"));
  const label = String(formData.get("label") || "").trim();
  const timeMinutes = Number(formData.get("timeMinutes") || 4);
  const isActive = formData.get("isActive") === "on";

  if (!label || ![1, 2, 3].includes(part)) {
    throw new Error("Label and part (1, 2 or 3) are required");
  }

  let prompt: string | null = null;
  let questions: unknown = null;
  if (part === 2) {
    prompt = String(formData.get("prompt") || "").trim();
    if (!prompt) throw new Error("Part 2 requires a cue-card prompt");
  } else {
    const raw = String(formData.get("questionsList") || "").trim();
    if (!raw) throw new Error("Provide at least one question (one per line)");
    questions = raw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  }

  if (id) {
    await db
      .update(speakingPrompts)
      .set({ part, label, timeMinutes, prompt, questions, isActive })
      .where(eq(speakingPrompts.id, id));
  } else {
    await db.insert(speakingPrompts).values({
      part,
      label,
      timeMinutes,
      prompt,
      questions,
      isActive,
    });
  }
  revalidatePath("/admin/speaking");
  revalidatePath("/speaking");
  redirect("/admin/speaking");
}

export async function deleteSpeaking(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id"));
  if (id) await db.delete(speakingPrompts).where(eq(speakingPrompts.id, id));
  revalidatePath("/admin/speaking");
  revalidatePath("/speaking");
}
