// lib/csv.ts
export type Member = {
  member_id: string;
  parent_id: string;
  name: string;
};

export type Goal = {
  goal_id: string;
  member_id: string;
  deadline: string;
  title: string;
  plan_month_1: string;
  plan_month_2: string;
  plan_month_3: string;
  status: string;
  updated_at: string;
};

export type LinkItem = {
  link_id: string;
  type: string; // memo | qa | attend | other
  category: string;
  title: string;
  url: string;
  sort_order: string;
  updated_at: string;
};

// React Flow等で使うためのグラフ構造の基礎
export type GraphNode<T = any> = {
  id: string;
  data: T;
};
export type GraphEdge = {
  id: string;
  source: string;
  target: string;
};

function parseCsv<T>(csvText: string): T[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    // CSV内にカンマが含まれる場合を考慮するなら本来は専用ライブラリが望ましいですが、
    // 現在の簡易実装を踏襲します（必要に応じて拡張可能）。
    const cols = line.split(",").map((c) => c.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = cols[i] ?? ""));
    return row as unknown as T;
  });
}

async function fetchAndParse<T>(envKey: string): Promise<T[]> {
  const url = process.env[envKey];
  if (!url) return [];

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.error(`Failed to fetch CSV from ${envKey}: ${res.statusText}`);
      return [];
    }
    const csv = await res.text();
    return parseCsv<T>(csv);
  } catch (error) {
    console.error(`Error fetching CSV from ${envKey}:`, error);
    return [];
  }
}

export async function getMembers(): Promise<Member[]> {
  return fetchAndParse<Member>("SHEETS_MEMBERS_CSV_URL");
}

export async function getGoals(): Promise<Goal[]> {
  return fetchAndParse<Goal>("SHEETS_GOALS_CSV_URL");
}

export async function getLinks(): Promise<LinkItem[]> {
  const data = await fetchAndParse<LinkItem>("SHEETS_LINKS_CSV_URL");
  return data.sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
}

/**
 * 簡易的に React Flow 等の Node/Edge 形式に変換するヘルパー関数
 */
export function buildGraphFromMembers(members: Member[]): { nodes: GraphNode<Member>[]; edges: GraphEdge[] } {
  const nodes = members.map((m) => ({
    id: m.member_id,
    data: m,
  }));

  const edges: GraphEdge[] = [];
  members.forEach((m) => {
    if (m.parent_id && members.find((p) => p.member_id === m.parent_id)) {
      edges.push({
        id: `e-${m.parent_id}-${m.member_id}`,
        source: m.parent_id,
        target: m.member_id,
      });
    }
  });

  return { nodes, edges };
}
