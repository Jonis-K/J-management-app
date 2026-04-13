export const dynamic = "force-dynamic";

import { getGoals } from "@/lib/csv";

export default async function GoalsPage() {
  const goals = await getGoals();

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">目標</h1>
          <p className="text-sm text-neutral-500">
            Sheets（goals）から読み取り表示しています（編集はSheets側）。
          </p>
        </div>
        <div className="text-sm text-neutral-500">
          件数:{" "}
          <span className="font-medium text-neutral-900">{goals.length}</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr className="text-left">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">メンバーID</th>
              <th className="px-4 py-3">期限</th>
              <th className="px-4 py-3">タイトル</th>
              <th className="px-4 py-3">ステータス</th>
              <th className="px-4 py-3">更新</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {goals.map((g) => (
              <tr key={g.goal_id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-mono">{g.goal_id}</td>
                <td className="px-4 py-3 font-mono">{g.member_id}</td>
                <td className="px-4 py-3">{g.deadline}</td>
                <td className="px-4 py-3">{g.title}</td>
                <td className="px-4 py-3">{g.status}</td>
                <td className="px-4 py-3 text-neutral-500">{g.updated_at}</td>
              </tr>
            ))}

            {goals.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-neutral-500" colSpan={6}>
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