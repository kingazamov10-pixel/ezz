import { notFound } from "next/navigation";
import { db } from "@/db";
import { readingTests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ReadingForm } from "../ReadingForm";

export const dynamic = "force-dynamic";

export default async function EditReadingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [row] = await db.select().from(readingTests).where(eq(readingTests.id, Number(id)));
  if (!row) notFound();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">📖 Edit Reading Passage</h1>
      <ReadingForm row={row} />
    </div>
  );
}
