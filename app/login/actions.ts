"use server";

import { cookies } from "next/headers";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_DURATION_MS } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const validUser = process.env.BASIC_AUTH_USER;
  const validPass = process.env.BASIC_AUTH_PASS;

  if (!validUser || !validPass) {
    return { error: "サーバーの認証設定がされていません。" };
  }

  // ユーザー名またはパスワードが一致しない場合
  if (username !== validUser || password !== validPass) {
    return { error: "IDまたはパスワードが正しくありません。" };
  }

  const token = await createSessionToken();
  if (!token) {
    return { error: "サーバーの認証設定（AUTH_SECRET）がされていません。" };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(Date.now() + SESSION_DURATION_MS),
    path: "/",
  });

  return { success: true };
}
