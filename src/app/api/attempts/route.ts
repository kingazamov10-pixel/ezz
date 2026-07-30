import { NextResponse } from "next/server";
import { db } from "@/db";
import { attempts } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db.select().from(attempts).orderBy(desc(attempts.createdAt)).limit(50);
  return NextResponse.json({ attempts: rows });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    section: string;
    taskLabel: string;
    bandScore: number;
    rawScore?: number;
    totalQuestions?: number;
    userResponse: string;
    feedback: unknown;
  };
  const [row] = await db
    .insert(attempts)
    .values({
      section: body.section,
      taskLabel: body.taskLabel,
      bandScore: body.bandScore,
      rawScore: body.rawScore ?? null,
      totalQuestions: body.totalQuestions ?? null,
      userResponse: body.userResponse,
      feedback: body.feedback as object,
    })
    .returning();
  return NextResponse.json({ attempt: row });
}
