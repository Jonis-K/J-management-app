export const dynamic = "force-dynamic";

import { getGoals } from "@/lib/csv";
import GoalsTableClient from "@/components/GoalsTableClient";

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

      {goals.length > 0 ? (
        <GoalsTableClient goals={goals} />
      ) : (
        <div className="rounded-lg border bg-white px-4 py-6 text-neutral-500">
          データがありません。Sheetsの公開設定・CSV URL・ヘッダー名を確認してください。
        </div>
      )}
    </main>
  );
}
