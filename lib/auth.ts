// lib/auth.ts
// HMAC署名付きセッショントークンの発行・検証。
// Web Crypto APIのみを使うため、Node（Server Actions）とEdge（middleware）の両方で動作する。

const SESSION_COOKIE_NAME = "auth_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7日間

export { SESSION_COOKIE_NAME, SESSION_DURATION_MS };

function getSecret(): string | null {
  return process.env.AUTH_SECRET || null;
}

async function hmacSign(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return bufferToHex(sigBuf);
}

function bufferToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * 有効期限つきの署名トークンを発行する。形式: "<expiresAtMs>.<hmac>"
 */
export async function createSessionToken(): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;

  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const signature = await hmacSign(String(expiresAt), secret);
  return `${expiresAt}.${signature}`;
}

/**
 * トークンの署名と有効期限を検証する。
 */
export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  const secret = getSecret();
  if (!secret || !token) return false;

  const dotIndex = token.indexOf(".");
  if (dotIndex === -1) return false;

  const expiresAtStr = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);

  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  const expected = await hmacSign(expiresAtStr, secret);

  // タイミング攻撃対策の定数時間比較
  if (signature.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
