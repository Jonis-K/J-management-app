export const dynamic = "force-dynamic";

import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { getMembers, getGoals, getLinks } from "@/lib/csv";
import Link from "next/link";
import { Users, Target, Link as LinkIcon, ExternalLink, ChevronRight, ClipboardList } from "lucide-react";

export default async function DashboardPage() {
  const [members, goals, links] = await Promise.all([
    getMembers(),
    getGoals(),
    getLinks()
  ]);

  // 定例会リンクの抽出と最新の特定
  const meetingLinks = links.filter(l => l.category === "定例会");
  // getLinksでsort_order順になっているが、念のため最優先を特定
  const latestMeeting = meetingLinks.length > 0 ? meetingLinks[0] : null;

  // 最新のリンク抽出（定例会以外、上位5件）
  const recentLinks = links.filter(l => l.category !== "定例会").slice(0, 5);

  return (
    <div className="space-y-8 p-4 sm:p-6 bg-slate-50 min-h-screen pb-20">
      <PageHeader title="ダッシュボード" />

      {/* 本日の議事録（特設スロット） */}
      {latestMeeting && (
        <section className="animate-in fade-in slide-in-from-top-4 duration-700">
          {latestMeeting.url ? (
            <a
              href={latestMeeting.url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative overflow-hidden group block w-full rounded-3xl bg-gradient-to-br from-sky-500 to-indigo-600 p-1 shadow-lg hover:shadow-xl transition-all active:scale-[0.99]"
            >
              <div className="relative rounded-[22px] bg-white/90 backdrop-blur-sm p-6 sm:p-8 flex items-center justify-between overflow-hidden">
                <ClipboardList className="absolute -right-4 -bottom-4 w-32 h-32 text-sky-500/10 -rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-0 duration-500" />
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="rounded-2xl bg-sky-500 p-4 text-white shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <ClipboardList className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">最新の議事録</span>
                      <span className="text-xs text-slate-400 font-medium">{latestMeeting.updated_at}</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors">{latestMeeting.title}</h2>
                    <p className="text-sm sm:text-base text-slate-500 mt-1 font-medium italic">クリックして今日の定例会タブを開く</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center justify-center rounded-full bg-white shadow-md w-12 h-12 text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </div>
            </a>
          ) : (
            <div className="relative overflow-hidden block w-full rounded-3xl bg-slate-100 p-1 select-none grayscale opacity-70">
              <div className="relative rounded-[22px] bg-white/90 backdrop-blur-sm p-6 sm:p-8 flex items-center justify-between overflow-hidden">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="rounded-2xl bg-slate-400 p-4 text-white">
                    <ClipboardList className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">URL未設定</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-400">{latestMeeting.title}</h2>
                    <p className="text-sm sm:text-base text-slate-400 mt-1 font-medium italic">スプレッドシートのURLを確認してください</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}
      
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
          <h2 className="text-lg font-bold text-sky-950">最近の共有リンク</h2>
          <Link href="/links" className="flex items-center text-sm font-medium text-sky-600 hover:text-sky-800 transition-colors">
            すべて見る <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>
        
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {recentLinks.map((l) => (
            l.url ? (
              <a
                key={l.link_id}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
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
            ) : (
              <div
                key={l.link_id}
                className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-5 opacity-60 grayscale cursor-not-allowed"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="rounded-xl bg-slate-100 p-2.5 text-slate-400">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-400">
                    URL無効
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-400 line-clamp-1">{l.title}</h3>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-1">{l.category}</p>
                </div>
              </div>
            )
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
