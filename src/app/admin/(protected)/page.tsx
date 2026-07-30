import Link from "next/link";
import { db } from "@/db";
import {
  listeningTests,
  readingTests,
  writingTasks,
  speakingPrompts,
  attempts,
} from "@/db/schema";
import { count, eq } from "drizzle-orm";
import { appSettings } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function saveSettings(formData: FormData) {
  "use server";
  if (!(await isAuthenticated())) redirect("/admin/login");
  const key = String(formData.get("apiKey") || "").trim();
  await db
    .insert(appSettings)
    .values({ key: "GEMINI_API_KEY", value: key })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { value: key, updatedAt: new Date() },
    });
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?saved=1");
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [l] = await db.select({ n: count() }).from(listeningTests);
  const [r] = await db.select({ n: count() }).from(readingTests);
  const [w] = await db.select({ n: count() }).from(writingTasks);
  const [s] = await db.select({ n: count() }).from(speakingPrompts);
  const [a] = await db.select({ n: count() }).from(attempts);
  const [gemSetting] = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.key, "GEMINI_API_KEY"))
    .limit(1);

  const currentKey = gemSetting?.value || "";
  const params = await searchParams;
  const isSaved = params.saved === "1";

  const counts: Record<string, number> = {
    listening: l.n,
    reading: r.n,
    writing: w.n,
    speaking: s.n,
  };

  const CARDS = [
    {
      href: "/admin/listening",
      title: "Listening Tests",
      icon: "🎧",
      color: "from-sky-500 to-cyan-500",
      table: "listening",
    },
    {
      href: "/admin/reading",
      title: "Reading Passages",
      icon: "📖",
      color: "from-emerald-500 to-teal-500",
      table: "reading",
    },
    {
      href: "/admin/writing",
      title: "Writing Tasks",
      icon: "✍️",
      color: "from-fuchsia-500 to-pink-500",
      table: "writing",
    },
    {
      href: "/admin/speaking",
      title: "Speaking Prompts",
      icon: "🎤",
      color: "from-amber-500 to-orange-500",
      table: "speaking",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">👑 Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage IELTS content and configure AI feedback settings.
        </p>
      </div>

      {isSaved && (
        <div className="rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
          ✓ Gemini API key saved successfully! AI feedback is now active.
        </div>
      )}

      {/* Gemini API Key Box */}
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔷</span>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Gemini AI API Key</h2>
            <p className="text-xs text-slate-600">
              Enter your Google AI Studio key so students get real AI examiner feedback.
            </p>
          </div>
        </div>
        <form action={saveSettings} className="mt-4 flex flex-wrap items-center gap-3">
          <input
            type="password"
            name="apiKey"
            defaultValue={currentKey}
            placeholder="AIzaSy..."
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            Save API Key
          </button>
        </form>
        <p className="mt-2 text-[11px] text-slate-500">
          Get a free key at{" "}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noreferrer"
            className="text-indigo-600 underline"
          >
            aistudio.google.com/apikey
          </a>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${c.color}`} />
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{c.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{c.title}</h3>
                  <p className="text-xs text-slate-500">
                    {counts[c.table]} record{counts[c.table] === 1 ? "" : "s"} in database
                  </p>
                </div>
              </div>
              <span className="text-slate-300 group-hover:text-indigo-500">→</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-slate-500">Total attempts</p>
        <p className="mt-1 text-3xl font-bold text-slate-900">{a.n}</p>
        <Link
          href="/results"
          className="mt-3 inline-block rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
        >
          View results →
        </Link>
      </div>
    </div>
  );
}
