"use client";

import { useMemo } from "react";

type Member = {
  member_id: string;
  parent_id: string;
  name: string;
};

type TreeNode = Member & {
  children: TreeNode[];
};

export default function OrgTreeClient({ members }: { members: Member[] }) {
  const tree = useMemo(() => {
    const map = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    // 全ノードを作成
    members.forEach((m) => {
      map.set(m.member_id, { ...m, children: [] });
    });

    // 親子関係を構築
    map.forEach((node) => {
      if (node.parent_id && map.has(node.parent_id)) {
        map.get(node.parent_id)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [members]);

  const renderNode = (node: TreeNode) => (
    <li key={node.member_id} className="mt-2 list-none border-l-2 border-neutral-200 pl-4 last:border-l-transparent">
      <div className="flex items-center gap-2">
        <div className="h-2 w-4 border-b-2 border-neutral-200" />
        <div className="rounded border bg-white px-3 py-1.5 text-sm font-medium shadow-sm transition-hover hover:border-neutral-300">
          {node.name}
          <span className="ml-2 text-[10px] text-neutral-400 font-mono">#{node.member_id}</span>
        </div>
      </div>
      {node.children.length > 0 && (
        <ul className="ml-6">
          {node.children.map(renderNode)}
        </ul>
      )}
    </li>
  );

  return (
    <div className="overflow-x-auto rounded-lg border bg-neutral-50 p-6">
      <ul className="space-y-4">
        {tree.map(renderNode)}
        {tree.length === 0 && (
          <li className="text-center text-neutral-500 py-12">
            組織図のデータがありません。
          </li>
        )}
      </ul>
    </div>
  );
}
