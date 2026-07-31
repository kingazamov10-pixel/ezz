import { NextResponse } from "next/server";
import { db } from "@/db";
import { attempts } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getLoggedUser } from "@/lib/user-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");

  if (email) {
    const rows = await db
      .select()
      .from(attempts)
      .where(eq(attempts.userEmail, email))
      .orderBy(desc(attempts.createdAt))
      .limit(50);
    return NextResponse.json({ attempts: rows });
  }

  const rows = await db.select().from(attempts).orderBy(desc(attempts.createdAt)).limit(50);
  return NextResponse.json({ attempts: rows });
}

export async function POST(request: Request) {
  const user = await getLoggedUser();
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
      userEmail: user?.email || null,
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
