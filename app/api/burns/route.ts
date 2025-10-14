// app/api/burns/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
    const burns = await prisma.burn.findMany({
        orderBy: { timestamp: "desc" }, // shows newest first
        take: 200,                      // bump if you need more
    });

    // Prisma Decimal -> string for JSON
    const data = burns.map(b => ({
        ...b,
        amountHuman: b.amountHuman ? b.amountHuman.toString() : null,
    }));

    return NextResponse.json({ burns: data });
}
