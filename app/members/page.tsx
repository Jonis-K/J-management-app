import MembersTableClient from "@/components/MembersTableClient";

export const dynamic = "force-dynamic";

type Member = {
  member_id: string;
  parent_id: string;
  name: string;
  age: string;
  gender: string;
  photo_url: string;
  job: string;
  dream: string;
  role: string;
  updated_at: string;
};

async function getMembers(): Promise<Member[]> {
  const baseUrl =
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/members`, { cache: "no-store" });
  if (!res.ok) return [];
  const json = (await res.json()) as { data: Member[] };
  return json.data ?? [];
}

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