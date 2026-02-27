export const dynamic = "force-dynamic";

type Member = {
  member_id: string;
  parent_id: string;
  name: string;
};

function parseCsv(csvText: string): Member[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = cols[i] ?? ""));
    return {
      member_id: row.member_id,
      parent_id: row.parent_id,
      name: row.name,
    };
  });
}

async function getMembers(): Promise<Member[]> {
  const url = process.env.SHEETS_MEMBERS_CSV_URL;
  if (!url) return [];

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];

  const csv = await res.text();
  return parseCsv(csv);
}

type Node = Member & { children: Node[] };

function buildTree(members: Member[]): Node[] {
  const map = new Map<string, Node>();

  // 初期ノード生成
  members.forEach((m) => {
    map.set(m.member_id, { ...m, children: [] });
  });

  const roots: Node[] = [];

  members.forEach((m) => {
    const node = map.get(m.member_id);
    if (!node) return;

    if (!m.parent_id || !map.has(m.parent_id)) {
      // 親がいない or 不正ID → ルート扱い
      roots.push(node);
    } else {
      const parent = map.get(m.parent_id);
      parent?.children.push(node);
    }
  });

  return roots;
}

function Tree({ nodes }: { nodes: Node[] }) {
  if (!nodes.length) return null;

  return (
    <ul className="pl-4 border-l space-y-2">
      {nodes.map((n) => (
        <li key={n.member_id}>
          <div className="text-sm">
            <span className="font-medium">{n.name}</span>
            <span className="text-xs text-neutral-500 ml-2">
              ({n.member_id})
            </span>
          </div>
          {n.children.length > 0 && <Tree nodes={n.children} />}
        </li>
      ))}
    </ul>
  );
}

export default async function OrgPage() {
  const members = await getMembers();
  const tree = buildTree(members);

  return (
    <main className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">組織図（簡易）</h1>
        <p className="text-sm text-neutral-500">
          parent_id に基づいてツリー生成しています。
        </p>
      </div>

      <div className="rounded-lg border bg-white p-4">
        {tree.length > 0 ? (
          <Tree nodes={tree} />
        ) : (
          <div className="text-sm text-neutral-500">
            メンバーデータがありません。
          </div>
        )}
      </div>
    </main>
  );
}