// lib/goals.ts
// 目標の期限まわりの計算ユーティリティ。
// deadline は Sheets 由来の文字列（"2026-09-30" / "2026/9/30" 等）を想定。

export type DeadlineStatus = "overdue" | "soon" | "normal" | "none";

/** "2026-09-30" / "2026/9/30" などをDateに変換する（不正なら null） */
export function parseDateLoose(s?: string): Date | null {
  const v = (s ?? "").trim();
  if (!v) return null;
  const m = v.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return isNaN(d.getTime()) ? null : d;
}

/** 期限までの残り日数（過ぎていれば負数、パース不能なら null） */
export function getDaysLeft(deadline?: string, now: Date = new Date()): number | null {
  const d = parseDateLoose(deadline);
  if (!d) return null;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((d.getTime() - startOfToday.getTime()) / (24 * 60 * 60 * 1000));
}

/** 期限の状態。soon = 残り14日以内 */
export function getDeadlineStatus(deadline?: string, now: Date = new Date()): DeadlineStatus {
  const days = getDaysLeft(deadline, now);
  if (days === null) return "none";
  if (days < 0) return "overdue";
  if (days <= 14) return "soon";
  return "normal";
}

/**
 * 3ヶ月プランのうち「今月やるべき月」を返す（1〜3、判定不能なら null）。
 * 期限の月を3ヶ月目として逆算する:
 *   期限まで3ヶ月以上 → 1ヶ月目 / 2ヶ月 → 2ヶ月目 / 1ヶ月以内・期限超過 → 3ヶ月目
 */
export function getActiveMonthIndex(deadline?: string, now: Date = new Date()): 1 | 2 | 3 | null {
  const d = parseDateLoose(deadline);
  if (!d) return null;
  const monthsLeft = (d.getFullYear() * 12 + d.getMonth()) - (now.getFullYear() * 12 + now.getMonth());
  const idx = Math.min(3, Math.max(1, 3 - monthsLeft + 1));
  return idx as 1 | 2 | 3;
}
