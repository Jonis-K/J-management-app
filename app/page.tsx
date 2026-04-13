export const dynamic = "force-dynamic";

import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { getMembers, getGoals, getLinks } from "@/lib/csv";
import Link from "next/link";

export default async function DashboardPage() {
  const [members, goals, links] = await Promise.all([
    getMembers(),
    getGoals(),
    getLinks()
  ]);

  // 最新のリンクを5件抽出（updated_at などの降順が望ましいが、今回は既存の並び順の上から5件）
  const recentLinks = links.slice(0, 5);

  return (
    <div className="space-y-8 p-4 sm:p-6 bg-slate-50 min-h-screen">
      <PageHeader title="ダッシュボード" />
      
      {/* 統計情報 */}
      <section>
        <h2 className="text-lg font-semibold text-sky-900 mb-4">全体サマリー</h2>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
          <StatCard label="メンバー数" value={members.length} />
          <StatCard label="目標数" value={goals.length} />
          <StatCard label="リンク数" value={links.length} />
        </div>
      </section>

      {/* リンク集プレビュー */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-sky-900">おすすめ / 最新リンク</h2>
          <Link href="/links" className="text-sm text-sky-600 hover:text-sky-800 hover:underline">
            すべて見る &rarr;
          </Link>
        </div>
        <div className="grid gap-3">
          {recentLinks.map((l) => (
            <a
              key={l.link_id}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className="block rounded-xl border border-sky-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-sky-300 transition-all group"
            >
              <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
                      {l.type || 'リンク'}
                    </span>
                    <span className="text-xs text-slate-500">{l.category}</span>
                  </div>
                  <h3 className="font-semibold text-slate-800 group-hover:text-sky-600 truncate">
                    {l.title}
                  </h3>
                </div>
                <div className="text-xs text-slate-400 whitespace-nowrap ml-4">
                  {l.updated_at}
                </div>
              </div>
            </a>
          ))}
          {recentLinks.length === 0 && (
            <div className="rounded-xl border border-dashed border-sky-200 bg-sky-50/50 p-6 text-center text-sm text-sky-600/70">
              リンクデータがありません。
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
