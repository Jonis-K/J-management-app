// lib/image.ts

/**
 * Google Driveの共有リンク等を直接表示可能なURLに変換する。
 *
 * 従来の uc?export=view 形式はGoogle側の仕様変更でブロックされることが
 * 多くなったため、安定して表示できる thumbnail 形式に変換する。
 */
export function fixImageUrl(url?: string, size = 200): string {
  const u = (url ?? "").trim();
  // http(s)以外（空欄・メモ書き・相対パス等）はnext/imageがクラッシュするため空扱いにする
  if (!u.startsWith("http://") && !u.startsWith("https://")) return "";

  const toThumbnail = (id: string) =>
    `https://drive.google.com/thumbnail?id=${id}&sz=w${size}`;

  // 1) file/d/<ID> パターン
  const fileIdMatch = u.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileIdMatch?.[1]) {
    return toThumbnail(fileIdMatch[1]);
  }

  // 2) open?id=<ID> や uc?id=<ID> 等、Driveドメインの id パラメータ
  if (u.includes("drive.google.com")) {
    const idParamMatch = u.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch?.[1]) {
      return toThumbnail(idParamMatch[1]);
    }
  }

  // 3) それ以外（直URL等）はそのまま
  return u;
}

/**
 * Next.jsのImage最適化を通さず表示すべきURLか（Driveはリダイレクトするため）
 */
export function isDriveImage(url: string): boolean {
  return url.includes("drive.google.com");
}

// next.config.ts の remotePatterns で最適化を許可しているホスト
const OPTIMIZABLE_HOSTS = new Set([
  "drive.google.com",
  "lh3.googleusercontent.com",
  "images.unsplash.com",
]);

/**
 * 画像最適化をスキップすべきURLか。
 * 許可リスト外のホストを最適化に通すとページ全体が500エラーになるため、
 * シート入力由来の未知のURLは unoptimized で直接表示する。
 * （Driveはリダイレクトするため許可ホストでもスキップする）
 */
export function shouldSkipOptimization(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return !OPTIMIZABLE_HOSTS.has(host) || host === "drive.google.com";
  } catch {
    return true;
  }
}
