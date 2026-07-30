import { NextResponse } from "next/server";
import { generateWritingFeedback } from "@/lib/feedback";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    prompt: string;
    response: string;
    minWords: number;
    taskLabel: string;
  };
  const feedback = await generateWritingFeedback(
    body.prompt,
    body.response,
    body.minWords,
    body.taskLabel,
  );
  return NextResponse.json(feedback);
}
