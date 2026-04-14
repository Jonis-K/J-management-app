export const dynamic = "force-dynamic";

import { getMembers, buildGraphFromMembers } from "@/lib/csv";
import OrgChartClient from "@/components/OrgChartClient";
import PageHeader from "@/components/PageHeader";
import { Edge, Node } from "@xyflow/react";

export default async function OrgPage() {
  const members = await getMembers();
  const { nodes: baseNodes, edges: baseEdges } = buildGraphFromMembers(members);

  // 汎用グラフノードをReact Flowのカスタムノード形式に変換
  const initialNodes: Node[] = baseNodes.map((n) => ({
    id: n.id,
    type: "custom",
    position: { x: 0, y: 0 }, // 初期位置（表示時にdagreが自動計算）
    data: n.data,
  }));

  const initialEdges: Edge[] = baseEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: "smoothstep",
    animated: true,
    style: { stroke: "#0ea5e9", strokeWidth: 2 },
  }));

  return (
    <main className="p-4 sm:p-6 space-y-4 max-w-[1600px] mx-auto pb-20">
      <PageHeader title="組織図" />
      <div className="mb-4">
        <p className="text-sm text-neutral-500">
          メンバーの階層構造を可視化しています。ドラッグでの移動やホイールでのズームが可能です。
        </p>
      </div>

      {initialNodes.length > 0 ? (
        <OrgChartClient initialNodes={initialNodes} initialEdges={initialEdges} />
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50 p-12 text-center text-sky-600/80 font-medium">
          メンバーデータがありません。
        </div>
      )}
    </main>
  );
}