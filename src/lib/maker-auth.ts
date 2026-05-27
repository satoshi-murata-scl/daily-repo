import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "daily_repo_maker";

function authKey(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return secret;
}

export function getMakerSecretFromEnv(): string | null {
  const secret = process.env.MAKER_SECRET?.trim();
  if (!secret || secret.length < 16) return null;
  return secret;
}

function expectedSessionToken(): string | null {
  const maker = getMakerSecretFromEnv();
  if (!maker) return null;
  return createHmac("sha256", authKey()).update(`maker:${maker}`).digest("hex");
}

export function verifyMakerPassword(input: string): boolean {
  const expected = getMakerSecretFromEnv();
  if (!expected) return false;

  const trimmed = input.trim();
  const a = Buffer.from(trimmed);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function createMakerSession() {
  const token = expectedSessionToken();
  if (!token) {
    throw new Error("MAKER_SECRET is not configured");
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function destroyMakerSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isMakerSession(): Promise<boolean> {
  const expected = expectedSessionToken();
  if (!expected) return false;

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;

  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function requireMakerSession(): Promise<void> {
  if (!(await isMakerSession())) {
    redirect("/maker/login");
  }
}

export function isMakerSecretConfigured(): boolean {
  return getMakerSecretFromEnv() !== null;
}
