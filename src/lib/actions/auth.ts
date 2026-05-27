"use server";

import { redirect } from "next/navigation";
import { destroySession, loginWithEmail } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await loginWithEmail(email, password);
  if (!user) redirect("/login?error=invalid");

  if (user.role === "OWNER") redirect("/owner");
  redirect("/staff");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
