import { redirect } from "next/navigation";
import { isAuthenticated, login } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function loginAction(formData: FormData) {
  "use server";
  const password = String(formData.get("password") ?? "");
  const ok = await login(password);
  if (!ok) redirect("/admin/login?error=1");
  redirect("/admin");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [authed, params] = await Promise.all([isAuthenticated(), searchParams]);
  if (authed) redirect("/admin");
  const showError = params.error === "1";

  return (
    <div className="mx-auto max-w-md pt-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-indigo-600 text-2xl text-white">
            🔐
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
          <p className="mt-1 text-sm text-slate-600">Enter your admin password to continue</p>
        </div>
        <form action={loginAction} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Password</label>
            <input
              type="password"
              name="password"
              required
              autoFocus
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          {showError && (
            <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
              Incorrect password. Try again.
            </div>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            Sign in
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-slate-500">
          Default password: <code className="rounded bg-slate-100 px-1.5 py-0.5">admin123</code>
          <br />
          Override with <code className="rounded bg-slate-100 px-1.5 py-0.5">ADMIN_PASSWORD</code> in{" "}
          <code>.env</code>
        </p>
      </div>
    </div>
  );
}
