import { NextResponse } from "next/server";
import { pushBurn } from "../../../../../lib/store";

export async function POST(req: Request) {
    const body = await req.json().catch(() => ({}));
    const amount = Number(body?.amount || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
        return NextResponse.json({ ok: false, error: "invalid amount" }, { status: 400 });
    }
    const row = pushBurn(amount);
    return NextResponse.json({ ok: true, txHash: row.txHash, amountHuman: row.amountHuman });
}
