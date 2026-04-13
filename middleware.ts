import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ APIやログイン画面はスキップ（無限ループやAPI機能の阻害を防ぐ）
  if (pathname.startsWith("/api") || pathname === "/login") {
    return NextResponse.next();
  }

  // セッションCookieを確認
  const session = req.cookies.get("auth_session")?.value;

  if (session !== "authenticated") {
    // 未認証の場合はカスタムログイン画面へリダイレクト
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}