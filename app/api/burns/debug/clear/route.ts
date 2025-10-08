import { NextResponse } from "next/server";
import { clearAll } from "../../../../../lib/store";

export async function DELETE() {
    clearAll();
    return NextResponse.json({ ok: true });
}
