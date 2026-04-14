export const dynamic = "force-dynamic";

import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { getMembers, getGoals, getLinks } from "@/lib/csv";
import Link from "next/link";
import { Users, Target, Link as LinkIcon, ExternalLink, ChevronRight } from "lucide-react";

export default async function DashboardPage() {
  const [members, goals, links] = await Promise.all([
    getMembers(),
    getGoals(),
    getLinks()
  ]);

  // 最新のリンク抽出（既存上から5件）
  const recentLinks = links.slice(0, 5);

  return (
    <div className="space-y-8 p-4 sm:p-6 bg-slate-50 min-h-screen pb-20">
      <PageHeader title="ダッシュボード" />
      
      {/* 統計情報: 1~3カラムレスポンシブ配置 */}
      <section>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="メンバー数" value={members.length} icon={<Users className="w-6 h-6" />} />
          <StatCard label="アクティブな目標" value={goals.length} icon={<Target className="w-6 h-6" />} />
          <StatCard label="登録リンク" value={links.length} icon={<LinkIcon className="w-6 h-6" />} />
        </div>
      </section>

      {/* クイックリンク・タイル */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-lg font-bold text-sky-950">クイックアクセス</h2>
          <Link href="/links" className="flex items-center text-sm font-medium text-sky-600 hover:text-sky-800 transition-colors">
            すべて見る <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>
        
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {recentLinks.map((l) => (
            <a
              key={l.link_id}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col justify-between rounded-2xl border border-sky-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-sky-300 transition-all active:scale-[0.98]"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="rounded-xl bg-sky-50 p-2.5 text-sky-600 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                  {l.type || 'リンク'}
                </span>
              </div>
              
              <div>
                <h3 className="font-bold text-lg text-slate-800 group-hover:text-sky-600 transition-colors line-clamp-1">
                  {l.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500 line-clamp-1">{l.category}</p>
              </div>
            </a>
          ))}
          {recentLinks.length === 0 && (
            <div className="col-span-full rounded-2xl border-2 border-dashed border-sky-100 bg-sky-50/50 p-8 text-center text-sky-600/70">
              <LinkIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              リンクデータがありません。
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
