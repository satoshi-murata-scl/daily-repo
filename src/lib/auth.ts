import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

const COOKIE_NAME = "daily_repo_session";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  storeId: string;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    storeId: user.storeId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as Role,
      storeId: payload.storeId as string,
    };
  } catch {
    return null;
  }
}

/** DB上にユーザーが存在するか検証（シードやDB再作成後の無効セッション対策） */
export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/login");

  const staff = await prisma.staff.findUnique({
    where: { id: session.id },
    select: { id: true, email: true, name: true, role: true, storeId: true },
  });

  if (!staff) {
    redirect("/api/auth/clear-session?error=session");
  }

  return {
    id: staff.id,
    email: staff.email,
    name: staff.name,
    role: staff.role,
    storeId: staff.storeId,
  };
}

export async function requireOwner(): Promise<SessionUser> {
  const session = await requireSession();
  if (session.role !== "OWNER") redirect("/staff");
  return session;
}

export async function requireStaff(): Promise<SessionUser> {
  const session = await requireSession();
  if (session.role !== "STAFF") redirect("/owner");
  return session;
}

export async function loginWithEmail(email: string, password: string) {
  const staff = await prisma.staff.findUnique({ where: { email } });
  if (!staff) return null;

  const ok = await verifyPassword(password, staff.passwordHash);
  if (!ok) return null;

  const user: SessionUser = {
    id: staff.id,
    email: staff.email,
    name: staff.name,
    role: staff.role,
    storeId: staff.storeId,
  };

  await createSession(user);
  return user;
}

export function toSessionUser(staff: {
  id: string;
  email: string;
  name: string;
  role: Role;
  storeId: string;
}): SessionUser {
  return {
    id: staff.id,
    email: staff.email,
    name: staff.name,
    role: staff.role,
    storeId: staff.storeId,
  };
}
