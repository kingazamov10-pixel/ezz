import { ListeningForm } from "../ListeningForm";

export const dynamic = "force-dynamic";

export default function NewListeningPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">🎧 New Listening Test</h1>
      <ListeningForm />
    </div>
  );
}
