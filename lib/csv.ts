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
  console.log("=== CSV Parse Debug ===");
  
  // BOMの削除
  const cleanCsvText = csvText.replace(/^\uFEFF/, "");
  
  // 【修正ポイント1】カンマや改行を含むデータに対応するため、単純な split("\n") ではなく
  // 正規表現を使用して、ダブルクォートで囲まれた中身を保護しつつ行を分割します。
  const rows = cleanCsvText.match(/(".*?"|[^"\r\n]+)(?=\r?\n|$)|(?<=\r?\n|^)\r?\n/g) || [];
  
  // もし上記が複雑すぎる場合は、一旦行で分け、各行のパースを強化します
  const lines = cleanCsvText.split(/\r?\n/).map(l => l.trim());

  if (lines.length === 0) return [];

  // ヘッダーの取得（前後の余計な空白を完全に除去）
  const headers = lines[0].split(",").map((h) => h.replace(/^"|"$/g, "").trim().toLowerCase());
  console.log("Extracted Headers:", headers);

  const result: T[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // 【修正ポイント2】カンマだけの行や、実質空の行をより厳格に除外
    if (!line || line.replace(/,/g, "").trim().length === 0) continue;

    // 【修正ポイント3】値に含まれるカンマに対応するための正規表現パース
    // CSVの1行を、カンマで分割するが、ダブルクォート内のカンマは無視する
    const cols: string[] = [];
    let start = 0;
    let inQuotes = false;
    for (let c = 0; c < line.length; c++) {
      if (line[c] === '"') inQuotes = !inQuotes;
      if (line[c] === ',' && !inQuotes) {
        cols.push(line.substring(start, c));
        start = c + 1;
      }
    }
    cols.push(line.substring(start));

    const row: Record<string, any> = {};
    headers.forEach((h, index) => {
      let val = (cols[index] ?? "").trim();
      val = val.replace(/^"|"$/g, ""); // 前後のダブルクォートを除去
      row[h] = val;
    });

    // IDの補完ロジック
    if (row.id && !row.member_id) row.member_id = row.id;
    
    // member_id すら空の行はデータとして不完全なので除外
    if (row.member_id || row.name) {
      result.push(row as unknown as T);
    }
  }

  console.log(`Parsed Result: ${result.length} items found.`);
  return result;
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
