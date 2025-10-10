// app/launch/LaunchClient.tsx
'use client'

export default function LaunchClient() {
    const xHandle = process.env.NEXT_PUBLIC_X_HANDLE || 'deadloopprotocol'
    const fcHandle = process.env.NEXT_PUBLIC_FC_HANDLE || 'deadloopprotocol'

    return (
        <main className="launch-root">
            {/* Background + global styles */}
            <style jsx global>{`
        :root {
          --bg: #000;
          --fg: #e5ffe9;
          --muted: rgba(229, 255, 233, 0.7);
          --neon: #39ff14;
          --accent: #7cffd0;
          --border: rgba(124, 255, 208, 0.2);
          --shadow: 0 0 24px rgba(57, 255, 20, 0.25),
            inset 0 0 30px rgba(57, 255, 20, 0.08);
        }
        html,
        body {
          height: 100%;
          background: var(--bg);
        }
      `}</style>

            <style jsx>{`
        .launch-root {
          min-height: 100dvh;
          color: var(--fg);
          display: grid;
          place-items: center;
          padding: 32px 16px;
          background:
            radial-gradient(1200px 600px at 50% -10%, rgba(57, 255, 20, 0.08), transparent 60%),
            radial-gradient(800px 400px at 80% 120%, rgba(124, 255, 208, 0.06), transparent 60%),
            var(--bg);
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
        }
        .wrap {
          width: 100%;
          max-width: 720px;
        }
        .kicker {
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--muted);
          font-size: 12px;
          margin-bottom: 12px;
          white-space: nowrap;
        }
        .title {
          font-weight: 800;
          line-height: 1.1;
          margin: 0 0 12px;
          font-size: clamp(28px, 6vw, 48px);
        }
        .title .neon {
          color: var(--neon);
          text-shadow: 0 0 10px rgba(57, 255, 20, 0.5);
        }
        .sub {
          color: var(--muted);
          font-size: clamp(14px, 2.4vw, 18px);
        }

        /* Terminal window */
        .terminal {
          margin-top: 24px;
          border: 1px solid var(--border);
          border-radius: 14px;
          background: #020302;
          box-shadow: var(--shadow);
          overflow: hidden;
          position: relative;
        }
        .term-top {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-bottom: 1px solid var(--border);
          background: linear-gradient(
            to bottom,
            rgba(124, 255, 208, 0.08),
            rgba(124, 255, 208, 0.03)
          );
        }
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--accent);
          opacity: 0.65;
        }
        .term-body {
          padding: 16px 14px;
          font-size: 14px;
          line-height: 1.5;
          max-height: 45vh;       /* keeps it comfy in the mini app */
          overflow: auto;
          scrollbar-width: thin;
        }
        .code-line {
          color: var(--muted);
          white-space: pre-wrap;
        }
        .green {
          color: var(--neon);
        }
        .cursor::after {
          content: "█";
          display: inline-block;
          margin-left: 4px;
          color: var(--neon);
          animation: blink 1s steps(1, start) infinite;
        }
        @keyframes blink {
          50% {
            opacity: 0;
          }
        }
        /* Subtle scanlines */
        .terminal::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            to bottom,
            rgba(124, 255, 208, 0.06) 0px,
            rgba(124, 255, 208, 0.06) 1px,
            transparent 1px,
            transparent 3px
          );
          pointer-events: none;
          opacity: 0.25;
        }

        /* Buttons row */
        .actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 20px;
        }
        .btn {
          --ring: rgba(57, 255, 20, 0.45);
          color: #0a0a0a;
          background: var(--neon);
          text-decoration: none;
          font-weight: 700;
          border-radius: 14px;
          padding: 10px 16px;
          box-shadow: 0 0 0 1px rgba(57, 255, 20, 0.35),
            0 0 16px var(--ring), inset 0 0 8px rgba(0, 0, 0, 0.15);
        }
        .btn.secondary {
          background: transparent;
          color: var(--fg);
          border: 1px solid var(--border);
          box-shadow: none;
        }

        .footnote {
          margin-top: 16px;
          font-size: 12px;
          color: rgba(229, 255, 233, 0.55);
          text-align: center;
        }
      `}</style>

            <div className="wrap">
                <div className="kicker">BASE • PROOF OF BURN • ON-CHAIN</div>

                <h1 className="title">
                    DEADLOOP is <span className="neon">almost</span> here.
                </h1>

                <p className="sub">
                    The first transparent, automated burn protocol launched on Clanker.
                    Every eligible token received is auto-sent to <span className="green">BURN</span>.
                </p>

                {/* Terminal / boot log feel */}
                <div className="terminal">
                    <div className="term-top">
                        <span className="dot" />
                        <span className="dot" />
                        <span className="dot" />
                        <span style={{ marginLeft: 8, color: 'var(--muted)', fontSize: 12 }}>
                            deadloop@clanker — boot.log
                        </span>
                    </div>
                    <div className="term-body">
                        <div className="code-line">
                            $ initializing <span className="green">proof_of_burn</span> …
                        </div>
                        <div className="code-line">✓ chain: base</div>
                        <div className="code-line">✓ router: clanker</div>
                        <div className="code-line">
                            ✓ burn_address: <span className="green">0x000…dEaD</span>
                        </div>
                        <div className="code-line">✓ dashboard: /dashboard (coming soon)</div>
                        <div className="code-line cursor">_</div>
                    </div>
                </div>

                {/* Links */}
                <div className="actions">
                    <a className="btn" href={`https://x.com/${xHandle}`} target="_blank" rel="noreferrer">
                        Follow on X
                    </a>
                    <a className="btn secondary" href={`https://farcaster.xyz/${fcHandle}`} target="_blank" rel="noreferrer">
                        Follow on Farcaster
                    </a>
                </div>

                <p className="footnote">
                    When we’re live, this page disappears and the system takes over.
                </p>
            </div>
        </main>
    )
}
