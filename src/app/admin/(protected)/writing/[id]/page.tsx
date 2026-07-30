import { notFound } from "next/navigation";
import { db } from "@/db";
import { writingTasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { WritingForm } from "../WritingForm";

export const dynamic = "force-dynamic";

export default async function EditWritingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [row] = await db.select().from(writingTasks).where(eq(writingTasks.id, Number(id)));
  if (!row) notFound();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">✍️ Edit Writing Task</h1>
      <WritingForm row={row} />
    </div>
  );
}
