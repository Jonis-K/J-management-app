// lib/csv.ts
export type Member = {
  member_id: string;
  parent_id: string;
  name: string;
  age?: string;
  gender?: string;
  photo_url?: string;
  job?: string;
  dream?: string;
  role?: string;
  updated_at?: string;
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
  // デバッグ用：取得した生CSVの一部とヘッダーなどをコンソール出力
  console.log("=== CSV Parse Debug ===");
  console.log("Raw CSV Header & First Row:", csvText.split(/\r?\n/).slice(0, 2));

  // BOMがあれば削除
  const cleanCsvText = csvText.replace(/^\uFEFF/, "");
  
  const lines = cleanCsvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const validLines = lines.filter((l) => {
    // Google Sheets でよくある「カンマだけの空行（例: ,,,,,,）」を除外
    return l.replace(/,/g, "").trim().length > 0;
  });

  if (validLines.length === 0) return [];

  // ダブルクォートがあれば除去する
  const headers = validLines[0].split(",").map((h) => h.replace(/^"|"$/g, "").trim());
  console.log("Extracted Headers:", headers);

  return validLines.slice(1).map((line) => {
    // 簡易実装を引き継ぐ（値のダブルクォートも除去）
    const cols = line.split(",").map((c) => c.replace(/^"|"$/g, "").trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = cols[i] ?? ""));
    
    // シート上のカラム名が 'id' の場合に、コード側の 'member_id' としても利用できるように補完
    if (row.id && !row.member_id) {
      row.member_id = row.id;
    }

    return row as unknown as T;
  });
}

async function fetchAndParse<T>(envKey: string): Promise<T[]> {
  const url = process.env[envKey];
  if (!url) {
    console.error(`[CSV Fetch] ${envKey} is not set in environment variables.`);
    return [];
  }

  try {
    console.log(`\n[CSV Fetch] Fetching from ${envKey}...`);
    const res = await fetch(url, { cache: "no-store" });
    console.log(`[CSV Fetch] Response status: ${res.status} ${res.statusText}`);
    
    if (!res.ok) {
      console.error(`[CSV Fetch Error] Failed to fetch CSV from ${envKey}: ${res.status} ${res.statusText}`);
      return [];
    }
    
    const csv = await res.text();
    console.log(`[CSV Fetch] Data received, length: ${csv.length} characters`);
    console.log("MEMBERS_RAW_DATA:", csv.slice(0, 100));

    return parseCsv<T>(csv);
  } catch (error) {
    console.error(`[CSV Fetch Exception] Error fetching CSV from ${envKey}:`, error);
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
