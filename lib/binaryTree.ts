// lib/binaryTree.ts
// バイナリー（2系列）MLM組織のツリー構築とレイアウト計算。
//
// 配置ルール（スピルオーバー方式）:
//   紹介者が「左」に出した場合、紹介者の左が空いていればそこに付く。
//   すでに埋まっている場合は、左系列をさらに左へ空きが出るまで下って付く。
//   右も同様に右系列を右へ下る。
//   例: Aの左にB、右にC。AがDを左に出す → Bの左へ。BがEを左に出す → Dの左へ。

import { Member } from "./csv";

export type PlacementSide = "left" | "right";

export type PlacedNode = {
  member: Member;
  /** 紹介者（parent_id の人）。配置上の親とは別 */
  introducer: Member | null;
  /** 紹介時に指定されたサイド（rootはnull） */
  side: PlacementSide | null;
  /** 配置上の親（スピルオーバー先） */
  placementParent: PlacedNode | null;
  left: PlacedNode | null;
  right: PlacedNode | null;
  depth: number;
};

/** シートの position 列の表記ゆれを吸収する */
export function normalizeSide(raw?: string): PlacementSide | null {
  const v = (raw ?? "").trim().toLowerCase();
  if (v === "left" || v === "l" || v === "左") return "left";
  if (v === "right" || v === "r" || v === "右") return "right";
  return null;
}

/**
 * メンバー一覧（シートの行順 = 加入順）からバイナリーツリーを構築する。
 * position 列が未入力の場合は、その紹介者の何人目かで左→右→左…と交互に振る。
 */
export function buildBinaryTree(members: Member[]): PlacedNode[] {
  const nodeMap = new Map<string, PlacedNode>();
  const roots: PlacedNode[] = [];
  const introducedCount = new Map<string, number>();

  const createNode = (m: Member, introducer: PlacedNode | null): PlacedNode => ({
    member: m,
    introducer: introducer?.member ?? null,
    side: null,
    placementParent: null,
    left: null,
    right: null,
    depth: 0,
  });

  const placeUnder = (introducerNode: PlacedNode, node: PlacedNode, side: PlacementSide) => {
    // 指定サイドの系列を空きが出るまで下る（スピルオーバー）
    let cur = introducerNode;
    while (cur[side]) {
      cur = cur[side]!;
    }
    cur[side] = node;
    node.placementParent = cur;
    node.side = side;
    node.depth = cur.depth + 1;
  };

  // 紹介者が自分より後の行に書かれていても解決できるよう、置けるまで繰り返す
  let pending = members.filter((m) => m.member_id);
  while (pending.length > 0) {
    const deferred: Member[] = [];
    let placedAny = false;

    for (const m of pending) {
      const introducerNode = m.parent_id ? nodeMap.get(m.parent_id) : undefined;

      if (m.parent_id && !introducerNode) {
        deferred.push(m); // 紹介者が未配置なら後回し
        continue;
      }

      const node = createNode(m, introducerNode ?? null);

      if (introducerNode) {
        const count = introducedCount.get(m.parent_id) ?? 0;
        introducedCount.set(m.parent_id, count + 1);
        const side = normalizeSide(m.position) ?? (count % 2 === 0 ? "left" : "right");
        placeUnder(introducerNode, node, side);
      } else {
        roots.push(node);
      }

      nodeMap.set(m.member_id, node);
      placedAny = true;
    }

    if (!placedAny) {
      // 紹介者IDが存在しない（入力ミス等）メンバーはルート扱いにして無限ループを防ぐ
      for (const m of deferred) {
        const node = createNode(m, null);
        roots.push(node);
        nodeMap.set(m.member_id, node);
      }
      break;
    }

    pending = deferred;
  }

  return roots;
}

/** ツリー全ノードを配列に展開する */
export function flattenTree(roots: PlacedNode[]): PlacedNode[] {
  const out: PlacedNode[] = [];
  const walk = (n: PlacedNode | null) => {
    if (!n) return;
    out.push(n);
    walk(n.left);
    walk(n.right);
  };
  roots.forEach(walk);
  return out;
}

export type NodePosition = { x: number; y: number };

/**
 * 中間順（in-order）走査で列番号を割り当てるバイナリーツリー定番のレイアウト。
 * 左の部分木は必ず親より左、右の部分木は必ず親より右に並ぶため視認性が高い。
 */
export function layoutBinaryTree(
  roots: PlacedNode[],
  xGap: number,
  yGap: number
): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();
  let col = 0;

  const visit = (node: PlacedNode | null) => {
    if (!node) return;
    visit(node.left);
    positions.set(node.member.member_id, {
      x: col * xGap,
      y: node.depth * yGap,
    });
    col++;
    visit(node.right);
  };

  roots.forEach((root, i) => {
    if (i > 0) col += 1; // 複数ルート間に隙間を空ける
    visit(root);
  });

  return positions;
}
