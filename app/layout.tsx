import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DEADLOOP — Recursive Buyback Protocol",
  description: "Recursive buybacks. Relentless burns. Supply collapse.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="crt bg-black text-[15px] text-[#22ff00]">
        {children}
      </body>
    </html>
  );
}
