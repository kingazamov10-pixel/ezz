import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/lib/auth";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

async function logoutAction() {
  "use server";
  await logout();
  redirect("/admin/login");
}

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "🏠" },
  { href: "/admin/listening", label: "Listening", icon: "🎧" },
  { href: "/admin/reading", label: "Reading", icon: "📖" },
  { href: "/admin/writing", label: "Writing", icon: "✍️" },
  { href: "/admin/speaking", label: "Speaking", icon: "🎤" },
];

export default function AdminProtectedLayout({ children }: { children: ReactNode }) {
  // Auth is enforced by middleware.ts (see src/middleware.ts).
  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="mb-2 px-3 pt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Admin
          </p>
          <nav className="flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <span>{n.icon}</span>
                <span>{n.label}</span>
              </Link>
            ))}
          </nav>
          <form action={logoutAction} className="mt-2 border-t border-slate-100 pt-2">
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50">
              🚪 Logout
            </button>
          </form>
        </div>
      </aside>
      <section>{children}</section>
    </div>
  );
}
