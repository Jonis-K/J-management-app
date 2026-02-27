import { NextResponse } from "next/server";

function parseCsv(csvText: string): Record<string, string>[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? "";
    });
    return row;
  });
}

export async function GET() {
  const url = process.env.SHEETS_GOALS_CSV_URL;
  if (!url) {
    return NextResponse.json(
      { error: "Missing env: SHEETS_GOALS_CSV_URL" },
      { status: 500 }
    );
  }

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return NextResponse.json(
      { error: `Failed to fetch CSV: ${res.status}` },
      { status: 502 }
    );
  }

  const csv = await res.text();
  const data = parseCsv(csv);

  return NextResponse.json({ data });
}
