// Content fetchers: prefer DB content (admin-managed), fallback to sample data.

import { db } from "@/db";
import {
  listeningTests,
  readingTests,
  writingTasks,
  speakingPrompts,
} from "@/db/schema";
import { desc, eq, and, asc } from "drizzle-orm";
import {
  listeningTest as sampleListening,
  readingTest as sampleReading,
  writingTasks as sampleWriting,
  speakingTest as sampleSpeaking,
  type Question,
} from "./ielts-data";

export type ActiveListening = {
  id: number | null;
  title: string;
  intro: string;
  transcript: string;
  questions: Question[];
};

export type ActiveReading = {
  id: number | null;
  title: string;
  passage: string;
  questions: Question[];
};

export type ActiveWriting = {
  task1: {
    id: number | null;
    label: string;
    minWords: number;
    timeMinutes: number;
    prompt: string;
    dataDescription?: string | null;
  };
  task2: {
    id: number | null;
    label: string;
    minWords: number;
    timeMinutes: number;
    prompt: string;
    dataDescription?: string | null;
  };
};

export type ActiveSpeaking = {
  part1: { id: number | null; label: string; timeMinutes: number; questions: string[] };
  part2: { id: number | null; label: string; timeMinutes: number; prompt: string };
  part3: { id: number | null; label: string; timeMinutes: number; questions: string[] };
};

export async function getActiveListening(): Promise<ActiveListening> {
  try {
    const rows = await db
      .select()
      .from(listeningTests)
      .where(eq(listeningTests.isActive, true))
      .orderBy(desc(listeningTests.createdAt))
      .limit(1);
    const row = rows[0];
    if (row) {
      return {
        id: row.id,
        title: row.title,
        intro: row.intro,
        transcript: row.transcript,
        questions: row.questions as Question[],
      };
    }
  } catch {
    // fall through
  }
  return { id: null, ...sampleListening };
}

export async function getActiveReading(): Promise<ActiveReading> {
  try {
    const rows = await db
      .select()
      .from(readingTests)
      .where(eq(readingTests.isActive, true))
      .orderBy(desc(readingTests.createdAt))
      .limit(1);
    const row = rows[0];
    if (row) {
      return {
        id: row.id,
        title: row.title,
        passage: row.passage,
        questions: row.questions as Question[],
      };
    }
  } catch {
    // fall through
  }
  return { id: null, ...sampleReading };
}

export async function getActiveWriting(): Promise<ActiveWriting> {
  try {
    const t1Rows = await db
      .select()
      .from(writingTasks)
      .where(and(eq(writingTasks.isActive, true), eq(writingTasks.taskNumber, 1)))
      .orderBy(desc(writingTasks.createdAt))
      .limit(1);
    const t2Rows = await db
      .select()
      .from(writingTasks)
      .where(and(eq(writingTasks.isActive, true), eq(writingTasks.taskNumber, 2)))
      .orderBy(desc(writingTasks.createdAt))
      .limit(1);
    const t1 = t1Rows[0];
    const t2 = t2Rows[0];
    return {
      task1: t1
        ? {
            id: t1.id,
            label: t1.label,
            minWords: t1.minWords,
            timeMinutes: t1.timeMinutes,
            prompt: t1.prompt,
            dataDescription: t1.dataDescription ?? null,
          }
        : { id: null, ...sampleWriting.task1 },
      task2: t2
        ? {
            id: t2.id,
            label: t2.label,
            minWords: t2.minWords,
            timeMinutes: t2.timeMinutes,
            prompt: t2.prompt,
            dataDescription: t2.dataDescription ?? null,
          }
        : { id: null, ...sampleWriting.task2 },
    };
  } catch {
    return {
      task1: { id: null, ...sampleWriting.task1 },
      task2: { id: null, ...sampleWriting.task2 },
    };
  }
}

export async function getActiveSpeaking(): Promise<ActiveSpeaking> {
  try {
    const rows = await db
      .select()
      .from(speakingPrompts)
      .where(eq(speakingPrompts.isActive, true))
      .orderBy(asc(speakingPrompts.part), desc(speakingPrompts.createdAt));

    const byPart: Record<number, typeof rows[number]> = {};
    for (const r of rows) if (!byPart[r.part]) byPart[r.part] = r;

    const p1 = byPart[1];
    const p2 = byPart[2];
    const p3 = byPart[3];
    return {
      part1: p1
        ? {
            id: p1.id,
            label: p1.label,
            timeMinutes: p1.timeMinutes,
            questions: (p1.questions as string[]) ?? [],
          }
        : { id: null, ...sampleSpeaking.part1 },
      part2: p2
        ? {
            id: p2.id,
            label: p2.label,
            timeMinutes: p2.timeMinutes,
            prompt: p2.prompt ?? "",
          }
        : { id: null, ...sampleSpeaking.part2 },
      part3: p3
        ? {
            id: p3.id,
            label: p3.label,
            timeMinutes: p3.timeMinutes,
            questions: (p3.questions as string[]) ?? [],
          }
        : { id: null, ...sampleSpeaking.part3 },
    };
  } catch {
    return {
      part1: { id: null, ...sampleSpeaking.part1 },
      part2: { id: null, ...sampleSpeaking.part2 },
      part3: { id: null, ...sampleSpeaking.part3 },
    };
  }
}
