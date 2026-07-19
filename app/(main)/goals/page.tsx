export const dynamic = "force-dynamic";

import { getGoals, getMembers } from "@/lib/csv";
import GoalsClient, { GoalWithMember } from "@/components/GoalsClient";
import PageHeader from "@/components/PageHeader";

export default async function GoalsPage() {
  const [goals, members] = await Promise.all([getGoals(), getMembers()]);

  const memberMap = new Map(members.map((m) => [m.member_id, m]));
  const goalsWithMember: GoalWithMember[] = goals.map((g) => {
    const member = memberMap.get(g.member_id);
    return {
      ...g,
      memberName: member?.name ?? "",
      memberPhoto: member?.photo_url,
    };
  });

  return (
    <main className="p-4 sm:p-6 space-y-4 bg-slate-50 min-h-screen pb-24">
      <div className="flex items-end justify-between gap-3">
        <PageHeader title="目標" />
        <div className="pb-4 text-sm text-slate-500 whitespace-nowrap">
          件数: <span className="font-bold text-sky-950">{goals.length}</span>
        </div>
      </div>

      <GoalsClient goals={goalsWithMember} />
    </main>
  );
}
