"use client";

import { useMemo, useState, useCallback } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Handle,
  Position,
  Panel,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Image from "next/image";
import { Search, Maximize2, X } from "lucide-react";
import { Member } from "@/lib/csv";
import {
  buildBinaryTree,
  flattenTree,
  layoutBinaryTree,
  PlacementSide,
} from "@/lib/binaryTree";
import { fixImageUrl, shouldSkipOptimization } from "@/lib/image";

// ノードカードの寸法とレイアウト間隔
const NODE_W = 190;
const NODE_H = 76;
const X_GAP = 210;
const Y_GAP = 140;

const SIDE_COLOR: Record<PlacementSide, string> = {
  left: "#0284c7", // 左系列: sky-600
  right: "#d97706", // 右系列: amber-600
};

type Highlight = "focus" | "introduced" | null;

type MemberNodeData = {
  member: Member;
  introducerName: string | null;
  side: PlacementSide | null;
  highlight: Highlight;
};

function MemberNode({ data }: { data: MemberNodeData }) {
  const { member, introducerName, side, highlight } = data;
  const imgUrl = fixImageUrl(member.photo_url, 96);

  const cardStyle =
    highlight === "focus"
      ? "border-sky-500 ring-4 ring-sky-300/60 shadow-xl scale-105"
      : highlight === "introduced"
      ? "border-amber-400 ring-2 ring-amber-300/60 shadow-md"
      : "border-slate-200 shadow-sm";

  return (
    <div
      className={`relative rounded-xl border-2 bg-white transition-all ${cardStyle}`}
      style={{ width: NODE_W, height: NODE_H }}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-300 !w-2 !h-2 !border-0" />

      {/* 配置サイドのバッジ（L/R） */}
      {side && (
        <span
          className="absolute -top-2.5 -left-2 rounded-md px-1.5 py-0.5 text-[10px] font-black text-white shadow-sm"
          style={{ backgroundColor: SIDE_COLOR[side] }}
        >
          {side === "left" ? "L" : "R"}
        </span>
      )}

      <div className="flex h-full items-center gap-2.5 px-3">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-sky-50 border border-sky-100">
          {imgUrl ? (
            <Image
              src={imgUrl}
              alt={member.name}
              fill
              className="object-cover"
              sizes="44px"
              unoptimized={shouldSkipOptimization(imgUrl)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[9px] font-bold text-sky-300">
              No Img
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-bold leading-tight text-slate-800">
            {member.name}
          </div>
          <div className="mt-0.5 truncate text-[10px] text-slate-400">
            {introducerName ? `紹介: ${introducerName}` : "トップ"}
          </div>
          {member.role && (
            <span className="mt-0.5 inline-flex max-w-full truncate rounded-full bg-sky-50 px-1.5 py-px text-[9px] font-semibold text-sky-700">
              {member.role}
            </span>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-slate-300 !w-2 !h-2 !border-0" />
    </div>
  );
}

const nodeTypes = { member: MemberNode };

function BinaryOrgChartInner({ members }: { members: Member[] }) {
  const { setCenter, fitView } = useReactFlow();
  const [query, setQuery] = useState("");
  const [focusedId, setFocusedId] = useState<string | null>(null);

  // ツリー構築とレイアウトはメンバーが変わらない限り再計算しない
  const { flat, positions } = useMemo(() => {
    const roots = buildBinaryTree(members);
    return {
      flat: flattenTree(roots),
      positions: layoutBinaryTree(roots, X_GAP, Y_GAP),
    };
  }, [members]);

  const focusedNode = focusedId ? flat.find((n) => n.member.member_id === focusedId) : null;

  // フォーカス中の人が紹介したメンバーのID
  const introducedIds = useMemo(() => {
    if (!focusedId) return new Set<string>();
    return new Set(
      flat
        .filter((n) => n.introducer?.member_id === focusedId)
        .map((n) => n.member.member_id)
    );
  }, [flat, focusedId]);

  const nodes: Node[] = useMemo(
    () =>
      flat.map((n) => {
        const id = n.member.member_id;
        return {
          id,
          type: "member",
          position: positions.get(id) ?? { x: 0, y: 0 },
          draggable: false,
          data: {
            member: n.member,
            introducerName: n.introducer?.name ?? null,
            side: n.side,
            highlight: (id === focusedId
              ? "focus"
              : introducedIds.has(id)
              ? "introduced"
              : null) as Highlight,
          },
        };
      }),
    [flat, positions, focusedId, introducedIds]
  );

  const edges: Edge[] = useMemo(
    () =>
      flat
        .filter((n) => n.placementParent && n.side)
        .map((n) => ({
          id: `e-${n.placementParent!.member.member_id}-${n.member.member_id}`,
          source: n.placementParent!.member.member_id,
          target: n.member.member_id,
          type: "smoothstep",
          style: { stroke: SIDE_COLOR[n.side!], strokeWidth: 2.5 },
        })),
    [flat]
  );

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return flat
      .filter((n) => n.member.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [flat, query]);

  const focusMember = useCallback(
    (id: string) => {
      const pos = positions.get(id);
      if (!pos) return;
      setFocusedId(id);
      setQuery("");
      // ハイライトの再描画がズームアニメーションを中断しないよう、描画後に開始する
      window.setTimeout(() => {
        setCenter(pos.x + NODE_W / 2, pos.y + NODE_H / 2, {
          zoom: 1.1,
          duration: 600,
        });
      }, 50);
    },
    [positions, setCenter]
  );

  const showAll = useCallback(() => {
    setFocusedId(null);
    fitView({ padding: 0.15, duration: 600 });
  }, [fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.15 }}
      minZoom={0.05}
      nodesConnectable={false}
      onNodeClick={(_, node) => focusMember(node.id)}
      onPaneClick={() => setFocusedId(null)}
      className="bg-slate-50"
    >
      <Background gap={20} size={1} color="#cbd5e1" />
      <MiniMap zoomable pannable className="!hidden sm:!block" nodeColor="#7dd3fc" />
      <Controls showInteractive={false} />

      {/* 検索・凡例パネル */}
      <Panel
        position="top-left"
        className="m-2 w-[240px] max-w-[75vw] rounded-xl border border-slate-200 bg-white/95 p-3 shadow-md backdrop-blur-sm"
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="名前で検索"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-7 text-sm outline-none transition-colors focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="検索をクリア"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {searchResults.length > 0 && (
          <ul className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-slate-100 divide-y divide-slate-100">
            {searchResults.map((n) => (
              <li key={n.member.member_id}>
                <button
                  onClick={() => focusMember(n.member.member_id)}
                  className="flex w-full items-center justify-between px-2.5 py-2 text-left text-sm hover:bg-sky-50"
                >
                  <span className="truncate font-medium text-slate-700">{n.member.name}</span>
                  <span className="ml-2 shrink-0 text-[10px] text-slate-400">
                    {n.introducer ? `紹介: ${n.introducer.name}` : "トップ"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {query.trim() && searchResults.length === 0 && (
          <p className="mt-2 px-1 text-xs text-slate-400">該当するメンバーがいません</p>
        )}

        {/* フォーカス中のメンバー情報 */}
        {focusedNode && (
          <div className="mt-2 rounded-lg bg-sky-50 px-2.5 py-2 text-xs text-sky-900">
            <div className="font-bold">{focusedNode.member.name}</div>
            <div className="mt-0.5 text-sky-700/80">
              {focusedNode.introducer ? `紹介者: ${focusedNode.introducer.name}` : "トップ"}
              {" ／ "}紹介した人: {introducedIds.size}名
              {introducedIds.size > 0 && "（オレンジ枠）"}
            </div>
          </div>
        )}

        <div className="mt-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 text-[10px] font-semibold text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: SIDE_COLOR.left }} />
              左系列
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: SIDE_COLOR.right }} />
              右系列
            </span>
          </div>
          <button
            onClick={showAll}
            className="flex items-center gap-1 rounded-lg bg-sky-50 px-2 py-1.5 text-[11px] font-bold text-sky-700 transition-colors hover:bg-sky-100"
          >
            <Maximize2 className="h-3 w-3" />
            全体表示
          </button>
        </div>
      </Panel>
    </ReactFlow>
  );
}

export default function BinaryOrgChartClient({ members }: { members: Member[] }) {
  return (
    <div className="relative h-[70vh] sm:h-[75vh] w-full overflow-hidden rounded-2xl border border-sky-200 bg-slate-50 shadow-inner">
      <ReactFlowProvider>
        <BinaryOrgChartInner members={members} />
      </ReactFlowProvider>
    </div>
  );
}
