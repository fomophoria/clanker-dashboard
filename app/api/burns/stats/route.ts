import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ✅ Correct total supply for DL
const TOTAL_SUPPLY = 100_000_000_000; // 100 billion DL tokens

export async function GET() {
  try {
    const burns = await prisma.burn.findMany();

    const totalBurned = burns.reduce(
      (sum, b) => sum + Number(b.amountHuman || 0),
      0
    );

    // ✅ Correct math — percentage and remaining supply
    const remainingSupply = TOTAL_SUPPLY - totalBurned;
    const percentBurned = (totalBurned / TOTAL_SUPPLY) * 100;

    return NextResponse.json({
      totalBurned,
      remainingSupply,
      percentBurned,
      count: burns.length,
    });
  } catch (error) {
    console.error("Error fetching burn stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch burn stats" },
      { status: 500 }
    );
  }
}
