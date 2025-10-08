// app/launch/page.tsx
import type { Metadata } from "next";

const title = "DEADLOOP — Launching Soon";
const description =
    "Transparent, automated token burns on Base. Every eligible token sent to 0x…dEaD, tracked in real time.";

export const metadata: Metadata = {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
};

export default function LaunchPage() {
    const xHandle = process.env.NEXT_PUBLIC_X_HANDLE || "";
    const neon = "var(--neon, #39FF14)"; // fallback neon green

    return (
        <main
            style={{
                minHeight: "100dvh",
                background: "black",
                color: "white",
                display: "grid",
                placeItems: "center",
                padding: "40px 20px",
            }}
        >
            <div
                style={{
                    maxWidth: 720,
                    width: "100%",
                    textAlign: "center",
                }}
            >
                <div style={{ opacity: 0.75, letterSpacing: 2, marginBottom: 12 }}>
                    BASE • PROOF OF BURN • ON-CHAIN
                </div>

                <h1
                    style={{
                        fontSize: "clamp(32px, 6vw, 54px)",
                        fontWeight: 800,
                        lineHeight: 1.1,
                        margin: 0,
                    }}
                >
                    DEADLOOP is <span style={{ color: neon }}>almost</span> here.
                </h1>

                <p
                    style={{
                        marginTop: 16,
                        color: "rgba(255,255,255,0.8)",
                        fontSize: "clamp(16px, 2.2vw, 18px)",
                    }}
                >
                    A transparent, automated burn protocol launched on Clanker. Every eligible token received is
                    auto-sent to <code style={{ color: neon }}>0x000…dEaD</code>. Public dashboard.
                </p>

                <div
                    style={{
                        marginTop: 24,
                        display: "flex",
                        gap: 12,
                        justifyContent: "center",
                        flexWrap: "wrap",
                    }}
                >
                    {xHandle ? (
                        <a
                            href={`https://x.com/${xHandle}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                borderRadius: 14,
                                border: `1px solid ${neon}`,
                                padding: "10px 16px",
                                textDecoration: "none",
                                color: "white",
                                display: "inline-block",
                                boxShadow: `0 0 12px ${neon}`,
                            }}
                        >
                            Follow on X
                        </a>
                    ) : null}
                </div>

                <p style={{ marginTop: 18, opacity: 0.6, fontSize: 12 }}>
                    When we’re live, this page disappears and the dashboard takes over.
                </p>
            </div>
        </main>
    );
}
