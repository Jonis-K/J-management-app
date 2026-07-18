import MembersTableClient from "@/components/MembersTableClient";

export const dynamic = "force-dynamic";

  

import { getMembers } from "@/lib/csv";

export default async function MembersPage() {
  const members = await getMembers();

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">メンバー一覧</h1>
          <p className="text-sm text-neutral-500">
            Sheets（members）から読み取り表示しています（編集はSheets側）。
          </p>
        </div>
        <div className="text-sm text-neutral-500">
          件数: <span className="font-medium text-neutral-900">{members.length}</span>
        </div>
      </div>

      <MembersTableClient members={members} />
    </main>
  );
}