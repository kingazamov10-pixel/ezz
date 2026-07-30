import { SpeakingForm } from "../SpeakingForm";

export const dynamic = "force-dynamic";

export default function NewSpeakingPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">🎤 New Speaking Prompt</h1>
      <SpeakingForm />
    </div>
  );
}
