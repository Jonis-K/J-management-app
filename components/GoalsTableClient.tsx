"use client";

import { useMemo, useState } from "react";

type Goal = {
  goal_id: string;
  member_id: string;
  deadline: string;
  title: string;
  plan_month_1: string;
  plan_month_2: string;
  plan_month_3: string;
  status: string;
  updated_at: string;
};

const STATUS_OPTIONS = ["すべて", "未着手", "進行中", "完了", "保留"];

export default function GoalsTableClient({ goals }: { goals: Goal[] }) {
  const [statusFilter, setStatusFilter] = useState("すべて");

  const filtered = useMemo(() => {
    if (statusFilter === "すべて") return goals;
    return goals.filter((g) => g.status === statusFilter);
  }, [goals, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === status
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-neutral-50 text-neutral-600 border-b">
            <tr>
              <th className="px-4 py-3 font-medium">期限</th>
              <th className="px-4 py-3 font-medium">目標タイトル</th>
              <th className="px-4 py-3 font-medium">1ヶ月目</th>
              <th className="px-4 py-3 font-medium">2ヶ月目</th>
              <th className="px-4 py-3 font-medium">3ヶ月目</th>
              <th className="px-4 py-3 font-medium">ステータス</th>
              <th className="px-4 py-3 font-medium text-right">更新</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((g) => (
              <tr key={g.goal_id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap text-neutral-500">{g.deadline}</td>
                <td className="px-4 py-4 font-medium text-neutral-900">{g.title}</td>
                <td className="px-4 py-4 text-neutral-600">{g.plan_month_1}</td>
                <td className="px-4 py-4 text-neutral-600">{g.plan_month_2}</td>
                <td className="px-4 py-4 text-neutral-600">{g.plan_month_3}</td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      g.status === "完了"
                        ? "bg-green-100 text-green-800"
                        : g.status === "進行中"
                        ? "bg-blue-100 text-blue-800"
                        : g.status === "保留"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-neutral-100 text-neutral-800"
                    }`}
                  >
                    {g.status || "未設定"}
                  </span>
                </td>
                <td className="px-4 py-4 text-right text-xs text-neutral-400 whitespace-nowrap">
                  {g.updated_at}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-neutral-500">
                  該当する目標はありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
