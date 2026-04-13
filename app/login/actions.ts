"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

  // 認証成功時、7日間有効なセッションCookieを発行
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const cookieStore = await cookies();
  cookieStore.set("auth_session", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires,
    path: "/",
  });

  return { success: true };
}
