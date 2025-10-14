export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const count = await prisma.burn.count();
  const totalBurned = await prisma.burn.aggregate({
    _sum: { amountHuman: true },
  });

  const totalSupply = 100_000_000_000; // adjust if needed
  const burned = Number(totalBurned._sum.amountHuman || 0);
  const percentBurned = (burned / totalSupply) * 100;
  const remainingSupply = totalSupply - burned;

  return NextResponse.json({
    count,
    percentBurned,
    remainingSupply,
  });
}
