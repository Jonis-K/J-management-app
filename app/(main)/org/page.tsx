export const dynamic = "force-dynamic";

import { getMembers } from "@/lib/csv";
import BinaryOrgChartClient from "@/components/BinaryOrgChartClient";
import PageHeader from "@/components/PageHeader";

export default async function OrgPage() {
  const members = await getMembers();

  return (
    <main className="p-4 sm:p-6 space-y-4 max-w-[1600px] mx-auto pb-20">
      <PageHeader title="組織図" />
      <div className="mb-4">
        <p className="text-sm text-neutral-500">
          バイナリー（左右2系列）の組織図です。名前で検索するとその人にフォーカスし、
          カードをタップすると紹介したメンバーがハイライトされます。
        </p>
      </div>

      {members.length > 0 ? (
        <BinaryOrgChartClient members={members} />
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50 p-12 text-center text-sky-600/80 font-medium">
          メンバーデータがありません。
        </div>
      )}
    </main>
  );
}
