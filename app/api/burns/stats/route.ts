import { NextResponse } from "next/server";
import { getStats } from "../../../../lib/store";

const TOTAL_SUPPLY = Number(process.env.NEXT_PUBLIC_TOTAL_SUPPLY || "1000000000");

export async function GET() {
  const stats = getStats(TOTAL_SUPPLY);
  return NextResponse.json(stats);
}
