import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const burns = await prisma.burn.findMany({
      orderBy: { timestamp: "desc" },
      take: 50,
      select: {
        id: true,
        txHash: true,
        fromAddress: true,
        toAddress: true,
        tokenAddress: true,
        amountRaw: true,
        amountHuman: true,
        timestamp: true,
      },
    });

    return NextResponse.json({ burns });
  } catch (err: any) {
    console.error("Error fetching burns:", err);
    return NextResponse.json({ error: "Failed to fetch burns" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
