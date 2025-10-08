// watcher/index.ts
import "dotenv/config";
import { ethers } from "ethers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ---- ENV ----
const RPC_WSS = must("RPC_WSS");
const RPC_HTTP = must("RPC_HTTP");
const TOKEN_ADDRESS = must("TOKEN_ADDRESS");
const REWARD_RECIPIENT = must("REWARD_RECIPIENT").toLowerCase();
const DEAD_ADDRESS = must("DEAD_ADDRESS");
const PRIVATE_KEY = must("PRIVATE_KEY");
const TOKEN_DECIMALS = Number(process.env.TOKEN_DECIMALS ?? "18");
const MIN_TOKEN_TO_ACT = Number(process.env.MIN_TOKEN_TO_ACT ?? "0"); // human units
const DELAY_MS_AFTER_EVENT = Number(process.env.DELAY_MS_AFTER_EVENT ?? "3000");
const STARTUP_SWEEP = process.env.STARTUP_SWEEP === "1"; // default off

// Validate addresses early to avoid ENS lookups
if (!ethers.isAddress(REWARD_RECIPIENT)) fail(`REWARD_RECIPIENT is not a valid address: ${REWARD_RECIPIENT}`);
if (!ethers.isAddress(DEAD_ADDRESS)) fail(`DEAD_ADDRESS is not a valid address: ${DEAD_ADDRESS}`);
if (!ethers.isAddress(TOKEN_ADDRESS)) fail(
  `TOKEN_ADDRESS is not a valid address: ${TOKEN_ADDRESS}\n` +
  `→ Set TOKEN_ADDRESS to your real token (0x...) after launch.`
);

// ---- Providers / Contracts ----
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

// ---- Helpers ----
function must(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}
function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const toHuman = (raw: bigint) => Number(ethers.formatUnits(raw, TOKEN_DECIMALS));

async function burnAmount(value: bigint) {
  const human = toHuman(value); // <-- number

  if (human < MIN_TOKEN_TO_ACT) {
    console.log(`Skip (below threshold). Amount=${human} MIN=${MIN_TOKEN_TO_ACT}`);
    return;
  }

  await sleep(DELAY_MS_AFTER_EVENT);

  const tx = await tokenWrite.transfer(DEAD_ADDRESS, value);
  console.log(`🔥 Burn submitted: ${human} tokens → ${DEAD_ADDRESS} | tx=${tx.hash}`);
  await tx.wait();

  // IMPORTANT: amountHuman expects a number; send `human` (not string)
  await prisma.burn.create({
    data: {
      txHash: tx.hash,
      amountHuman: human, // <-- number, fixes the build error
    },
  });

  console.log(`✅ Logged burn ${human} tokens`);
}

async function main() {
  console.log("Watcher online ✅");
  console.log(`Token: ${TOKEN_ADDRESS}`);
  console.log(`Listening for transfers to: ${REWARD_RECIPIENT}`);

  try {
    const chainDecimals = await tokenWrite.decimals().catch(() => TOKEN_DECIMALS);
    if (chainDecimals !== TOKEN_DECIMALS) {
      console.warn(
        `NOTE: TOKEN_DECIMALS=${TOKEN_DECIMALS} but contract decimals=${chainDecimals}. ` +
        `Update .env if needed.`,
      );
    }
  } catch (e) {
    console.warn("Decimals check skipped:", e);
  }

  tokenRead.on("Transfer", async (from: string, to: string, value: bigint) => {
    try {
      if (to.toLowerCase() !== REWARD_RECIPIENT) return;
      const human = toHuman(value);
      console.log(`🪙 Transfer in → ${REWARD_RECIPIENT}: ${human} tokens from ${from}`);
      await burnAmount(value);
    } catch (e) {
      console.error("Handler error:", e);
    }
  });

  if (STARTUP_SWEEP) {
    try {
      const bal = (await tokenWrite.balanceOf(REWARD_RECIPIENT)) as bigint;
      if (bal > 0n) {
        const human = toHuman(bal);
        console.log(`Startup sweep: balance ${human} tokens detected`);
        await burnAmount(bal);
      }
    } catch (e) {
      console.warn("Startup balance check failed (ok before launch):", e);
    }
  }
}

main().catch((e) => {
  console.error("Fatal watcher error:", e);
  process.exit(1);
});
