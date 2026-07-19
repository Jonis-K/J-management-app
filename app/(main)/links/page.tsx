export const dynamic = "force-dynamic";

import { getLinks } from "@/lib/csv";
import LinksClient from "@/components/LinksClient";

export default async function LinksPage() {
  const links = await getLinks();

  return (
    <main className="p-4 sm:p-6 space-y-8 bg-slate-50 min-h-screen pb-24">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">共有リンク集</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            組織内で共有されているドキュメントやツールの一覧です。
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total</span>
          <span className="text-xl font-black text-sky-600">{links.length}</span>
        </div>
      </div>

      <LinksClient links={links} />
    </main>
  );
}
