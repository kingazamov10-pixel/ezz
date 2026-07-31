import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const USER_COOKIE = "ielts_user_email";
const USER_NAME_COOKIE = "ielts_user_name";

export async function getLoggedUser(): Promise<{ email: string; name: string } | null> {
  const store = await cookies();
  const email = store.get(USER_COOKIE)?.value;
  const name = store.get(USER_NAME_COOKIE)?.value || email?.split("@")[0] || "User";
  if (!email) return null;
  return { email, name };
}

export async function loginUser(emailInput: string, nameInput?: string): Promise<{ email: string; name: string }> {
  const email = emailInput.trim().toLowerCase();
  const name = (nameInput || email.split("@")[0]).trim();
  if (!email || !email.includes("@")) throw new Error("Valid email is required");

  // Upsert user in database
  try {
    await db
      .insert(users)
      .values({ email, name })
      .onConflictDoUpdate({
        target: users.email,
        set: { name, createdAt: new Date() },
      });
  } catch {
    // ignore db error for auth resilience
  }

  const store = await cookies();
  store.set(USER_COOKIE, email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  store.set(USER_NAME_COOKIE, name, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return { email, name };
}

export async function logoutUser() {
  const store = await cookies();
  store.delete(USER_COOKIE);
  store.delete(USER_NAME_COOKIE);
}
