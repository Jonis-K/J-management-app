import { NextResponse } from "next/server";
import { getGoals } from "@/lib/csv";

export async function GET() {
  try {
    const data = await getGoals();
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch goals data" },
      { status: 500 }
    );
  }
}
