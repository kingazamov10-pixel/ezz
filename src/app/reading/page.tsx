import { ReadingClient } from "./ReadingClient";
import { db } from "@/db";
import { readingTests } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { readingTest as sampleReading, type Question } from "@/lib/ielts-data";

export const dynamic = "force-dynamic";

export default async function ReadingPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  const requestedId = params.id ? Number(params.id) : null;

  let allPassages: { id: number; title: string; passage: string; questions: Question[] }[] = [];
  try {
    const rows = await db
      .select()
      .from(readingTests)
      .where(eq(readingTests.isActive, true))
      .orderBy(desc(readingTests.createdAt));
    allPassages = rows.map((r) => ({
      id: r.id,
      title: r.title,
      passage: r.passage,
      questions: r.questions as Question[],
    }));
  } catch {
    // fallback
  }

  let current = allPassages.find((p) => p.id === requestedId) || allPassages[0];
  if (!current) {
    current = {
      id: 0,
      title: sampleReading.title,
      passage: sampleReading.passage,
      questions: sampleReading.questions,
    };
  }

  const passList = allPassages.map((p) => ({ id: p.id, title: p.title }));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-emerald-600 font-bold">Section 2 • Reading</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">{current.title}</h1>
        <p className="mt-2 text-sm text-slate-600">
          Read the academic passage carefully, highlight key terms, adjust text size, and answer the questions. Recommended time: 15 minutes.
        </p>
      </div>
      <ReadingClient
        title={current.title}
        passage={current.passage}
        questions={current.questions}
        allPassages={passList.length > 0 ? passList : undefined}
        currentId={current.id || undefined}
      />
    </div>
  );
}
