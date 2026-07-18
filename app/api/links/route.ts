import { NextResponse } from "next/server";
import { getLinks } from "@/lib/csv";

export async function GET() {
  try {
    const data = await getLinks();
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[API] /api/links failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch links data" },
      { status: 500 }
    );
  }
}
