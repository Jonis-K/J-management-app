export const dynamic = "force-dynamic";

type Goal = {
  goal_id: string;
  member_id: string;
  deadline: string;
  title: string;
  plan_month_1: string;
  plan_month_2: string;
  plan_month_3: string;
  status: string;
  updated_at: string;
};

function parseCsv(csvText: string): Goal[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = cols[i] ?? ""));
    return row as unknown as Goal;
  });
}

async function getGoals(): Promise<Goal[]> {
  const url = process.env.SHEETS_GOALS_CSV_URL;
  if (!url) return [];

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];

  const csv = await res.text();
  return parseCsv(csv);
}

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