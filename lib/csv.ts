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
  
  // BOMがあれば削除
  const cleanCsvText = csvText.replace(/^\uFEFF/, "");

  // ヘッダー行を解析して区切り文字(カンマかタブか)を自動判定する
  const firstLineEnd = cleanCsvText.indexOf('\n');
  const firstLine = cleanCsvText.slice(0, firstLineEnd > -1 ? firstLineEnd : cleanCsvText.length);
  const delimiter = (!firstLine.includes(',') && firstLine.includes('\t')) ? '\t' : ',';

  // 文字単位で解析するステートマシン（カンマ/タブや改行を含むセル対策）
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < cleanCsvText.length; i++) {
    const char = cleanCsvText[i];
    const nextChar = cleanCsvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"'; // エスケープされたダブルクォート
        i++; // 次の文字をスキップ
      } else {
        inQuotes = !inQuotes; // クォート状態のトグル
      }
    } else if (char === delimiter && !inQuotes) {
      // セルの区切り（自動判定された , または \t ）
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      // 行の区切り
      if (char === '\r' && nextChar === '\n') {
        i++; // \r\n の場合は \n をスキップ
      }
      currentRow.push(currentVal.trim());
      
      // 中身が実質的に空の行（余分についてきた行）でなければ追加
      if (currentRow.some((val) => val !== "")) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  // 最後の行の処理
  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some((val) => val !== "")) {
      rows.push(currentRow);
    }
  }

  // 1行目をヘッダーとする（トリム、クォート除去、大文字小文字の統一）
  const headers = rows[0].map((h) => h.replace(/^"|"$/g, "").trim().toLowerCase());
  console.log("Extracted Headers:", headers);

  const parsedData: T[] = [];

  rows.slice(1).forEach((cols) => {
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      // 値の先頭・末尾のクォートを除去し、自動的に前後の空白も取り除く
      const rawVal = cols[i] ?? "";
      row[h] = rawVal.replace(/^"|"$/g, "").trim();
    });
    
    // シート上のカラム名が 'id' の場合に補完
    if (row.id && !row.member_id) {
      row.member_id = row.id;
    }

    // --- データのクリーニングと未入力行のスキップ ---
    // members用: 名前が空欄の行はスキップ
    if (headers.includes("name") && !row.name) return;
    // goals / links用: タイトルが空欄の行をスキップ（追加の安全性）
    if (headers.includes("title") && !row.title) return;
    // member_id カラムがあるのに空欄の行はスキップ
    if (headers.includes("member_id") && !row.member_id) return;

    parsedData.push(row as unknown as T);
  });

  return parsedData;
}

async function fetchAndParse<T>(envKey: string): Promise<T[]> {
  let url = process.env[envKey];
  if (!url) {
    console.error(`[CSV Fetch] ${envKey} is not set in environment variables.`);
    return [];
  }

  // --- 安全装置 ---
  // GitHubなどへの露出を懸念して、わざと「編集画面のURL（/edit）」を環境変数に入れた場合や
  // 単なる設定ミスだった場合でも、プログラム側で自動的に「CSVエクスポート専用の直リンク」に変換します。
  if (url.includes("/edit")) {
    const docIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    const gidMatch = url.match(/gid=([0-9]+)/);
    
    if (docIdMatch) {
      const docId = docIdMatch[1];
      const gid = gidMatch ? gidMatch[1] : "0";
      url = `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv&gid=${gid}`;
      console.log(`[CSV Fetch] Auto-converted /edit URL to export URL for ${envKey}.`);
    }
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
