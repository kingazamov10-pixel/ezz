import { NextResponse } from "next/server";
import { generateSpeakingFeedback } from "@/lib/feedback";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    prompt: string;
    response: string;
    partLabel: string;
  };
  const feedback = await generateSpeakingFeedback(body.prompt, body.response, body.partLabel);
  return NextResponse.json(feedback);
}
