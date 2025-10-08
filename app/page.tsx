"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/* number tween */
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

/* helpers for boot irregular typing */
const rand = (min: number, max: number) => min + Math.random() * (max - min);
const chance = (p: number) => Math.random() < p;

export default function Page() {
  const [gate, setGate] = useState(true);
  const [bootText, setBootText] = useState("");

  const [headline, setHeadline] = useState("");
  const [burnPct, setBurnPct] = useState(0);
  const [supply, setSupply] = useState(
    Number(process.env.NEXT_PUBLIC_TOTAL_SUPPLY || "1000000000")
  );
  const [bbAmt, setBbAmt] = useState(0); // mapped to server stats.count
  const [pulse, setPulse] = useState(false);

  // ticker measurement
  const trackRef = useRef<HTMLDivElement | null>(null);
  const blockRef = useRef<HTMLDivElement | null>(null);

  /* BOOT text */
  const bootLines = useMemo(
    () =>
      [
        "[ BOOTSTRAP: DEADLOOP KERNEL 0xDEAD ]",
        "[ INIT >> RECURSIVE BUYBACK ENGINE ]",
        "[ LINK >> BUYBACK WALLET::0x*** ONLINE ]",
        "[ HEAP >> RECURSIVE ALLOCATION LOOP — STABILITY COMPROMISED ]",
        "[ STACK >> SELF-REFERENTIAL PROTOCOL — OVERFLOW IMMINENT ]",
        "[ MEMORY >> INFINITE RECURSION DETECTED — OVERRIDE ACCEPTED ]",
        "[ STATUS ] Ascension locked. Burn begins.",
      ].join("\n"),
    []
  );

  useEffect(() => {
    let i = 0;
    const timeouts: number[] = [];
    const step = () => {
      setBootText(bootLines.slice(0, i));
      i++;
      if (i > bootLines.length) return;

      const prev = bootLines[i - 1] ?? "";
      const next = bootLines[i] ?? "";

      let delay = rand(28, 95);
      if (prev === "\n") delay += rand(220, 420);
      else if (/[.:;,\]\)]/.test(prev)) delay += rand(90, 170);
      else if (prev === "]") delay += rand(140, 260);
      if (/[A-Z0-9]/.test(next)) delay += rand(6, 22);
      if (chance(0.06)) delay += rand(120, 240);
      if (chance(0.12)) delay *= 0.35;
      if (chance(0.05)) delay *= 0.6;

      const id = window.setTimeout(step, delay);
      timeouts.push(id);
    };
    const startId = window.setTimeout(step, rand(60, 160));
    timeouts.push(startId);
    return () => timeouts.forEach(clearTimeout);
  }, [bootLines]);

  /* TICKER sizing */
  useEffect(() => {
    const track = trackRef.current;
    const block = blockRef.current;
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

  /* === LIVE DATA via SWR === */
  const shouldPoll = !gate; // only after user enters
  const { data: stats } = useSWR(
    shouldPoll ? "/api/burns/stats" : null,
    fetcher,
    { refreshInterval: 1500, revalidateOnFocus: false }
  );
  const { data: recent } = useSWR(
    shouldPoll ? "/api/burns/recent" : null,
    fetcher,
    { refreshInterval: 1200, revalidateOnFocus: false }
  );

  // Animate pct & supply toward server stats
  useEffect(() => {
    if (!stats) return;
    const targetPct = Number(stats.percentBurned || 0);
    const targetSupply = Number(stats.remainingSupply || 0);

    animateNumber({ from: burnPct, to: targetPct, ms: 600, onUpdate: setBurnPct });
    animateNumber({
      from: supply,
      to: targetSupply,
      ms: 600,
      onUpdate: (v) => setSupply(Math.round(v)),
    });

    // pulse when % increases
    if (targetPct > burnPct) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 280);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats?.percentBurned, stats?.remainingSupply]);

  // Animate Buyback pulses (count) toward server value
  useEffect(() => {
    if (!stats) return;
    const targetCount = Number(stats.count || 0);
    animateNumber({
      from: bbAmt,
      to: targetCount,
      ms: 500,
      onUpdate: (v) => setBbAmt(Math.round(v)),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats?.count]);

  const enter = () => {
    if (!gate) return;
    setGate(false);

    const slogan = "INFINITE RECURSION. INFINITE BURN.";
    let k = 0;
    const t = setInterval(() => {
      setHeadline(slogan.slice(0, k));
      k++;
      if (k > slogan.length) clearInterval(t);
    }, 22);
  };

  return (
    <main className="scene">
      <div className="bgGrid" />
      <div className="stars" />

      <AnimatePresence mode="wait">
        {gate ? (
          /* ───────── GATE ───────── */
          <motion.section
            key="gate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="min-h-screen w-full flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="frame max-w-[900px] w-[90vw]"
              onClick={enter}
              onTouchStart={enter}
              role="button"
              tabIndex={0}
              aria-label="Enter"
            >
              <span className="corn c-tl" />
              <span className="corn c-tr" />
              <span className="corn c-bl" />
              <span className="corn c-br" />
              <div className="frame-body">
                <h1
                  className="mb-5 text-3xl sm:text-4xl font-bold uppercase tracking-[0.25em] text-[#e4fff0] terminal glitch"
                  data-text="DEADLOOP // TERMINAL"
                >
                  DEADLOOP // TERMINAL
                </h1>

                {/* moving progress bar */}
                <div className="boot mb-4">
                  <div className="fill" />
                </div>

                <pre className="text-[14px] sm:text-[15px] leading-relaxed text-[#c8ffd0] terminal whitespace-pre-wrap">
                  {bootText}
                  <span className="cursor">█</span>
                </pre>

                <div className="mt-6 text-center text-[#aaffb3]/90 terminal">
                  PRESS ENTER ▾
                </div>
              </div>
            </motion.div>
          </motion.section>
        ) : (
          /* ───────── REVEAL ───────── */
          <motion.section
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="min-h-screen flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.885 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6 }}
              className="frame max-w-[1200px] w-[96vw]"
            >
              <span className="corn c-tl" />
              <span className="corn c-tr" />
              <span className="corn c-bl" />
              <span className="corn c-br" />
              <div className="frame-body pb-12">
                {/* Hero */}
                <div className="mb-6">
                  <h2
                    className="text-4xl sm:text-5xl font-extrabold tracking-[0.18em] text-[#e4fff0] glitch terminal text-center"
                    data-text="DEADLOOP PROTOCOL"
                  >
                    DEADLOOP PROTOCOL
                  </h2>
                  <div className="text-center mt-2 text-[#b8ffd0] terminal">
                    {headline}
                    <span className="cursor">█</span>
                  </div>
                </div>

                {/* Reactor Burn Dial (driven by server stats) */}
                <div className="relative flex items-center justify-center mb-8">
                  <div
                    className={`burn-dial ${pulse ? "pulse" : ""}`}
                    style={{ "--size": "320px" } as React.CSSProperties}
                  >
                    <div
                      className="dial-ring"
                      style={
                        {
                          "--pct": Math.min(100, Math.max(0, burnPct)),
                        } as React.CSSProperties
                      }
                    />
                    <div className="dial-chevrons" />
                    <div
                      className="dial-marker"
                      style={
                        {
                          "--angle": `${Math.min(100, Math.max(0, burnPct)) * 3.6}deg`,
                        } as React.CSSProperties
                      }
                    />
                    <div className="dial-hit" />
                    <div className="dial-readout">
                      <div className="text-center">
                        <div className="pct terminal">{burnPct.toFixed(6)}%</div>
                        <div className="label terminal">SUPPLY AUTO BURNED</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* MEGA METRICS */}
                <div className="grid sm:grid-cols-3 gap-4 text-sm text-[#aaffb3]/90">
                  <div className="border border-[#22ff00]/40 p-4">
                    <div className="text-[#22ff00] mb-1">DEADLOOP CLANKER BURN ENGINE</div>
                    <div>
                      Status: <span className="text-[#ffee00]">ACTIVE</span>
                    </div>
                    <div>
                      Buyback pulses: <span className="terminal">{bbAmt.toLocaleString()}</span>
                    </div>
                    <div>Floor drift: ASCENDING</div>
                  </div>
                  <div className="border border-[#22ff00]/40 p-4">
                    <div className="text-[#22ff00] mb-1">REMAINING TOKEN SUPPLY</div>
                    <div className="text-2xl terminal">{supply.toLocaleString()}</div>
                    <div>Deflation velocity: HIGH</div>
                    <div>
                      Exit: <span className="text-[#ff0044]">UNDEFINED</span>
                    </div>
                  </div>
                  <div className="border border-[#22ff00]/40 p-4">
                    <div className="text-[#22ff00] mb-1">WHY DEADLOOP PRINTS GREEN</div>
                    <div>Every tx → auto fee claim</div>
                    <div>Claimed fees → permanent burn</div>
                    <div>Supply ↓, Floor ↑</div>
                  </div>
                </div>

                {/* LIVE CLAIMS & BURNS */}
                <div className="mt-6 border border-[#22ff00]/40 p-4 text-xs overflow-hidden">
                  <div className="text-[#22ff00] mb-1">LIVE CLAIMS & TOKEN BURNS</div>
                  <div className="h-[220px] overflow-hidden">
                    {!recent || recent.length === 0 ? (
                      <div className="text-[#aaffb3]/70">awaiting claims…</div>
                    ) : (
                      recent.map(
                        (
                          tx: { txHash: string; amountHuman: number; timestamp: number },
                          i: number
                        ) => (
                          <div key={`${tx.txHash}-${i}`} className="flex justify-between">
                            <span className="text-[#b8ffd0]">{tx.txHash}</span>
                            <span className="text-[#aaffb3]">
                              CLAIMED {tx.amountHuman} —{" "}
                              <span className="text-[#ffee00]">BURNED {tx.amountHuman}</span>
                            </span>
                          </div>
                        )
                      )
                    )}
                  </div>
                </div>

                {/* Dealmaker */}
                <div className="mt-6 mb-10 text-center text-[#ccffd9] terminal">
                  Every transaction buys back and burns supply. Floor ascends. Supply collapses. You ascend.
                </div>
              </div>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Ticker */}
      <div className="ticker">
        <div className="t-viewport">
          <div className="t-track" ref={trackRef}>
            {/* block #1 (measured) */}
            <div ref={blockRef} style={{ display: "inline-flex", gap: 40 }}>
              <span className="t-item">
                DEADLOOP ONLINE ▸ RECURSIVE BUYBACK ▸ SUPPLY COLLAPSE ▸ VOLATILITY: MAX ▸ VALUE: INCREASING ▸
              </span>
              <span className="t-item">
                DEADLOOP ONLINE ▸ RECURSIVE BUYBACK ▸ SUPPLY COLLAPSE ▸ VOLATILITY: MAX ▸ VALUE: INCREASING ▸
              </span>
              <span className="t-item">
                DEADLOOP ONLINE ▸ RECURSIVE BUYBACK ▸ SUPPLY COLLAPSE ▸ VOLATILITY: MAX ▸ VALUE: INCREASING ▸
              </span>
            </div>
            {/* block #2 (duplicate) */}
            <div aria-hidden="true" style={{ display: "inline-flex", gap: 40 }}>
              <span className="t-item">
                DEADLOOP ONLINE ▸ RECURSIVE BUYBACK ▸ SUPPLY COLLAPSE ▸ VOLATILITY: MAX ▸ VALUE: INCREASING ▸
              </span>
              <span className="t-item">
                DEADLOOP ONLINE ▸ RECURSIVE BUYBACK ▸ SUPPLY COLLAPSE ▸ VOLATILITY: MAX ▸ VALUE: INCREASING ▸
              </span>
              <span className="t-item">
                DEADLOOP ONLINE ▸ RECURSIVE BUYBACK ▸ SUPPLY COLLAPSE ▸ VOLATILITY: MAX ▸ VALUE: INCREASING ▸
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
