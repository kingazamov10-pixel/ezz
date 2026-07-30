import { WritingForm } from "../WritingForm";

export const dynamic = "force-dynamic";

export default function NewWritingPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">✍️ New Writing Task</h1>
      <WritingForm />
    </div>
  );
}
