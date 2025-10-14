import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ Correct total supply (100 billion)
const TOTAL_SUPPLY = 100_000_000_000;

export async function GET() {
  try {
    const burns = await prisma.burn.findMany();

    // ✅ Sum all burned amounts
    const totalBurned = burns.reduce(
      (sum, b) => sum + Number(b.amountHuman || 0),
      0
    );

    // ✅ Correct math — calculate percentage and remaining supply
    const remainingSupply = TOTAL_SUPPLY - totalBurned;
    const percentBurned = (totalBurned / TOTAL_SUPPLY) * 100;

    return NextResponse.json({
      totalBurned,
      remainingSupply,
      percentBurned,
      count: burns.length,
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
