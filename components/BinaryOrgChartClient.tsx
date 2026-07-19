"use client";

import { useMemo, useRef, useState, useCallback } from "react";
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
import { Search, Maximize2, X } from "lucide-react";
import Avatar from "./Avatar";
import { Member } from "@/lib/csv";
import {
  buildBinaryTree,
  flattenTree,
  layoutBinaryTree,
  countLegs,
  buildGenealogyTree,
  flattenGenealogy,
  layoutGenealogyTree,
  PlacementSide,
  LegCounts,
} from "@/lib/binaryTree";

// ノードカードの寸法とレイアウト間隔
const NODE_W = 190;
const NODE_H = 76;
const X_GAP = 210;
const Y_GAP = 140;

const SIDE_COLOR: Record<PlacementSide, string> = {
  left: "#0284c7", // 左系列: sky-600
  right: "#d97706", // 右系列: amber-600
};
const GENEALOGY_EDGE_COLOR = "#64748b"; // 系譜モードのエッジ: slate-500

type ChartMode = "binary" | "genealogy";

type Highlight = "focus" | "introduced" | null;

type MemberNodeData = {
  member: Member;
  introducerName: string | null;
  side: PlacementSide | null;
  legCounts: LegCounts | null;
  highlight: Highlight;
};

function MemberNode({ data }: { data: MemberNodeData }) {
  const { member, introducerName, side, legCounts, highlight } = data;

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

      {/* 配置サイドのバッジ（L/R）: バイナリーモードのみ */}
      {side && (
        <span
          className="absolute -top-2.5 -left-2 rounded-md px-1.5 py-0.5 text-[10px] font-black text-white shadow-sm"
          style={{ backgroundColor: SIDE_COLOR[side] }}
        >
          {side === "left" ? "L" : "R"}
        </span>
      )}

      <div className="flex h-full items-center gap-2.5 px-3">
        <Avatar name={member.name} photoUrl={member.photo_url} size={44} className="border border-sky-100" />

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

      {/* 左右系列の人数（バイナリーモードのみ） */}
      {legCounts && (
        <>
          <span
            className="absolute -bottom-2.5 left-2 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm"
            style={{ backgroundColor: SIDE_COLOR.left }}
            title="左系列の人数"
          >
            左 {legCounts.left}
          </span>
          <span
            className="absolute -bottom-2.5 right-2 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm"
            style={{ backgroundColor: SIDE_COLOR.right }}
            title="右系列の人数"
          >
            右 {legCounts.right}
          </span>
        </>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-slate-300 !w-2 !h-2 !border-0" />
    </div>
  );
}

const nodeTypes = { member: MemberNode };

type ChartEntry = {
  id: string;
  member: Member;
  introducer: Member | null;
  side: PlacementSide | null;
};

function BinaryOrgChartInner({
  members,
  initialFocusId,
}: {
  members: Member[];
  initialFocusId?: string;
}) {
  const { setCenter, fitView } = useReactFlow();
  const [mode, setMode] = useState<ChartMode>("binary");
  const [query, setQuery] = useState("");
  const [focusedId, setFocusedId] = useState<string | null>(null);

  // モードごとのツリー構築とレイアウト
  const { entries, positions, edges: baseEdges, legCounts } = useMemo(() => {
    if (mode === "binary") {
      const roots = buildBinaryTree(members);
      const flat = flattenTree(roots);
      const positions = layoutBinaryTree(roots, X_GAP, Y_GAP);
      const legCounts = countLegs(roots);
      const entries: ChartEntry[] = flat.map((n) => ({
        id: n.member.member_id,
        member: n.member,
        introducer: n.introducer,
        side: n.side,
      }));
      const edges: Edge[] = flat
        .filter((n) => n.placementParent && n.side)
        .map((n) => ({
          id: `e-${n.placementParent!.member.member_id}-${n.member.member_id}`,
          source: n.placementParent!.member.member_id,
          target: n.member.member_id,
          type: "smoothstep",
          style: { stroke: SIDE_COLOR[n.side!], strokeWidth: 2.5 },
        }));
      return { entries, positions, edges, legCounts };
    }

    const roots = buildGenealogyTree(members);
    const flat = flattenGenealogy(roots);
    const positions = layoutGenealogyTree(roots, X_GAP, Y_GAP);
    const entries: ChartEntry[] = flat.map((n) => ({
      id: n.member.member_id,
      member: n.member,
      introducer: n.introducer,
      side: null,
    }));
    const edges: Edge[] = flat
      .filter((n) => n.introducer)
      .map((n) => ({
        id: `ge-${n.introducer!.member_id}-${n.member.member_id}`,
        source: n.introducer!.member_id,
        target: n.member.member_id,
        type: "smoothstep",
        style: { stroke: GENEALOGY_EDGE_COLOR, strokeWidth: 2 },
      }));
    return { entries, positions, edges, legCounts: null };
  }, [members, mode]);

  const focusedEntry = focusedId ? entries.find((n) => n.id === focusedId) : null;

  // フォーカス中の人が紹介したメンバーのID
  const introducedIds = useMemo(() => {
    if (!focusedId) return new Set<string>();
    return new Set(
      entries.filter((n) => n.introducer?.member_id === focusedId).map((n) => n.id)
    );
  }, [entries, focusedId]);

  const nodes: Node[] = useMemo(
    () =>
      entries.map((n) => ({
        id: n.id,
        type: "member",
        position: positions.get(n.id) ?? { x: 0, y: 0 },
        draggable: false,
        data: {
          member: n.member,
          introducerName: n.introducer?.name ?? null,
          side: n.side,
          legCounts: legCounts?.get(n.id) ?? null,
          highlight: (n.id === focusedId
            ? "focus"
            : introducedIds.has(n.id)
            ? "introduced"
            : null) as Highlight,
        },
      })),
    [entries, positions, legCounts, focusedId, introducedIds]
  );

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return entries.filter((n) => n.member.name.toLowerCase().includes(q)).slice(0, 8);
  }, [entries, query]);

  const focusMember = useCallback(
    (id: string, opts?: { instant?: boolean }) => {
      const pos = positions.get(id);
      if (!pos) return;
      setFocusedId(id);
      setQuery("");
      // ハイライトの再描画がズームアニメーションを中断しないよう、描画後に開始する
      window.setTimeout(() => {
        setCenter(pos.x + NODE_W / 2, pos.y + NODE_H / 2, {
          zoom: 1.1,
          duration: opts?.instant ? 0 : 600,
        });
      }, 50);
    },
    [positions, setCenter]
  );

  const showAll = useCallback(() => {
    setFocusedId(null);
    fitView({ padding: 0.15, duration: 600 });
  }, [fitView]);

  // /org?focus=<member_id> で開かれた場合、初回にその人へフォーカスする。
  // 初期fitViewが後から走るとsetCenterを上書きするため、フォーカス指定時はfitView自体を無効化する
  const hasInitialFocus = !!(initialFocusId && positions.has(initialFocusId));
  const didInitialFocus = useRef(false);
  const handleInit = useCallback(() => {
    if (didInitialFocus.current || !hasInitialFocus || !initialFocusId) return;
    didInitialFocus.current = true;
    // 初回はアニメーションなしで即座にフォーカス位置へ移動する
    window.setTimeout(() => focusMember(initialFocusId, { instant: true }), 300);
  }, [hasInitialFocus, initialFocusId, focusMember]);

  // モード切替時は全体表示に戻す
  const switchMode = useCallback(
    (next: ChartMode) => {
      if (next === mode) return;
      setMode(next);
      setFocusedId(null);
      // 新レイアウトのノード再配置が反映されてから全体表示する
      window.setTimeout(() => fitView({ padding: 0.15, duration: 400 }), 200);
    },
    [mode, fitView]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={baseEdges}
      nodeTypes={nodeTypes}
      fitView={!hasInitialFocus}
      fitViewOptions={{ padding: 0.15 }}
      minZoom={0.05}
      nodesConnectable={false}
      onInit={handleInit}
      onNodeClick={(_, node) => focusMember(node.id)}
      onPaneClick={() => setFocusedId(null)}
      className="bg-slate-50"
    >
      <Background gap={20} size={1} color="#cbd5e1" />
      <MiniMap zoomable pannable className="!hidden sm:!block" nodeColor="#7dd3fc" />
      <Controls showInteractive={false} />

      {/* 検索・モード切替・凡例パネル */}
      <Panel
        position="top-left"
        className="m-2 w-[250px] max-w-[78vw] rounded-xl border border-slate-200 bg-white/95 p-3 shadow-md backdrop-blur-sm"
      >
        {/* モード切替 */}
        <div className="mb-2.5 grid grid-cols-2 rounded-lg bg-slate-100 p-0.5 text-center text-[11px] font-bold">
          <button
            onClick={() => switchMode("binary")}
            className={`rounded-md py-1.5 transition-colors ${
              mode === "binary" ? "bg-white text-sky-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            配置（左右）
          </button>
          <button
            onClick={() => switchMode("genealogy")}
            className={`rounded-md py-1.5 transition-colors ${
              mode === "genealogy" ? "bg-white text-sky-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            紹介系譜
          </button>
        </div>

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
              <li key={n.id}>
                <button
                  onClick={() => focusMember(n.id)}
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
        {focusedEntry && (
          <div className="mt-2 rounded-lg bg-sky-50 px-2.5 py-2 text-xs text-sky-900">
            <div className="font-bold">{focusedEntry.member.name}</div>
            <div className="mt-0.5 text-sky-700/80">
              {focusedEntry.introducer ? `紹介者: ${focusedEntry.introducer.name}` : "トップ"}
              {" ／ "}紹介した人: {introducedIds.size}名
              {introducedIds.size > 0 && "（オレンジ枠）"}
            </div>
          </div>
        )}

        <div className="mt-2.5 flex items-center justify-between gap-2">
          {mode === "binary" ? (
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
          ) : (
            <div className="text-[10px] font-semibold text-slate-500">
              誰が誰を紹介したかの系譜
            </div>
          )}
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

export default function BinaryOrgChartClient({
  members,
  initialFocusId,
}: {
  members: Member[];
  initialFocusId?: string;
}) {
  return (
    <div className="relative h-[70vh] sm:h-[75vh] w-full overflow-hidden rounded-2xl border border-sky-200 bg-slate-50 shadow-inner">
      <ReactFlowProvider>
        <BinaryOrgChartInner members={members} initialFocusId={initialFocusId} />
      </ReactFlowProvider>
    </div>
  );
}
