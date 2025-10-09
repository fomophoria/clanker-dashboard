export const metadata = {
  title: "DEADLOOP // Terminal",
  description: "Recursive buyback engine — LIVE burn dashboard",
};

import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="crt">{children}</body>
    </html>
  );
}