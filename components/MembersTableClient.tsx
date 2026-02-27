"use client";

import { useMemo, useState } from "react";

type Member = {
  member_id: string;
  parent_id: string;
  name: string;
  age: string;
  gender: string;
  photo_url: string;
  job: string;
  dream: string;
  role: string;
  updated_at: string;
};

export default function MembersTableClient({ members }: { members: Member[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return members;

    return members.filter((m) => {
      const haystack = `${m.name} ${m.job} ${m.dream}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [members, q]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="検索（名前 / 職業 / 夢）"
            className="w-full sm:w-[320px] rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-200"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="text-sm text-neutral-600 hover:text-neutral-900"
            >
              クリア
            </button>
          )}
        </div>
        <div className="text-sm text-neutral-500">
          表示:{" "}
          <span className="font-medium text-neutral-900">
            {filtered.length}
          </span>{" "}
          / {members.length}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr className="text-left">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">名前</th>
              <th className="px-4 py-3">年齢</th>
              <th className="px-4 py-3">性別</th>
              <th className="px-4 py-3">職業</th>
              <th className="px-4 py-3">夢</th>
              <th className="px-4 py-3">役割</th>
              <th className="px-4 py-3">更新</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((m) => (
              <tr key={m.member_id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-mono">{m.member_id}</td>
                <td className="px-4 py-3 font-medium">{m.name}</td>
                <td className="px-4 py-3">{m.age}</td>
                <td className="px-4 py-3">{m.gender}</td>
                <td className="px-4 py-3">{m.job}</td>
                <td className="px-4 py-3 max-w-[420px] truncate" title={m.dream}>
                  {m.dream}
                </td>
                <td className="px-4 py-3">{m.role}</td>
                <td className="px-4 py-3 text-neutral-500">{m.updated_at}</td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-neutral-500" colSpan={8}>
                  検索条件に一致するメンバーがいません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}