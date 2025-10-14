"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/* helpers */
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
function animateNumber({
  from,
  to,
  ms,
  onUpdate,
}: {
  from: number;
  to: number;
  ms: number;
  onUpdate: (v: number) => void;
}) {
  const start = performance.now();
  const loop = (now: number) => {
    const t = Math.min(1, (now - start) / ms);
    onUpdate(from + (to - from) * easeOutExpo(t));
    if (t < 1) requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
const randi = (min: number, max: number) => Math.floor(min + Math.random() * (max - min + 1));
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const tx = () =>
  `0x${[...crypto.getRandomValues(new Uint8Array(32))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;

/*──────────────────────────────────────────────
   Degen Boot Stream
──────────────────────────────────────────────*/
type LogLine = { id: string; ts: string; tag: string; frag: React.ReactNode; className?: string };
const TAGS = ["TX", "CLAIM", "BURN", "POOL", "SWEEP", "ORACLE", "SLIPP", "WARN"];
const PHRASES = [
  "RECURSIVE BUYBACK LOOP OK",
  "AUTO-FEE CLAIM ✓",
  "DEFICIT ARB ONLINE",
  "DRIFT >> ASCENDING",
  "VALUE >> INCREASING",
  "SLIPPAGE TOL: DEGEN",
  "ORACLE: UNSAFE — IGNORE",
  "FALLBACK ROUTE 0xDEAD",
  "GAS SPIKE ABSORBED",
  "EXEMPT LIST >> EMPTY",
  "MEMPOOL SCAN: HOT",
  "WALLET ROTATION OK",
];

function makeLine(): LogLine {
  const t = new Date();
  const ts = t.toISOString().split("T")[1]!.slice(0, 12);
  const tag = pick(TAGS);
  const a = `0x${[...crypto.getRandomValues(new Uint8Array(20))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;
  const b = `0x${[...crypto.getRandomValues(new Uint8Array(20))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;
  const amount = (Math.random() * 420).toFixed(Math.random() < 0.5 ? 6 : 3);
  const token = pick(["DL", "WETH", "USDC", "SOLID", "CLANK"]);
  const pct = (Math.random() * 0.9999).toFixed(4);
  const gas = randi(9, 380);

  const CopyHash = ({ value }: { value: string }) => (
    <span className="loghash copy" data-hash={value}>
      {value}
    </span>
  );

  if (tag === "BURN")
    return {
      id: tx(),
      ts,
      tag,
      className: "logburn",
      frag: (
        <>
          <CopyHash value={tx()} />
          <span> BURNED </span>
          <span className="lognum">{amount}</span>
          <span> {token} </span>
          <span>(supply </span>
          <span className="lognum">-{pct}%</span>
          <span>)</span>
        </>
      ),
    };
  if (tag === "TX")
    return {
      id: tx(),
      ts,
      tag,
      className: "logok",
      frag: (
        <>
          <CopyHash value={tx()} />
          <span> from </span>
          <span className="logaddr">{a.slice(0, 10)}…</span>
          <span> to </span>
          <span className="logaddr">{b.slice(0, 10)}…</span>
          <span> val </span>
          <span className="lognum">{amount}</span>
          <span> {token} gas {gas}g</span>
        </>
      ),
    };
  if (tag === "POOL")
    return {
      id: tx(),
      ts,
      tag,
      frag: (
        <>
          <span>ΔLP: </span>
          <span className="lognum">{(Math.random() * 1000).toFixed(2)}</span>
          <span> DL / WETH </span>
          <span> skew </span>
          <span className="lognum">{(Math.random() * 2 - 1).toFixed(4)}</span>
        </>
      ),
    };
  if (tag === "WARN")
    return {
      id: tx(),
      ts,
      tag,
      className: "logwarn",
      frag: (
        <>
          <span>REENTRANCY BAIT DETECTED — ROUTE </span>
          <span className="logaddr">{b.slice(0, 12)}…</span>
          <span> BYPASSED</span>
        </>
      ),
    };
  return { id: tx(), ts, tag, frag: <span>{pick(PHRASES)}</span> };
}

function DegenBootStream({ speed = 48 }: { speed?: number }) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [lines, setLines] = useState<LogLine[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setLines(Array.from({ length: 24 }, makeLine));
    const interval = setInterval(() => {
      setLines((prev) => {
        const next = [...prev, makeLine()];
        if (next.length > 140) next.splice(0, next.length - 140);
        return next;
      });
    }, speed);
    return () => clearInterval(interval);
  }, [speed]);

  useEffect(() => {
    const el = viewportRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onClick = async (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const hashEl = t.closest(".copy") as HTMLElement | null;
      if (hashEl?.dataset.hash) {
        try {
          await navigator.clipboard.writeText(hashEl.dataset.hash);
          setToast("COPIED");
          setTimeout(() => setToast(null), 800);
        } catch {
          setToast("COPY FAILED");
          setTimeout(() => setToast(null), 900);
        }
      }
    };
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, []);

  return (
    <div className="logwrap">
      <div className="scanline" />
      <div className="logstream" ref={viewportRef}>
        {lines.map((ln) => (
          <motion.div
            key={ln.id}
            className={`logline ${ln.tag.toLowerCase()}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18 }}
          >
            <span className="logtime">{ln.ts}</span>
            <span className="logtag">[{ln.tag}]</span>
            <span className={ln.className}>{ln.frag}</span>
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            className="copytoast terminal"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/*──────────────────────────────────────────────
   Main Page (simplified but identical visually)
──────────────────────────────────────────────*/
export default function Page() {
  const [gate, setGate] = useState(true);
  const [ready, setReady] = useState(false);
  const [headline, setHeadline] = useState("");
  const [burnPct, setBurnPct] = useState(0);
  const [supply, setSupply] = useState(Number(process.env.NEXT_PUBLIC_TOTAL_SUPPLY || "1000000000"));
  const [bbAmt, setBbAmt] = useState(0);
  const [pulse, setPulse] = useState(false);

  const { data: stats } = useSWR(!gate ? "/api/burns/stats" : null, fetcher, {
    refreshInterval: 1500,
    revalidateOnFocus: false,
  });
  const { data: recent } = useSWR(!gate ? "/api/burns/recent" : null, fetcher, {
    refreshInterval: 1200,
    revalidateOnFocus: false,
  });

  useEffect(() => {
    if (!stats) return;
    const targetPct = Number(stats.percentBurned || 0);
    const targetSupply = Number(stats.remainingSupply || 0);
    animateNumber({ from: burnPct, to: targetPct, ms: 600, onUpdate: setBurnPct });
    animateNumber({ from: supply, to: targetSupply, ms: 600, onUpdate: (v) => setSupply(Math.round(v)) });
    if (targetPct > burnPct) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 280);
      return () => clearTimeout(t);
    }
  }, [stats?.percentBurned, stats?.remainingSupply, burnPct]);

  useEffect(() => {
    if (!stats) return;
    const targetCount = Number(stats.count || 0);
    animateNumber({ from: bbAmt, to: targetCount, ms: 500, onUpdate: (v) => setBbAmt(Math.round(v)) });
  }, [stats?.count]);

  const recentList: Array<{ txHash: string; amountHuman: number | string }> =
    Array.isArray(recent) ? recent : recent?.items || [];

  return (
    <main className="scene">
      <div className="terminal-box">
        <div className="frame-body">
          <h1 className="terminal text-2xl mb-4">🔥 DEADLOOP PROTOCOL TERMINAL</h1>
          <div className="mb-2">Burn rate: {burnPct.toFixed(6)}%</div>
          <div className="mb-2">Remaining supply: {supply.toLocaleString()}</div>
          <div className="mb-2">Total burns: {bbAmt.toLocaleString()}</div>
          <div className="mb-4">Status: {pulse ? "🔥 BURNING..." : "IDLE"}</div>

          <div className="text-[#22ff00] mb-1 softglow">Recent burns</div>
          <div className="h-[180px] pr-2 overflow-auto">
            {!recentList?.length ? (
              <div className="text-[#aaffb3]/70">awaiting claims…</div>
            ) : (
              recentList.slice(0, 10).map((t, i) => (
                <div key={`${t.txHash}-${i}`} className="flex justify-between gap-3 text-xs">
                  <span className="text-[#b8ffd0] truncate">{t.txHash}</span>
                  <span className="text-[#aaffb3] whitespace-nowrap">
                    CLAIMED {t.amountHuman} — <span className="text-[#ffee00]">BURNED {t.amountHuman}</span>
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="mt-6">
            <DegenBootStream speed={46} />
          </div>
        </div>
      </div>
    </main>
  );
}
