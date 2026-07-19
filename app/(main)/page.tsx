export const dynamic = "force-dynamic";

import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { getMembers, getGoals, getLinks } from "@/lib/csv";
import { getDaysLeft, getDeadlineStatus, parseDateLoose } from "@/lib/goals";
import Avatar from "@/components/Avatar";
import Link from "next/link";
import {
  Users,
  Target,
  Link as LinkIcon,
  ExternalLink,
  ChevronRight,
  ClipboardList,
  CalendarClock,
  AlertTriangle,
  UserPlus,
} from "lucide-react";

export default async function DashboardPage() {
  const [members, goals, links] = await Promise.all([
    getMembers(),
    getGoals(),
    getLinks()
  ]);

  const memberMap = new Map(members.map((m) => [m.member_id, m]));

  // 定例会リンクの抽出と最新の特定
  const meetingLinks = links.filter(l => l.category === "定例会");
  const latestMeeting = meetingLinks.length > 0 ? meetingLinks[0] : null;

  // 最新のリンク抽出（定例会以外、上位5件）
  const recentLinks = links.filter(l => l.category !== "定例会").slice(0, 5);

  // 期限が近い目標（完了以外・期限あり・近い順に上位4件）
  const upcomingGoals = goals
    .filter((g) => g.status !== "完了" && getDaysLeft(g.deadline) !== null)
    .sort((a, b) => (getDaysLeft(a.deadline) ?? 0) - (getDaysLeft(b.deadline) ?? 0))
    .slice(0, 4);

  // 新しい仲間（updated_at の新しい順に4名。30日以内ならNEWバッジ）
  const now = new Date();
  const recentMembers = [...members]
    .filter((m) => parseDateLoose(m.updated_at))
    .sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""))
    .slice(0, 4)
    .map((m) => {
      const d = parseDateLoose(m.updated_at)!;
      const days = Math.round((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
      return { member: m, isNew: days <= 30 };
    });

  return (
    <div className="space-y-8 p-4 sm:p-6 bg-slate-50 min-h-screen pb-24">
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
          <Link href="/members"><StatCard label="メンバー数" value={members.length} icon={<Users className="w-6 h-6" />} /></Link>
          <Link href="/goals"><StatCard label="アクティブな目標" value={goals.filter((g) => g.status !== "完了").length} icon={<Target className="w-6 h-6" />} /></Link>
          <Link href="/links"><StatCard label="登録リンク" value={links.length} icon={<LinkIcon className="w-6 h-6" />} /></Link>
        </div>
      </section>

      {/* 今週の動き: 期限が近い目標 & 新しい仲間 */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* 期限が近い目標 */}
        <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-sky-950">
              <CalendarClock className="w-5 h-5 text-sky-500" />
              期限が近い目標
            </h2>
            <Link href="/goals" className="flex items-center text-sm font-medium text-sky-600 hover:text-sky-800 transition-colors">
              すべて見る <ChevronRight className="w-4 h-4 ml-0.5" />
            </Link>
          </div>

          {upcomingGoals.length > 0 ? (
            <ul className="space-y-2.5">
              {upcomingGoals.map((g) => {
                const member = memberMap.get(g.member_id);
                const days = getDaysLeft(g.deadline)!;
                const status = getDeadlineStatus(g.deadline);
                return (
                  <li key={g.goal_id} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3.5 py-2.5">
                    {member ? (
                      <Avatar name={member.name} photoUrl={member.photo_url} size={36} className="border border-sky-100" />
                    ) : (
                      <div className="h-9 w-9 shrink-0 rounded-full bg-slate-100" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-slate-800">{g.title}</div>
                      <div className="text-[11px] text-slate-400">{member?.name || `ID: ${g.member_id}`}</div>
                    </div>
                    {status === "overdue" ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">
                        <AlertTriangle className="h-3 w-3" />{Math.abs(days)}日超過
                      </span>
                    ) : (
                      <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${status === "soon" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
                        あと{days}日
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-slate-100 px-4 py-8 text-center text-sm text-slate-400">
              期限が設定された目標はまだありません。
            </div>
          )}
        </div>

        {/* 新しい仲間 */}
        <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-sky-950">
              <UserPlus className="w-5 h-5 text-sky-500" />
              新しい仲間
            </h2>
            <Link href="/members" className="flex items-center text-sm font-medium text-sky-600 hover:text-sky-800 transition-colors">
              すべて見る <ChevronRight className="w-4 h-4 ml-0.5" />
            </Link>
          </div>

          {recentMembers.length > 0 ? (
            <ul className="space-y-2.5">
              {recentMembers.map(({ member, isNew }) => (
                <li key={member.member_id} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3.5 py-2.5">
                  <Avatar name={member.name} photoUrl={member.photo_url} size={36} className="border border-sky-100" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-semibold text-slate-800">{member.name}</span>
                      {isNew && (
                        <span className="shrink-0 rounded-full bg-rose-500 px-1.5 py-px text-[9px] font-bold text-white">NEW</span>
                      )}
                    </div>
                    <div className="truncate text-[11px] text-slate-400">{member.job || "職業未設定"}</div>
                  </div>
                  <span className="shrink-0 text-[10px] text-slate-300">{member.updated_at}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-slate-100 px-4 py-8 text-center text-sm text-slate-400">
              メンバーデータがありません。
            </div>
          )}
        </div>
      </section>

      {/* クイックリンク・タイル */}
      <section>
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
