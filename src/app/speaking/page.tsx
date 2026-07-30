import { SpeakingClient } from "./SpeakingClient";
import { getActiveSpeaking } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function SpeakingPage() {
  const active = await getActiveSpeaking();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-amber-600">Section 4</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">🎤 Speaking</h1>
        <p className="mt-2 text-sm text-slate-600">
          Answer prompts across all three parts. You can type or use voice input (browser
          support required). AI feedback covers fluency, lexis, grammar and pronunciation.
        </p>
      </div>
      <SpeakingClient test={active} />
    </div>
  );
}
