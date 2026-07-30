import { ReadingForm } from "../ReadingForm";

export const dynamic = "force-dynamic";

export default function NewReadingPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">📖 New Reading Passage</h1>
      <ReadingForm />
    </div>
  );
}
