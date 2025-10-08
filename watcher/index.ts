// watcher/index.ts
// Run locally with: npx ts-node --transpile-only watcher/index.ts
import "dotenv/config";
import { ethers } from "ethers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* ----------------------- ENV + VALIDATION ----------------------- */
const RPC_WSS = must("RPC_WSS");
const RPC_HTTP = must("RPC_HTTP");
const TOKEN_ADDRESS = must("TOKEN_ADDRESS");
const REWARD_RECIPIENT = must("REWARD_RECIPIENT").toLowerCase();
const DEAD_ADDRESS = must("DEAD_ADDRESS");
const PRIVATE_KEY = must("PRIVATE_KEY");

const TOKEN_DECIMALS = num("TOKEN_DECIMALS", 18);
const MIN_TOKEN_TO_ACT = num("MIN_TOKEN_TO_ACT", 0); // human units
const DELAY_MS_AFTER_EVENT = num("DELAY_MS_AFTER_EVENT", 3000);
const STARTUP_SWEEP = process.env.STARTUP_SWEEP === "1";

assertAddress("REWARD_RECIPIENT", REWARD_RECIPIENT);
assertAddress("DEAD_ADDRESS", DEAD_ADDRESS);
assertAddress("TOKEN_ADDRESS", TOKEN_ADDRESS); // placeholder will fail (as intended)

/* -------------------- PROVIDERS + CONTRACTS --------------------- */
const wsProvider = new ethers.WebSocketProvider(RPC_WSS);
const httpProvider = new ethers.JsonRpcProvider(RPC_HTTP);
const signer = new ethers.Wallet(PRIVATE_KEY, httpProvider);

const ERC20_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "function transfer(address to, uint256 value) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
];
const tokenRead = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, wsProvider);
const tokenWrite = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, signer);

/* --------------------------- HELPERS ---------------------------- */
function must(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}
function num(name: string, def: number): number {
  const v = process.env[name];
  if (v == null || v === "") return def;
  const n = Number(v);
  if (Number.isNaN(n)) throw new Error(`Env ${name} must be a number`);
  return n;
}
function assertAddress(label: string, addr: string) {
  if (!ethers.isAddress(addr)) {
    console.error(`${label} is not a valid 0x address: ${addr}`);
    console.error(
      label === "TOKEN_ADDRESS"
        ? "→ Set TOKEN_ADDRESS to your real token address (0x...) before running in prod."
        : "",
    );
    process.exit(1);
  }
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const toHuman = (raw: bigint) => Number(ethers.formatUnits(raw, TOKEN_DECIMALS));

/* ---------------------------- CORE ------------------------------ */
async function burnAmount(value: bigint) {
  const human = toHuman(value); // <-- NUMBER (important for Prisma type)

  if (human < MIN_TOKEN_TO_ACT) {
    console.log(`Skip (below threshold). amount=${human} min=${MIN_TOKEN_TO_ACT}`);
    return;
  }

  // small debounce to avoid racing multiple txs if many transfers batch in a block
  await sleep(DELAY_MS_AFTER_EVENT);

  // send tokens to dead address
  const tx = await tokenWrite.transfer(DEAD_ADDRESS, value);
  console.log(`🔥 Burn submitted: ${human} tokens → ${DEAD_ADDRESS} | tx=${tx.hash}`);
  await tx.wait();

  // persist to DB (amountHuman is a number in your Prisma model)
  await prisma.burn.create({
    data: {
      txHash: tx.hash,
      amountHuman: human, // ✅ number, fixes "string is not assignable to number"
    },
  });

  console.log(`✅ Logged burn ${human} tokens`);
}

async function main() {
  console.log("Watcher online ✅");
  console.log(`Token: ${TOKEN_ADDRESS}`);
  console.log(`Listening for transfers to: ${REWARD_RECIPIENT}`);

  // sanity: check on-chain decimals vs env
  try {
    const chainDecimals: number = await tokenWrite.decimals();
    if (chainDecimals !== TOKEN_DECIMALS) {
      console.warn(
        `NOTE: TOKEN_DECIMALS=${TOKEN_DECIMALS} but contract decimals=${chainDecimals}. Update .env if needed.`,
      );
    }
  } catch (e) {
    console.warn("Decimals() call failed (token not live yet?) — continuing.");
  }

  // subscribe to Transfer events and act only when `to == REWARD_RECIPIENT`
  tokenRead.on(
    "Transfer",
    async (from: string, to: string, value: bigint) => {
      try {
        if (to.toLowerCase() !== REWARD_RECIPIENT) return;
        const human = toHuman(value);
        console.log(`🪙 Incoming: ${human} tokens from ${from} → ${REWARD_RECIPIENT}`);
        await burnAmount(value);
      } catch (err) {
        console.error("Handler error:", err);
      }
    },
  );

  // optional: sweep existing balance on startup
  if (STARTUP_SWEEP) {
    try {
      const bal = (await tokenWrite.balanceOf(REWARD_RECIPIENT)) as bigint;
      if (bal > 0n) {
        const human = toHuman(bal);
        console.log(`Startup sweep: found ${human} tokens`);
        await burnAmount(bal);
      }
    } catch (e) {
      console.warn("Startup sweep failed (ok before launch):", e);
    }
  }
}

main().catch((e) => {
  console.error("Fatal watcher error:", e);
  process.exit(1);
});
