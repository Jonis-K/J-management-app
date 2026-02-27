import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

function unauthorized() {
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Protected"' },
  });
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ APIはスキップ（サーバ側の内部fetchやフロントの取得が401で壊れるのを防ぐ）
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASS;

  // 認証情報が未設定なら、事故防止でアクセス拒否
  if (!user || !pass) return unauthorized();

  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Basic ")) return unauthorized();

  const base64 = auth.slice("Basic ".length);
  const decoded = Buffer.from(base64, "base64").toString("utf8");
  const [u, p] = decoded.split(":");

  if (u !== user || p !== pass) return unauthorized();

  return NextResponse.next();
}