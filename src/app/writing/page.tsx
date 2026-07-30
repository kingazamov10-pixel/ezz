import { WritingClient } from "./WritingClient";
import { getActiveWriting } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function WritingPage() {
  const active = await getActiveWriting();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-fuchsia-600">Section 3</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">✍️ Writing</h1>
        <p className="mt-2 text-sm text-slate-600">
          Complete Task 1 and Task 2 within 60 minutes total. Get instant AI-powered examiner
          feedback with band scores for all four criteria.
        </p>
      </div>
      <WritingClient
        task1={{
          label: active.task1.label,
          minWords: active.task1.minWords,
          timeMinutes: active.task1.timeMinutes,
          prompt: active.task1.prompt,
          dataDescription: active.task1.dataDescription ?? undefined,
        }}
        task2={{
          label: active.task2.label,
          minWords: active.task2.minWords,
          timeMinutes: active.task2.timeMinutes,
          prompt: active.task2.prompt,
          dataDescription: active.task2.dataDescription ?? undefined,
        }}
      />
    </div>
  );
}
