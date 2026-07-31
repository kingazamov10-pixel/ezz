import { redirect } from "next/navigation";
import { loginUser, getLoggedUser } from "@/lib/user-auth";

export const dynamic = "force-dynamic";

async function authAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") || "");
  const name = String(formData.get("name") || "");
  const redirectTo = String(formData.get("redirectTo") || "/");
  try {
    await loginUser(email, name);
  } catch {
    redirect("/auth/login?error=1");
  }
  redirect(redirectTo);
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}) {
  const user = await getLoggedUser();
  const params = await searchParams;
  const redirectTo = params.redirect || "/";
  const showError = params.error === "1";

  if (user) {
    // Already logged in
    redirect(redirectTo);
  }

  return (
    <div className="mx-auto max-w-md pt-12">
      <div className="glass-card rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200">
        <div className="text-center mb-8">
          <span className="inline-grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white text-2xl shadow-lg shadow-indigo-500/30 mb-4">
            🎓
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">Sign in to IELTS Pro</h1>
          <p className="mt-2 text-sm text-slate-600">
            Enter your email to track your test history, band scores, and AI feedback.
          </p>
        </div>

        <form action={authAction} className="space-y-4">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Your Full Name
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              autoFocus
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              placeholder="john@example.com"
            />
          </div>

          {showError && (
            <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 border border-rose-200">
              Please enter a valid email address.
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-700 hover:shadow-indigo-600/40"
          >
            Continue with Email →
          </button>
        </form>
      </div>
    </div>
  );
}
