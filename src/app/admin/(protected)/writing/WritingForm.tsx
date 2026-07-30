import Link from "next/link";
import { saveWriting } from "@/app/admin/actions";

type Row = {
  id: number;
  taskNumber: number;
  label: string;
  prompt: string;
  minWords: number;
  timeMinutes: number;
  dataDescription: string | null;
  isActive: boolean;
};

export function WritingForm({ row }: { row?: Row }) {
  return (
    <form
      action={saveWriting}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {row?.id && <input type="hidden" name="id" value={row.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Task Number *</label>
          <select
            name="taskNumber"
            defaultValue={row?.taskNumber ?? 1}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-fuchsia-500 focus:outline-none"
          >
            <option value={1}>Task 1 (data / chart)</option>
            <option value={2}>Task 2 (essay)</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Label *</label>
          <input
            name="label"
            required
            defaultValue={row?.label ?? "Writing Task 1"}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-fuchsia-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Min words *</label>
          <input
            type="number"
            name="minWords"
            min={50}
            required
            defaultValue={row?.minWords ?? 150}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-fuchsia-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Time (minutes) *</label>
          <input
            type="number"
            name="timeMinutes"
            min={5}
            required
            defaultValue={row?.timeMinutes ?? 20}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-fuchsia-500 focus:outline-none"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-700">Prompt *</label>
        <textarea
          name="prompt"
          required
          rows={6}
          defaultValue={row?.prompt ?? ""}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-fuchsia-500 focus:outline-none"
          placeholder="The chart below shows... Summarise the information by..."
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-700">
          Data description (Task 1 only — optional)
        </label>
        <textarea
          name="dataDescription"
          rows={5}
          defaultValue={row?.dataDescription ?? ""}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs focus:border-fuchsia-500 focus:outline-none"
          placeholder="• Low income: 22% → 78%&#10;• Middle income: 45% → 94%"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={row?.isActive ?? true}
          className="h-4 w-4"
        />
        Active
      </label>
      <div className="flex justify-end gap-2">
        <Link
          href="/admin/writing"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="rounded-lg bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-fuchsia-700"
        >
          {row?.id ? "Save changes" : "Create"}
        </button>
      </div>
    </form>
  );
}
