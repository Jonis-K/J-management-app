"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

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

/**
 * Google Driveの共有リンク等を直接表示可能なURLに変換する
 */
function fixImageUrl(url: string): string {
  if (!url) return "";

  // Google Drive 共有リンク
  // https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  const driveMatch = url.match(/\/file\/d\/([^/]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://lh3.googleusercontent.com/u/0/d/${driveMatch[1]}`;
  }

  return url;
}

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
              <th className="px-4 py-3">写真</th>
              <th className="px-4 py-3">名前</th>
              <th className="px-4 py-3">年齢</th>
              <th className="px-4 py-3">性別</th>
              <th className="px-4 py-3">職業</th>
              <th className="px-4 py-3">夢</th>
              <th className="px-4 py-3">役割</th>
              <th className="px-4 py-3 text-right">更新</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((m) => (
              <tr key={m.member_id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-mono">{m.member_id}</td>
                <td className="px-4 py-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full bg-neutral-100">
                    {m.photo_url ? (
                      <Image
                        src={fixImageUrl(m.photo_url)}
                        alt={m.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                        unoptimized={!fixImageUrl(m.photo_url).includes("googleusercontent")}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">
                        No Img
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">{m.name}</td>
                <td className="px-4 py-3">{m.age}</td>
                <td className="px-4 py-3">{m.gender}</td>
                <td className="px-4 py-3">{m.job}</td>
                <td className="px-4 py-3 max-w-[420px] truncate" title={m.dream}>
                  {m.dream}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-800">
                    {m.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-neutral-500">{m.updated_at}</td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-neutral-500 text-center" colSpan={9}>
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