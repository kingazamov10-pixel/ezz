import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { db } from "@/db";
import { appSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

let cache: Record<string, string> | null = null;

function parseDotEnv(content: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIdx = line.indexOf("=");
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    let value = line.slice(eqIdx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) out[key] = value;
  }
  return out;
}

function loadFileEnv(): Record<string, string> {
  if (cache) return cache;
  const merged: Record<string, string> = {};
  const cwd = process.cwd();
  for (const file of [".env", ".env.local"]) {
    const p = join(cwd, file);
    if (!existsSync(p)) continue;
    try {
      const parsed = parseDotEnv(readFileSync(p, "utf8"));
      for (const [k, v] of Object.entries(parsed)) {
        if (v) merged[k] = v;
      }
    } catch {
      // ignore
    }
  }
  cache = merged;
  return merged;
}

export function readEnv(name: string): string {
  const fromProcess = (process.env[name] || "").trim();
  if (fromProcess) return fromProcess;
  const fromFile = (loadFileEnv()[name] || "").trim();
  return fromFile;
}

export async function readEnvAsync(name: string): Promise<string> {
  const syncVal = readEnv(name);
  if (syncVal) return syncVal;

  if (name === "GEMINI_API_KEY" || name === "GOOGLE_API_KEY") {
    try {
      const [row] = await db
        .select()
        .from(appSettings)
        .where(eq(appSettings.key, "GEMINI_API_KEY"))
        .limit(1);
      if (row?.value) return row.value.trim();
    } catch {
      // DB not ready yet
    }
  }
  return "";
}
