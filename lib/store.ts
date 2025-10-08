// lib/store.ts
import fs from "fs";
import path from "path";
import crypto from "crypto";

export type BurnRow = {
    txHash: string;
    amountHuman: number;  // already human units (e.g., tokens)
    amountRaw?: string;   // optional raw string if you ever use decimals
    timestamp: number;    // ms epoch
};

type StoreData = {
    burns: BurnRow[];
};

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "burns.json");

function ensureFile() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DATA_FILE)) {
        const init: StoreData = { burns: [] };
        fs.writeFileSync(DATA_FILE, JSON.stringify(init, null, 2), "utf8");
    }
}

function read(): StoreData {
    ensureFile();
    try {
        const raw = fs.readFileSync(DATA_FILE, "utf8");
        const parsed = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.burns)) return { burns: [] };
        return parsed as StoreData;
    } catch {
        return { burns: [] };
    }
}

function write(data: StoreData) {
    ensureFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

// public API
export function pushBurn(amountHuman: number, txHash?: string) {
    const db = read();
    const row: BurnRow = {
        txHash:
            txHash ||
            ("0x" +
                crypto.randomBytes(3).toString("hex") +
                "…" /* short hash style */),
        amountHuman,
        timestamp: Date.now(),
    };
    db.burns.unshift(row);               // newest first
    db.burns = db.burns.slice(0, 5000);  // keep last 5k to cap file size
    write(db);
    return row;
}

export function clearAll() {
    write({ burns: [] });
}

export function getRecent(n: number): BurnRow[] {
    const db = read();
    return db.burns.slice(0, n);
}

export function getStats(totalSupply: number) {
    const db = read();
    const totalBurned = db.burns.reduce((s, r) => s + (r.amountHuman || 0), 0);
    const remainingSupply = Math.max(0, totalSupply - totalBurned);
    const percentBurned =
        totalSupply > 0 ? (totalBurned / totalSupply) * 100 : 0;

    return {
        totalBurned,
        percentBurned,
        remainingSupply,
        count: db.burns.length,
        lastTx: db.burns[0] || null,
    };
}
