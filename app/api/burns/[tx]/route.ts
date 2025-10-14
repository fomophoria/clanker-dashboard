import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_: Request, { params }: { params: { tx: string } }) {
  const burn = await prisma.burn.findUnique({ where: { txHash: params.tx } });
  if (!burn) return NextResponse.json({ found: false }, { status: 404 });
  return NextResponse.json({
    found: true,
    burn: {
      ...burn,
      amountHuman: burn.amountHuman ? burn.amountHuman.toString() : null,
    },
  });
}
