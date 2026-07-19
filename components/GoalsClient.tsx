"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarClock, Sparkles } from "lucide-react";
import { Goal } from "@/lib/csv";
import { getActiveMonthIndex, getDaysLeft, getDeadlineStatus } from "@/lib/goals";
import Avatar from "./Avatar";

export type GoalWithMember = Goal & {
  memberName: string;
  memberPhoto?: string;
};

const STATUS_OPTIONS = ["すべて", "未着手", "進行中", "完了", "保留"];

function statusBadgeClass(status: string): string {
  switch (status) {
    case "完了":
      return "bg-emerald-100 text-emerald-800";
    case "進行中":
      return "bg-sky-100 text-sky-800";
    case "保留":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function DeadlineBadge({ deadline }: { deadline: string }) {
  const status = getDeadlineStatus(deadline);
  const days = getDaysLeft(deadline);

  if (status === "none") {
    return <span className="text-xs text-slate-400">期限未設定</span>;
  }

  if (status === "overdue") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
        <AlertTriangle className="h-3 w-3" />
        {Math.abs(days!)}日超過
      </span>
    );
  }

  if (status === "soon") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
        <CalendarClock className="h-3 w-3" />
        あと{days}日
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
      {deadline}
    </span>
  );
}

function MemberChip({ goal }: { goal: GoalWithMember }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <Avatar name={goal.memberName} photoUrl={goal.memberPhoto} size={32} className="border border-sky-100" />
      <span className="truncate text-sm font-semibold text-slate-800">
        {goal.memberName || `ID: ${goal.member_id}`}
      </span>
    </div>
  );
}

/** 今月やるべきプランのテキストを返す */
function activePlan(goal: GoalWithMember): { index: 1 | 2 | 3 | null; text: string } {
  const idx = getActiveMonthIndex(goal.deadline);
  if (idx === 1) return { index: 1, text: goal.plan_month_1 };
  if (idx === 2) return { index: 2, text: goal.plan_month_2 };
  if (idx === 3) return { index: 3, text: goal.plan_month_3 };
  return { index: null, text: "" };
}

export default function GoalsClient({ goals }: { goals: GoalWithMember[] }) {
  const [statusFilter, setStatusFilter] = useState("すべて");

  const filtered = useMemo(() => {
    const list =
      statusFilter === "すべて" ? goals : goals.filter((g) => g.status === statusFilter);

    // 期限が近い順（期限なしは最後）
    return [...list].sort((a, b) => {
      const da = getDaysLeft(a.deadline);
      const db = getDaysLeft(b.deadline);
      if (da === null && db === null) return 0;
      if (da === null) return 1;
      if (db === null) return -1;
      return da - db;
    });
  }, [goals, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
              statusFilter === status
                ? "bg-sky-600 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-sky-50 hover:text-sky-700"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* PC: テーブル表示 */}
      <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-semibold">メンバー</th>
              <th className="px-4 py-3 font-semibold">目標</th>
              <th className="px-4 py-3 font-semibold">期限</th>
              <th className="px-4 py-3 font-semibold">
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-sky-500" />
                  今月のアクション
                </span>
              </th>
              <th className="px-4 py-3 font-semibold">ステータス</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((g) => {
              const plan = activePlan(g);
              return (
                <tr key={g.goal_id} className="hover:bg-sky-50/40 transition-colors">
                  <td className="px-4 py-4">
                    <MemberChip goal={g} />
                  </td>
                  <td className="px-4 py-4 font-medium text-slate-900 max-w-[280px]">
                    {g.title}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <DeadlineBadge deadline={g.deadline} />
                  </td>
                  <td className="px-4 py-4 max-w-[320px]">
                    {plan.text ? (
                      <div className="rounded-lg bg-sky-50 border border-sky-100 px-3 py-2">
                        <span className="mr-1.5 rounded bg-sky-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {plan.index}ヶ月目
                        </span>
                        <span className="text-slate-700">{plan.text}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">
                        {plan.index ? `${plan.index}ヶ月目のプラン未入力` : "—"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${statusBadgeClass(g.status)}`}
                    >
                      {g.status || "未設定"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="px-4 py-12 text-center text-slate-400">該当する目標はありません。</div>
        )}
      </div>

      {/* スマホ: カード表示 */}
      <div className="sm:hidden space-y-3">
        {filtered.map((g) => {
          const plan = activePlan(g);
          return (
            <div
              key={g.goal_id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <MemberChip goal={g} />
                <span
                  className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${statusBadgeClass(g.status)}`}
                >
                  {g.status || "未設定"}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 leading-snug">{g.title}</h3>

              <div className="mt-2">
                <DeadlineBadge deadline={g.deadline} />
              </div>

              {plan.text && (
                <div className="mt-3 rounded-xl bg-sky-50 border border-sky-100 px-3 py-2.5 text-sm">
                  <div className="mb-1 flex items-center gap-1 text-[10px] font-bold text-sky-600">
                    <Sparkles className="h-3 w-3" />
                    今月のアクション（{plan.index}ヶ月目）
                  </div>
                  <p className="text-slate-700">{plan.text}</p>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white px-4 py-12 text-center text-slate-400">
            該当する目標はありません。
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400">
        メンバー名が表示されない場合は、goalsシートの member_id が membersシートと一致しているか確認してください。
        <Link href="/members" className="ml-1 text-sky-600 hover:underline">
          メンバー一覧へ
        </Link>
      </p>
    </div>
  );
}
