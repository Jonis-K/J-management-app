import { NextResponse } from "next/server";
import { getMembers } from "@/lib/csv";

export async function GET() {
  try {
    const data = await getMembers();
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[API] /api/members failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch members data" },
      { status: 500 }
    );
  }
}