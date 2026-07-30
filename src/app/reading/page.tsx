import { ReadingClient } from "./ReadingClient";
import { getActiveReading } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function ReadingPage() {
  const active = await getActiveReading();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-emerald-600">Section 2</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">📖 Reading</h1>
        <p className="mt-2 text-sm text-slate-600">
          Read the passage carefully and answer the questions. Recommended time: 15 minutes.
        </p>
      </div>
      <ReadingClient
        title={active.title}
        passage={active.passage}
        questions={active.questions}
      />
    </div>
  );
}
