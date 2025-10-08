import { NextResponse } from "next/server";
import { getRecent } from "../../../../lib/store";

export async function GET() {
  const rows = getRecent(20).map((b) => ({
    txHash: b.txHash,
    amountHuman: b.amountHuman,
    timestamp: b.timestamp,
  }));
  return NextResponse.json(rows);
}
