import { notFound } from "next/navigation";
import { db } from "@/db";
import { speakingPrompts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SpeakingForm } from "../SpeakingForm";

export const dynamic = "force-dynamic";

export default async function EditSpeakingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [row] = await db.select().from(speakingPrompts).where(eq(speakingPrompts.id, Number(id)));
  if (!row) notFound();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">🎤 Edit Speaking Prompt</h1>
      <SpeakingForm row={row} />
    </div>
  );
}
