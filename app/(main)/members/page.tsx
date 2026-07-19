export const dynamic = "force-dynamic";

import { getMembers, getGoals, getLinks } from "@/lib/csv";
import MembersClient from "@/components/MembersClient";
import PageHeader from "@/components/PageHeader";

export default async function MembersPage() {
  const [members, goals, links] = await Promise.all([
    getMembers(),
    getGoals(),
    getLinks(),
  ]);

  return (
    <main className="p-4 sm:p-6 space-y-4 bg-slate-50 min-h-screen pb-24">
      <PageHeader title="メンバー" />
      <p className="-mt-4 text-sm text-slate-500">
        カードをタップすると、プロフィール・目標・組織図上の位置をまとめて確認できます。
      </p>

      <MembersClient members={members} goals={goals} links={links} />
    </main>
  );
}
