"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
  `0x${[...crypto.getRandomValues(new Uint8Array(32))].map((b) => b.toString(16).padStart(2, "0")).join("")}`;

/* ─────────────────────────────────────────────
   Degen Boot Stream
───────────────────────────────────────────── */
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
  const a = `0x${[...crypto.getRandomValues(new Uint8Array(20))].map((b) => b.toString(16).padStart(2, "0")).join("")}`;
  const b = `0x${[...crypto.getRandomValues(new Uint8Array(20))].map((b) => b.toString(16).padStart(2, "0")).join("")}`;
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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLines(Array.from({ length: 24 }, makeLine));
    intervalRef.current = setInterval(() => {
      setLines((prev) => {
        const next = [...prev, makeLine()];
        if (next.length > 140) next.splice(0, next.length - 140);
        return next;
      });
    }, speed);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [speed]);

  useEffect(() => {
    const el = viewportRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  // click-to-copy hashes (delegated)
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
            initial={{ opacity: 0, filter: "brightness(1.6) blur(1px)" }}
            animate={{ opacity: 1, filter: "brightness(1) blur(0px)" }}
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

/* ─────────────────────────────────────────────
   System Breach
───────────────────────────────────────────── */
type Attempt = { keyId: string; id: string; text: string; status: "fail" | "pass" };
const PROTOCOLS = ["BURN-X1", "ROGUE-A3", "PURGE-Z9", "BURN-K5", "ROGUE-D7", "PURGE-Y2", "BURN-M9", "ROGUE-B4", "PURGE-X6"];

function SystemBreach({
  durationMs,
  onReady,
}: {
  durationMs: number;
  onReady: () => void;
}) {
  const [pct, setPct] = useState(0);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [unlocked, setUnlocked] = useState(false);
  const [statusMessage, setStatusMessage] = useState("DEADLOOP ROGUE BURN ▸ INITIATING");
  const [shake, setShake] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastPctMilestone = useRef(0);

  const script = useMemo(() => {
    const fails = randi(7, 9);
    const slots = fails + 1;
    const step = durationMs / slots;
    const list: { t: number; kind: "fail" | "pass" }[] = [];
    for (let i = 0; i < fails; i++) list.push({ t: Math.round((i + 1) * step * 0.9), kind: "fail" });
    list.push({ t: durationMs - 600, kind: "pass" });
    return list.sort((a, b) => a.t - b.t);
  }, [durationMs]);

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(1, elapsed / durationMs);

      const pRounded = Math.floor(p * 20) / 20; // 5% milestones
      if (pRounded > lastPctMilestone.current) {
        setPct(pRounded);
        lastPctMilestone.current = pRounded;
      }

      const shouldCount = script.filter((s) => s.t <= elapsed).length;
      setAttempts((prev) => {
        if (prev.length >= shouldCount) return prev;
        const next = [...prev];
        for (let i = prev.length; i < shouldCount; i++) {
          const s = script[i];
          const protocol = pick(PROTOCOLS);
          const keyId = tx();
          if (s.kind === "fail") {
            const messages = [
              "TOKEN PURGE ATTEMPT FAILED",
              "BURN LOOP ACCESS DENIED",
              "PROTOCOL BREACH REJECTED",
              "RECURSIVE BURN BLOCKED",
            ];
            const message = pick(messages);
            next.push({
              keyId,
              id: protocol,
              status: "fail",
              text: `BREACH ▸ PROTOCOL ${protocol} ▸ STATUS: ${message}`,
            });
            setStatusMessage(`DEADLOOP ROGUE BURN ▸ ${message} ${protocol}`);
            setShake(true);
            setTimeout(() => setShake(false), 360);
          } else {
            next.push({
              keyId,
              id: protocol,
              status: "pass",
              text: `BREACH ▸ PROTOCOL ${protocol} ▸ STATUS: BURN PROTOCOL ENGAGED`,
            });
            setStatusMessage(`DEADLOOP ROGUE BURN ▸ PROTOCOL ENGAGED`);
          }
        }
        return next.slice(-5);
      });

      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setUnlocked(true);
        setTimeout(() => onReady(), 240);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [durationMs, onReady, script]);

  return (
    <div className={`entryGate ${shake ? "shake" : ""}`} aria-live="polite">
      <div className="label">{unlocked ? "DEADLOOP ROGUE BURN ▸ PROTOCOL ENGAGED" : statusMessage}</div>
      <div className="entrybar" aria-hidden="true">
        <div className="fill" style={{ ["--pct" as any]: pct }} />
      </div>
      <div className="authlist">
        {attempts.map((at) => (
          <div key={at.keyId} className="authline">
            <span className="auth-tag">[BREACH]</span>
            <span className={`auth-msg ${at.status === "fail" ? "auth-fail" : "auth-pass"}`}>{at.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Tiny UI helpers
───────────────────────────────────────────── */
function FlipText({ value, className }: { value: string; className?: string }) {
  return (
    <motion.span
      key={value}
      initial={{ rotateX: -90, opacity: 0, y: -6 }}
      animate={{ rotateX: 0, opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className={className}
      style={{ display: "inline-block", transformOrigin: "bottom" }}
    >
      {value}
    </motion.span>
  );
}

function Embers({ n = 4 }: { n?: number }) {
  const seeds = useMemo(() => Array.from({ length: n }, () => Math.random()), [n]);
  return (
    <>
      {seeds.map((s, i) => {
        const x = (s * 100).toFixed(2);
        const delay = s * 0.15;
        const dur = 0.8 + s * 0.4;
        return (
          <motion.span
            key={i}
            className="ember"
            initial={{ opacity: 0, y: 8, x: `${x}%`, scale: 0.6 }}
            animate={{ opacity: [0, 1, 0], y: -20 - s * 20, scale: 1 }}
            transition={{ duration: dur, delay }}
          />
        );
      })}
    </>
  );
}

/* ───────────────────────────────────────────── */

export default function Page() {
  const [gate, setGate] = useState(true);
  const [ready, setReady] = useState(false);
  const [headline, setHeadline] = useState("");

  const [burnPct, setBurnPct] = useState(0);
  const [supply, setSupply] = useState(Number(process.env.NEXT_PUBLIC_TOTAL_SUPPLY || "1000000000"));
  const [bbAmt, setBbAmt] = useState(0);
  const [pulse, setPulse] = useState(false);

  // ticker
  const trackRef = useRef<HTMLDivElement | null>(null);
  const blockRef = useRef<HTMLDivElement | null>(null);

  // keyboard: enter
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (gate && ready && e.key === "Enter") enter();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gate, ready]);

  const enter = useCallback(() => {
    if (!gate || !ready) return;
    setGate(false);
    const slogan = "INFINITE RECURSION. INFINITE BURN.";
    let k = 0;
    const t = setInterval(() => {
      setHeadline(slogan.slice(0, k));
      k++;
      if (k > slogan.length) clearInterval(t);
    }, 22);
  }, [gate, ready]);

  const onReady = useCallback(() => {
    setReady(true);
  }, []);

  /* ticker sizing */
  useEffect(() => {
    const track = trackRef.current,
      block = blockRef.current;
    if (!track || !block) return;
    const update = () => {
      const w = block.scrollWidth;
      track.style.setProperty("--marquee-width", `${w}px`);
      const secs = Math.max(10, Math.min(60, Math.round((w / 120) * 10) / 10));
      track.style.setProperty("--marquee-time", `${secs}s`);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  /* data (after gate) */
  const shouldPoll = !gate;
  const { data: stats } = useSWR(shouldPoll ? "/api/burns/stats" : null, fetcher, {
    refreshInterval: 1500,
    revalidateOnFocus: false,
  });
  const { data: recent } = useSWR(shouldPoll ? "/api/burns/recent" : null, fetcher, {
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

  const recentList: Array<{ txHash: string; amountHuman: number | string; timestamp: number | string | Date }> =
    Array.isArray(recent) ? recent : recent?.items || [];

  return (
    <main className="scene">
      {/* CRT overlay sits beneath content */}
      <div className="crt-overlay" aria-hidden />

      {/* Backgrounds (beneath halo) */}
      <div className="bgGrid" />
      <div className="stars" />

      {/* Burning red halo (above backgrounds, below content) */}
      <div className="burn-halo" aria-hidden />

      <AnimatePresence mode="wait">
        {gate ? (
          <motion.section
            key="gate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className={`terminal-box ${!ready ? "locked" : ""}`}
            onClick={() => ready && enter()}
            onTouchStart={() => ready && enter()}
            role="button"
            tabIndex={0}
            aria-label={ready ? "Enter" : "System breach in progress"}
          >
            <span className="corn c-tl" />
            <span className="corn c-tr" />
            <span className="corn c-bl" />
            <span className="corn c-br" />
            <div className="frame-body">
              {/* Header */}
              <div className="flex items-center gap-4">
                <img src="/deadloop.png" alt="Deadloop Logo" style={{ width: 150, height: 150, opacity: 0.95 }} />
                <div className="flex-1">
                  <h1
                    className="text-2xl sm:text-3xl font-bold uppercase tracking-[0.25em] terminal glitch"
                    data-text="DEADLOOP // TERMINAL"
                  >
                    DEADLOOP // TERMINAL
                  </h1>
                  <div className="headbar" />
                </div>
              </div>

              {/* Logs */}
              <div className="mt-3">
                <DegenBootStream speed={46} />
              </div>

              {/* 10s System Breach */}
              <SystemBreach durationMs={10000} onReady={onReady} />

              {/* Press enter appears only after unlock */}
              {ready && <div className="pressEnter terminal">PRESS ENTER ▾</div>}
            </div>
          </motion.section>
        ) : (
          <>
            {/* ───────── DASHBOARD ───────── */}
            <motion.section
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="terminal-box"
            >
              <span className="corn c-tl" />
              <span className="corn c-tr" />
              <span className="corn c-bl" />
              <span className="corn c-br" />

              <div className="frame-body">
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <img src="/deadloop.png" alt="Deadloop Logo" style={{ width: 150, height: 150, opacity: 0.95 }} />
                  <h2
                    className="text-2xl font-extrabold tracking-[0.18em] terminal glitch softglow"
                    data-text="DEADLOOP PROTOCOL"
                  >
                    DEADLOOP PROTOCOL
                  </h2>
                </div>

                {/* Deadloop code blurb */}
                <div className="mb-4">
                  <pre className="terminal neoncode neoncode-lg" aria-label="What is Deadloop Protocol">{`WHAT IS DEADLOOP?
// The first automated native-fee burn protocol launched on Clanker

OVERVIEW:
- Each eligible transaction includes a native-token fee.
- Native fees are automatically routed to burn, reducing supply on-chain.

FLOW:
activity => native_fee => burn() => total_supply--

RUNTIME:
while (true) {
  if (tx_detected) burn(native_fee);  // autonomous, non-custodial
}

PROPERTIES:
[DEF] continuous       -> native tokens are removed from supply
[PRG] programmatic     -> burns are on-chain and verifiable
[RFX] reflexive        -> higher usage => higher burn => lower supply

SUMMARY:
tx_in => supply_out => price_up
`}</pre>
                </div>

                <div className="terminal mb-4 text-sm headline softglow">
                  {headline}
                  <span className="cursor">█</span>
                </div>

                {/* Dashboard grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Left: Dial */}
                  <div className="section md:col-span-1 flex justify-center">
                    <div className={`burn-dial ${pulse ? "pulse" : ""}`} style={{ ["--size" as any]: "240px" }}>
                      <div className="dial-ring" style={{ ["--pct" as any]: Math.min(100, Math.max(0, burnPct)) }} />
                      <div className="dial-chevrons" />
                      <div
                        className="dial-marker"
                        style={{ ["--angle" as any]: `${Math.min(100, Math.max(0, burnPct)) * 3.6}deg` }}
                      />
                      <div className="dial-hit" />
                      <div className="dial-readout">
                        <div className="text-center">
                          <FlipText value={`${burnPct.toFixed(6)}%`} className="pct terminal" />
                          <div className="label terminal">SUPPLY AUTO BURNED</div>
                        </div>
                      </div>
                      <AnimatePresence>{pulse && <Embers n={4} />}</AnimatePresence>
                    </div>
                  </div>

                  {/* Middle */}
                  <div className="section md:col-span-1 text-sm">
                    <div>
                      Status: <span className="text-[#ffee00]">ONLINE</span>
                    </div>
                    <div>
                      Burn pulses: <FlipText value={bbAmt.toLocaleString()} className="terminal" />
                    </div>
                    <div className="mt-2">WHY DEADLOOP PRINTS GREEN</div>
                    <ul className="list-disc ml-4 opacity-90">
                      <li>Every tx → auto fee claim</li>
                      <li>Claimed fees → permanent burn</li>
                      <li>Supply ↓, Floor ↑</li>
                    </ul>
                  </div>

                  {/* Right */}
                  <div className="section md:col-span-1 text-sm">
                    <div className="text-[#22ff00] mb-1 softglow">REMAINING TOKEN SUPPLY</div>
                    <FlipText value={supply.toLocaleString()} className="text-2xl terminal" />
                    <div>Deflation velocity: HIGH</div>
                    <div>
                      Mode: <span className="text-accent">BURN</span>
                    </div>
                  </div>

                  {/* Full width: recent burns */}
                  <div className="section md:col-span-3 text-xs overflow-hidden">
                    <div className="text-[#22ff00] mb-1 softglow">LIVE TOKEN BURNS</div>
                    {/* scrollbar removed: keep static height */}
                    <div className="h-[180px] pr-2">
                      {!recentList || recentList.length === 0 ? (
                        <div className="text-[#aaffb3]/70">awaiting claims…</div>
                      ) : (
                        recentList.slice(0, 10).map((t, i) => (
                          <div key={`${t.txHash}-${i}`} className="flex justify-between gap-3">
                            <span className="text-[#b8ffd0] truncate">{t.txHash}</span>
                            <span className="text-[#aaffb3] whitespace-nowrap">
                              CLAIMED {t.amountHuman} — <span className="text-[#ffee00]">BURNED {t.amountHuman}</span>
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Links on one line */}
                  <div className="section md:col-span-3 text-center">
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
                      <span className="terminal">
                        <a
                          href="https://x.com/DeadloopLabs"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#22ff00] no-underline hover:text-[#ffee00]"
                          aria-label="Visit Deadloop Labs on X"
                        >
                          X: @DeadloopLabs
                        </a>
                      </span>
                      <span className="terminal text-[#ff0044]">Clanker: TBC</span>
                      <span className="terminal">
                        <a
                          href="https://farcaster.xyz/deadloopprotocol"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#22ff00] no-underline hover:text-[#ffee00]"
                          aria-label="Visit Deadloop Protocol on Farcaster"
                        >
                          Farcaster: deadloopprotocol
                        </a>
                      </span>
                      <span className="terminal text-[#ff0044]">Dex: TBC</span>
                    </span>
                  </div>

                  {/* Tagline */}
                  <div className="md:col-span-4 text-center terminal mt-1 glow-text">
                    Every fee transaction burns supply. Floor ascends. Supply collapses. You ascend.
                  </div>

                  {/* Ticker */}
                  <div className="ticker">
                    <div className="t-viewport">
                      <div className="t-track shimmer" ref={trackRef}>
                        <div ref={blockRef} style={{ display: "inline-flex", gap: 40 }}>
                          <span className="t-item">
                            DEADLOOP ONLINE ▸ RECURSIVE BURN ▸ SUPPLY COLLAPSE ▸ VOLATILITY: MAX ▸ VALUE: INCREASING ▸
                          </span>
                          <span className="t-item">
                            DEADLOOP ONLINE ▸ RECURSIVE BURN ▸ SUPPLY COLLAPSE ▸ VOLATILITY: MAX ▸ VALUE: INCREASING ▸
                          </span>
                          <span className="t-item">
                            DEADLOOP ONLINE ▸ RECURSIVE BURN ▸ SUPPLY COLLAPSE ▸ VOLATILITY: MAX ▸ VALUE: INCREASING ▸
                          </span>
                        </div>
                        <div aria-hidden="true" style={{ display: "inline-flex", gap: 40 }}>
                          <span className="t-item">
                            DEADLOOP ONLINE ▸ RECURSIVE BURN ▸ SUPPLY COLLAPSE ▸ VOLATILITY: MAX ▸ VALUE: INCREASING ▸
                          </span>
                          <span className="t-item">
                            DEADLOOP ONLINE ▸ RECURSIVE BURN ▸ SUPPLY COLLAPSE ▸ VOLATILITY: MAX ▸ VALUE: INCREASING ▸
                          </span>
                          <span className="t-item">
                            DEADLOOP ONLINE ▸ RECURSIVE BURN ▸ SUPPLY COLLAPSE ▸ VOLATILITY: MAX ▸ VALUE: INCREASING ▸
                          </span>
                        </div>
                        <div className="ticker-sheen" aria-hidden />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          </>
        )}
      </AnimatePresence>

      {/* Global CSS for the upgrades */}
      <style jsx global>{`
  /* Allow scrolling but hide scrollbars */
  html, body { height: 100%; overflow: auto; }
  body {
    -ms-overflow-style: none;      /* IE/Edge */
    scrollbar-width: none;         /* Firefox */
  }
  body::-webkit-scrollbar { display: none; }  /* Chrome/Safari */

  .scene {
    position: relative;
    z-index: 3;
    min-height: 100vh;
    overflow: visible;             /* don't clip content */
  }

  /* CRT & vignette */
  .crt-overlay {
    position: fixed;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(120% 80% at 50% 20%, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0.25) 70%, rgba(0, 0, 0, 0.55) 100%),
      repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.02) 0, rgba(255, 255, 255, 0.02) 1px, transparent 2px, transparent 4px);
    mix-blend-mode: overlay;
    z-index: 0;
  }

  /* Background layers (below halo) */
  .bgGrid, .stars { position: fixed; z-index: 1; }

  /* ALWAYS-ON burning halo (above backgrounds) */
  .burn-halo {
    position: fixed;
    inset: -12vh;
    pointer-events: none;
    z-index: 2;
    opacity: 0.42;
    background:
      radial-gradient(60% 40% at 50% 88%,
        rgba(255, 60, 60, 0.00) 0%,
        rgba(255, 48, 48, 0.10) 32%,
        rgba(255, 30, 30, 0.18) 55%,
        rgba(255, 0, 0, 0.00) 72%),
      radial-gradient(70% 55% at 50% 92%,
        rgba(255, 140, 90, 0.08), transparent 70%);
    mix-blend-mode: screen;
    filter: blur(14px);
    transform: translateZ(0);
    animation: burnPulse 3.6s ease-in-out infinite, burnFlicker 780ms steps(2, end) infinite;
  }
  @keyframes burnPulse {
    0%, 100% { opacity: 0.32; filter: blur(12px) hue-rotate(-6deg); }
    50%      { opacity: 0.58; filter: blur(20px) hue-rotate(-14deg); }
  }
  @keyframes burnFlicker {
    0%   { filter: brightness(1) drop-shadow(0 0 0 rgba(255,80,80,0)); }
    50%  { filter: brightness(1.06) drop-shadow(0 0 10px rgba(255,80,80,0.10)); }
    100% { filter: brightness(1) drop-shadow(0 0 0 rgba(255,80,80,0)); }
  }

  /* Border shimmer */
  .terminal-box, .section { position: relative; overflow: hidden; }
  .terminal-box::before, .section::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(120deg, transparent, rgba(34, 255, 0, 0.08), transparent);
    background-size: 200% 200%;
    animation: borderShimmer 14s linear infinite;
    mix-blend-mode: screen;
  }
  @keyframes borderShimmer {
    0% { background-position: 0% 0%; }
    50% { background-position: 100% 100%; }
    100% { background-position: 0% 0%; }
  }

  .softglow { text-shadow: 0 0 6px rgba(34, 255, 0, 0.6); }

  /* Log coloring */
  .logline.burn .logtag, .logburn { color: #9cff8d; filter: drop-shadow(0 0 4px rgba(156,255,141,0.4)); }
  .logline.warn .logtag, .logwarn { color: #ffcc66; }
  .logline.tx .logtag, .logok { color: #b5ffd2; }

  .copytoast {
    position: absolute;
    right: 8px;
    top: 8px;
    background: rgba(5, 20, 5, 0.7);
    border: 1px solid rgba(34, 255, 0, 0.35);
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
  }
  .loghash.copy { cursor: pointer; text-decoration: underline dotted; }

  /* Dial embers */
  .burn-dial { position: relative; }
  .ember {
    position: absolute;
    bottom: 24%;
    left: 0;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: var(--ember, #22ff88);
    box-shadow: 0 0 8px rgba(34, 255, 136, 0.8);
    pointer-events: none;
  }

  /* Ticker: seamless loop */
  .t-viewport { overflow: hidden; }
  .t-track {
    display: inline-flex;
    will-change: transform;
    animation: marquee var(--marquee-time, 24s) linear infinite;
  }
  @keyframes marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(calc(-1 * var(--marquee-width, 1000px))); }
  }

  .ticker-sheen {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
    transform: translateX(-100%);
    animation: sheen 4.2s linear infinite;
  }
  @keyframes sheen {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .shimmer { mask-image: linear-gradient(180deg, transparent 0%, #000 12%, #000 88%, transparent 100%); }

  /* Accent helpers */
  .scene .text-accent { color: #ff0044; }
  .glow-text { color: #ffd0d6; text-shadow: 0 0 6px #ffd0d6, 0 0 12px #ff6688, 0 0 24px #ff2255; }

  /* Size modifiers for the code panel */
  .neoncode-lg { font-size: 16px; line-height: 1.45; }
  .neoncode-xl { font-size: 18px; line-height: 1.5; }
`}</style>
    </main>
  );
}
