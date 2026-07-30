import { NextResponse } from "next/server";
import { login } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  let password = "";
  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => ({}))) as { password?: string };
    password = String(body.password ?? "");
  } else {
    const form = await request.formData();
    password = String(form.get("password") ?? "");
  }
  const ok = await login(password);
  if (!ok) return NextResponse.json({ ok: false, error: "wrong password" }, { status: 401 });
  return NextResponse.json({ ok: true });
}
