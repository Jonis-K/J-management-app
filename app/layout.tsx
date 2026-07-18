import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "J-Management",
  description: "Advanced dashboard with UI improvements",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased bg-slate-50 text-slate-800">{children}</body>
    </html>
  );
}
