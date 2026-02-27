"use client";

import { useMemo, useState } from "react";

type LinkItem = {
  link_id: string;
  type: string;
  category: string;
  title: string;
  url: string;
  sort_order: string;
  updated_at: string;
};

const TABS = [
  { id: "memo", label: "メモ/資料" },
  { id: "qa", label: "Q&A" },
  { id: "attend", label: "勤怠/申請" },
  { id: "other", label: "その他" },
];

export default function LinksTabsClient({ links }: { links: LinkItem[] }) {
  const [activeTab, setActiveTab] = useState("memo");

  const filteredAndSorted = useMemo(() => {
    return links
      .filter((l) => l.type === activeTab)
      .sort((a, b) => {
        const orderA = parseInt(a.sort_order, 10) || 999;
        const orderB = parseInt(b.sort_order, 10) || 999;
        return orderA - orderB;
      });
  }, [links, activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex border-b">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === tab.id
                ? "text-neutral-900"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900" />
            )}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAndSorted.map((link) => (
          <a
            key={link.link_id}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col justify-between rounded-lg border bg-white p-4 transition-all hover:border-neutral-300 hover:shadow-sm"
          >
            <div>
              <div className="text-xs text-neutral-400 mb-1">{link.category}</div>
              <h3 className="font-medium text-neutral-900 group-hover:text-blue-600 transition-colors">
                {link.title}
              </h3>
            </div>
            <div className="mt-4 flex items-center justify-between text-[10px] text-neutral-400">
              <span className="truncate max-w-[150px]">{link.url}</span>
              <span>{link.updated_at}</span>
            </div>
          </a>
        ))}
        {filteredAndSorted.length === 0 && (
          <div className="col-span-full py-12 text-center text-neutral-500 border border-dashed rounded-lg">
            このカテゴリーのリンクはまだありません。
          </div>
        )}
      </div>
    </div>
  );
}
