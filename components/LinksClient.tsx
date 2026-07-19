"use client";

import { useMemo, useState } from "react";
import {
  ClipboardList,
  FileText,
  ExternalLink,
  Link as LinkIcon,
  Search,
  X,
} from "lucide-react";
import { LinkItem } from "@/lib/csv";

function badgeLabel(type: string) {
  switch (type) {
    case "memo":
      return "メモ";
    case "qa":
      return "Q&A";
    case "attend":
      return "アテンド";
    default:
      return "その他";
  }
}

function CategoryIcon({ category }: { category: string }) {
  if (category === "定例会") return <ClipboardList className="w-5 h-5 text-sky-600" />;
  if (category.includes("マニュアル") || category.includes("資料"))
    return <FileText className="w-5 h-5 text-emerald-600" />;
  return <LinkIcon className="w-5 h-5 text-slate-400" />;
}

/** 定例会メモの日付降順ソート用（updated_at文字列の比較で十分） */
function byDateDesc(a: LinkItem, b: LinkItem) {
  return (b.updated_at || "").localeCompare(a.updated_at || "");
}

function LinkCard({ l }: { l: LinkItem }) {
  if (!l.url) {
    return (
      <div className="group relative bg-slate-50/50 rounded-2xl p-5 border border-slate-100 opacity-60 grayscale cursor-not-allowed flex flex-col justify-between h-full select-none">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              URL無効
            </span>
          </div>
          <h3 className="font-bold text-slate-400 leading-snug line-clamp-2 mb-2">{l.title}</h3>
        </div>
        <div className="mt-4">
          <span className="text-[10px] text-slate-300 font-medium italic">
            ※有効なURLが設定されていません
          </span>
        </div>
      </div>
    );
  }

  return (
    <a
      href={l.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-sky-200 transition-all active:scale-[0.98] flex flex-col justify-between h-full"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:bg-sky-50 group-hover:text-sky-600 transition-colors">
            {badgeLabel(l.type)}
          </span>
        </div>
        <h3 className="font-bold text-slate-800 leading-snug group-hover:text-sky-600 transition-colors line-clamp-2 mb-2">
          {l.title}
        </h3>
        {l.summary && (
          <p className="text-xs text-slate-500 line-clamp-2">{l.summary}</p>
        )}
      </div>
      <div className="flex items-center justify-between mt-4">
        <span className="text-[10px] text-slate-400 font-medium">
          更新: {l.updated_at || "不明"}
        </span>
        <div className="rounded-full bg-slate-50 p-1.5 text-slate-400 group-hover:bg-sky-500 group-hover:text-white transition-all">
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </div>
    </a>
  );
}

/** 定例会メモのタイムライン表示 */
function MeetingTimeline({ meetings }: { meetings: LinkItem[] }) {
  return (
    <ol className="relative ml-2.5 border-l-2 border-sky-100 space-y-4 pb-1">
      {meetings.map((l, i) => (
        <li key={l.link_id} className="relative pl-6">
          {/* タイムラインのドット */}
          <span
            className={`absolute -left-[7px] top-2 h-3 w-3 rounded-full border-2 border-white shadow ${
              i === 0 ? "bg-sky-500" : "bg-slate-300"
            }`}
          />
          {l.url ? (
            <a
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-sky-200 hover:shadow-md active:scale-[0.99]"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-sky-600">{l.updated_at || "日付未設定"}</span>
                {i === 0 && (
                  <span className="rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    最新
                  </span>
                )}
              </div>
              <h3 className="mt-1 font-bold text-slate-800 group-hover:text-sky-600 transition-colors">
                {l.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                {l.summary || "（概要未入力：シートに summary 列を追加すると話し合った内容がここに表示されます）"}
              </p>
            </a>
          ) : (
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 opacity-70 select-none">
              <span className="text-xs font-bold text-slate-400">{l.updated_at || "日付未設定"}</span>
              <h3 className="mt-1 font-bold text-slate-400">{l.title}</h3>
              <p className="mt-1 text-[10px] italic text-slate-300">※有効なURLが設定されていません</p>
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

export default function LinksClient({ links }: { links: LinkItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return links;
    return links.filter((l) =>
      `${l.title} ${l.category} ${l.summary ?? ""} ${badgeLabel(l.type)}`
        .toLowerCase()
        .includes(q)
    );
  }, [links, query]);

  const meetings = useMemo(
    () => filtered.filter((l) => l.category === "定例会").sort(byDateDesc),
    [filtered]
  );

  const groupedLinks = useMemo(() => {
    return filtered
      .filter((l) => l.category !== "定例会")
      .reduce((acc, link) => {
        const cat = link.category || "未分類";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(link);
        return acc;
      }, {} as Record<string, LinkItem[]>);
  }, [filtered]);

  const sortedCategories = useMemo(
    () => Object.keys(groupedLinks).sort((a, b) => a.localeCompare(b)),
    [groupedLinks]
  );

  return (
    <div className="space-y-10">
      {/* 検索窓 */}
      <div className="relative w-full sm:max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="リンクを検索（タイトル / カテゴリ / 概要）"
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm shadow-sm outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label="検索をクリア"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 定例会タイムライン */}
      {meetings.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="p-1.5 rounded-lg bg-white shadow-sm border border-slate-100">
              <ClipboardList className="w-5 h-5 text-sky-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">定例会の記録</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent ml-2"></div>
          </div>
          <MeetingTimeline meetings={meetings} />
        </section>
      )}

      {/* カテゴリ別リンク */}
      {sortedCategories.map((category) => (
        <section key={category} className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="p-1.5 rounded-lg bg-white shadow-sm border border-slate-100">
              <CategoryIcon category={category} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">{category}</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent ml-2"></div>
          </div>

          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {groupedLinks[category].map((l) => (
              <LinkCard key={l.link_id} l={l} />
            ))}
          </div>
        </section>
      ))}

      {filtered.length === 0 && (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <LinkIcon className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 font-medium">
            {query
              ? `「${query}」に一致するリンクが見つかりませんでした。`
              : "リンクデータが見つかりませんでした。"}
          </p>
          {!query && (
            <p className="text-xs text-slate-400 mt-1">スプレッドシートの設定を確認してください。</p>
          )}
        </div>
      )}
    </div>
  );
}
