// Force Node runtime + no caching
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
// Use a RELATIVE import to avoid tsconfig/path alias issues on Vercel
import { prisma } from "../../../lib/prisma";

export async function GET() {
    const burns = await prisma.burn.findMany({
        orderBy: { timestamp: "desc" },
        take: 200,
    });

    // Prisma Decimal -> string
    const data = burns.map((b) => ({
        ...b,
        amountHuman: b.amountHuman ? b.amountHuman.toString() : null,
    }));

    return NextResponse.json({ burns: data });
}
