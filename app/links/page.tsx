export const dynamic = "force-dynamic";

import { getLinks, LinkItem } from "@/lib/csv";
import { ClipboardList, FileText, ExternalLink, Hash, Link as LinkIcon } from "lucide-react";

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
  if (category.includes("マニュアル") || category.includes("資料")) return <FileText className="w-5 h-5 text-emerald-600" />;
  return <LinkIcon className="w-5 h-5 text-slate-400" />;
}

export default async function LinksPage() {
  const links = await getLinks();

  // カテゴリごとにグループ化
  const groupedLinks = links.reduce((acc, link) => {
    const cat = link.category || "未分類";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(link);
    return acc;
  }, {} as Record<string, LinkItem[]>);

  // カテゴリ順序の定義（定例会を最優先）
  const sortedCategories = Object.keys(groupedLinks).sort((a, b) => {
    if (a === "定例会") return -1;
    if (b === "定例会") return 1;
    return a.localeCompare(b);
  });

  return (
    <main className="p-4 sm:p-6 space-y-8 bg-slate-50 min-h-screen pb-24">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">共有リンク集</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            組織内で共有されているドキュメントやツールの一覧です。
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total</span>
          <span className="text-xl font-black text-sky-600">{links.length}</span>
        </div>
      </div>

      <div className="space-y-10">
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
                <a
                  key={l.link_id}
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-sky-200 transition-all active:scale-[0.98] flex flex-col justify-between h-full"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:bg-sky-50 group-hover:text-sky-600 transition-colors">
                        {badgeLabel(l.type)}
                      </span>
                      <div className="text-[10px] font-mono text-slate-300">
                        #{l.sort_order}
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-800 leading-snug group-hover:text-sky-600 transition-colors line-clamp-2 mb-2">
                      {l.title}
                    </h3>
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
              ))}
            </div>
          </section>
        ))}

        {links.length === 0 && (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
            <LinkIcon className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500 font-medium">リンクデータが見つかりませんでした。</p>
            <p className="text-xs text-slate-400 mt-1">スプレッドシートの設定を確認してください。</p>
          </div>
        )}
      </div>
    </main>
  );
}