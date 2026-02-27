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

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr className="text-left">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">名前</th>
              <th className="px-4 py-3">年齢</th>
              <th className="px-4 py-3">性別</th>
              <th className="px-4 py-3">職業</th>
              <th className="px-4 py-3">夢</th>
              <th className="px-4 py-3">役割</th>
              <th className="px-4 py-3">更新</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {members.map((m) => (
              <tr key={m.member_id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-mono">{m.member_id}</td>
                <td className="px-4 py-3 font-medium">{m.name}</td>
                <td className="px-4 py-3">{m.age}</td>
                <td className="px-4 py-3">{m.gender}</td>
                <td className="px-4 py-3">{m.job}</td>
                <td className="px-4 py-3 max-w-[420px] truncate" title={m.dream}>
                  {m.dream}
                </td>
                <td className="px-4 py-3">{m.role}</td>
                <td className="px-4 py-3 text-neutral-500">{m.updated_at}</td>
              </tr>
            ))}

            {members.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-neutral-500" colSpan={8}>
                  データがありません。Sheetsの公開設定・CSV URL・ヘッダー名を確認してください。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}