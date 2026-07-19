"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  X,
  Search,
  Network,
  FileText,
  Target,
  Quote,
  Briefcase,
} from "lucide-react";
import { Goal, LinkItem, Member } from "@/lib/csv";
import Avatar from "./Avatar";

type Props = {
  members: Member[];
  goals: Goal[];
  links: LinkItem[];
};

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


function MemberDetailModal({
  member,
  goals,
  attendLink,
  onClose,
}: {
  member: Member;
  goals: Goal[];
  attendLink: LinkItem | null;
  onClose: () => void;
}) {
  // Escapeキーで閉じる
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg max-h-[90dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー部 */}
        <div className="relative bg-gradient-to-br from-sky-500 to-indigo-500 px-6 pt-6 pb-14 sm:pb-16 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-1.5 text-white hover:bg-white/30 transition-colors"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="text-xs font-bold uppercase tracking-widest text-sky-100">
            Member Profile
          </div>
        </div>

        <div className="relative px-6 pb-6">
          <div className="-mt-10 sm:-mt-12 flex items-end gap-4">
            <Avatar name={member.name} photoUrl={member.photo_url} size={88} className="border-2 border-white shadow-md" />
            <div className="pb-1 min-w-0">
              <h2 className="text-xl font-extrabold text-slate-900 truncate">{member.name}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {member.role && (
                  <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-bold text-sky-700">
                    {member.role}
                  </span>
                )}
                {(member.age || member.gender) && (
                  <span className="text-xs text-slate-400">
                    {[member.age && `${member.age}歳`, member.gender].filter(Boolean).join(" / ")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 職業 */}
          {member.job && (
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
              <Briefcase className="h-4 w-4 text-slate-400 shrink-0" />
              {member.job}
            </div>
          )}

          {/* 夢 */}
          <div className="mt-4 rounded-2xl bg-sky-50 border border-sky-100 p-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600 mb-1.5">
              <Quote className="h-3.5 w-3.5" />
              夢・目指していること
            </div>
            <p className="text-sm leading-relaxed text-slate-700">
              {member.dream || "（未入力です。実データ投入時にシートの dream 列へ記入してください）"}
            </p>
          </div>

          {/* この人の目標 */}
          <div className="mt-5">
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800 mb-2">
              <Target className="h-4 w-4 text-sky-500" />
              この人の目標
            </div>
            {goals.length > 0 ? (
              <ul className="space-y-2">
                {goals.map((g) => (
                  <li
                    key={g.goal_id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-800">{g.title}</div>
                      {g.deadline && (
                        <div className="text-[11px] text-slate-400 mt-0.5">期限: {g.deadline}</div>
                      )}
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${statusBadgeClass(g.status)}`}
                    >
                      {g.status || "未設定"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-xl border border-dashed border-slate-200 px-3.5 py-3 text-xs text-slate-400">
                登録された目標はまだありません。
              </p>
            )}
          </div>

          {/* アクション */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link
              href={`/org?focus=${encodeURIComponent(member.member_id)}`}
              className="flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-sky-700 transition-colors"
            >
              <Network className="h-4 w-4" />
              組織図で見る
            </Link>
            {attendLink?.url ? (
              <a
                href={attendLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-sky-200 bg-white px-4 py-3 text-sm font-bold text-sky-700 hover:bg-sky-50 transition-colors"
              >
                <FileText className="h-4 w-4" />
                アテンドシート
              </a>
            ) : (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-400 select-none">
                アテンドシート未登録
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MembersClient({ members, goals, links }: Props) {
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return members;
    return members.filter((m) => {
      const haystack = `${m.name ?? ""} ${m.job ?? ""} ${m.dream ?? ""} ${m.role ?? ""}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [members, q]);

  const selected = selectedId
    ? members.find((m) => m.member_id === selectedId) ?? null
    : null;

  const selectedGoals = useMemo(
    () => (selected ? goals.filter((g) => g.member_id === selected.member_id) : []),
    [goals, selected]
  );

  // アテンドシート: type=attend のリンクのうち、タイトルにメンバー名を含むもの
  const selectedAttendLink = useMemo(() => {
    if (!selected?.name) return null;
    return (
      links.find((l) => l.type === "attend" && l.title.includes(selected.name)) ?? null
    );
  }, [links, selected]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-[340px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="検索（名前 / 職業 / 夢 / 役割）"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm shadow-sm outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="検索をクリア"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="text-sm text-slate-500">
          表示: <span className="font-bold text-sky-950">{filtered.length}</span> / {members.length}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filtered.map((m) => (
          <button
            key={m.member_id}
            onClick={() => setSelectedId(m.member_id)}
            className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-4 pt-5 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-sky-300 hover:shadow-md active:scale-[0.98]"
          >
            <Avatar name={m.name} photoUrl={m.photo_url} size={72} className="border-2 border-white shadow-md group-hover:scale-105 transition-transform" />
            <div className="mt-3 w-full">
              <div className="truncate font-bold text-slate-900">{m.name}</div>
              <div className="mt-0.5 truncate text-xs text-slate-400">
                {m.job || "職業未設定"}
              </div>
              {m.role && (
                <span className="mt-2 inline-block rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-bold text-sky-600">
                  {m.role}
                </span>
              )}
              <p className="mt-2 line-clamp-2 min-h-[2rem] text-[11px] leading-4 text-slate-500">
                {m.dream || ""}
              </p>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white px-4 py-16 text-center text-slate-400">
          検索条件に一致するメンバーがいません。
        </div>
      )}

      {selected && (
        <MemberDetailModal
          member={selected}
          goals={selectedGoals}
          attendLink={selectedAttendLink}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
