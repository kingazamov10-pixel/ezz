import { ListeningClient } from "./ListeningClient";
import { getActiveListening } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function ListeningPage() {
  const active = await getActiveListening();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-indigo-600">Section 1</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">🎧 Listening</h1>
        <p className="mt-2 text-sm text-slate-600">{active.intro}</p>
      </div>
      <ListeningClient
        title={active.title}
        transcript={active.transcript}
        questions={active.questions}
      />
    </div>
  );
}
