import { notFound } from "next/navigation";
import { db } from "@/db";
import { listeningTests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ListeningForm } from "../ListeningForm";

export const dynamic = "force-dynamic";

export default async function EditListeningPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [row] = await db
    .select()
    .from(listeningTests)
    .where(eq(listeningTests.id, Number(id)));
  if (!row) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">🎧 Edit Listening Test</h1>
      <ListeningForm row={row} />
    </div>
  );
}
