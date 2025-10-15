export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

const DEAD = "0x000000000000000000000000000000000000dead";
const TOKEN = process.env.TOKEN_ADDRESS?.toLowerCase();

export async function GET() {
    const burns = await prisma.burn.findMany({
        where: {
            toAddress: { equals: DEAD, mode: "insensitive" },        // ✅ handle dEaD vs dead
            ...(TOKEN ? { tokenAddress: { equals: TOKEN, mode: "insensitive" } } : {}),
        },
        orderBy: { timestamp: "desc" }, // ✅ newest first
        take: 50,                       // ✅ show more history
    });

    const data = burns.map((b) => ({
        ...b,
        amountHuman: b.amountHuman ? b.amountHuman.toString() : null, // ✅ Decimal -> string
    }));

    return NextResponse.json({ burns: data });
}
