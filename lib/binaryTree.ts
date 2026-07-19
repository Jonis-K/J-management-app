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

export type LegCounts = { left: number; right: number };

/** 各ノードの左系列・右系列それぞれの配下人数を計算する */
export function countLegs(roots: PlacedNode[]): Map<string, LegCounts> {
  const counts = new Map<string, LegCounts>();

  // 自分を含む配下人数を返す
  const walk = (node: PlacedNode | null): number => {
    if (!node) return 0;
    const left = walk(node.left);
    const right = walk(node.right);
    counts.set(node.member.member_id, { left, right });
    return left + right + 1;
  };

  roots.forEach((r) => walk(r));
  return counts;
}

// ---- 紹介系譜ツリー（誰が誰を紹介したか。配置とは別の木構造） ----

export type GenealogyNode = {
  member: Member;
  introducer: Member | null;
  children: GenealogyNode[];
  depth: number;
};

/** 紹介者(parent_id)ベースの系譜ツリーを構築する。子はシートの行順（=紹介順） */
export function buildGenealogyTree(members: Member[]): GenealogyNode[] {
  const nodeMap = new Map<string, GenealogyNode>();
  const roots: GenealogyNode[] = [];

  const valid = members.filter((m) => m.member_id);
  valid.forEach((m) => {
    nodeMap.set(m.member_id, { member: m, introducer: null, children: [], depth: 0 });
  });

  valid.forEach((m) => {
    const node = nodeMap.get(m.member_id)!;
    const parent = m.parent_id ? nodeMap.get(m.parent_id) : undefined;
    if (parent && parent !== node) {
      node.introducer = parent.member;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // depthを親から順に設定
  const setDepth = (node: GenealogyNode, depth: number) => {
    node.depth = depth;
    node.children.forEach((c) => setDepth(c, depth + 1));
  };
  roots.forEach((r) => setDepth(r, 0));

  return roots;
}

/** 系譜ツリー全ノードを配列に展開する */
export function flattenGenealogy(roots: GenealogyNode[]): GenealogyNode[] {
  const out: GenealogyNode[] = [];
  const walk = (n: GenealogyNode) => {
    out.push(n);
    n.children.forEach(walk);
  };
  roots.forEach(walk);
  return out;
}

/**
 * 系譜ツリーのレイアウト。葉に順に列を割り当て、親は子の中央に置く定番方式。
 */
export function layoutGenealogyTree(
  roots: GenealogyNode[],
  xGap: number,
  yGap: number
): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();
  let col = 0;

  const visit = (node: GenealogyNode): number => {
    let x: number;
    if (node.children.length === 0) {
      x = col * xGap;
      col++;
    } else {
      const childXs = node.children.map(visit);
      x = (childXs[0] + childXs[childXs.length - 1]) / 2;
    }
    positions.set(node.member.member_id, { x, y: node.depth * yGap });
    return x;
  };

  roots.forEach((root, i) => {
    if (i > 0) col += 1;
    visit(root);
  });

  return positions;
}

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
