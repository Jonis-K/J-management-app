export const dynamic = "force-dynamic";

import { getLinks } from "@/lib/csv";

function badgeLabel(type: string) {
  switch (type) {
    case "memo":
      return "メモ";
    case "qa":
      return "Q&A";
    case "attend":
      return "アテンド";
    default:
      return "その他";
  }
}

export default async function LinksPage() {
  const links = await getLinks();

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">リンク集</h1>
          <p className="text-sm text-neutral-500">
            Sheets（links）から読み取り表示しています（編集はSheets側）。
          </p>
        </div>
        <div className="text-sm text-neutral-500">
          件数: <span className="font-medium text-neutral-900">{links.length}</span>
        </div>
      </div>

      <div className="rounded-lg border bg-white overflow-hidden">
        <ul className="divide-y">
          {links.map((l) => (
            <li key={l.link_id} className="p-4 hover:bg-neutral-50">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-neutral-700 bg-neutral-50">
                      {badgeLabel(l.type)}
                    </span>
                    <span className="text-xs text-neutral-500">{l.category}</span>
                    <span className="text-xs text-neutral-400">•</span>
                    <span className="text-xs text-neutral-500">{l.updated_at}</span>
                  </div>

                  <a
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block font-medium text-neutral-900 hover:underline truncate"
                    title={l.title}
                  >
                    {l.title}
                  </a>
                </div>

                <div className="text-xs text-neutral-500">
                  sort: <span className="font-mono">{l.sort_order}</span>
                </div>
              </div>
            </li>
          ))}

          {links.length === 0 && (
            <li className="p-6 text-neutral-500 text-sm">
              データがありません。Sheetsの公開設定・CSV URL・ヘッダー名を確認してください。
            </li>
          )}
        </ul>
      </div>
    </main>
  );
}