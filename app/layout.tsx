import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "社内ポータル",
  description: "MVP dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1">
            <header className="sticky top-0 z-10 border-b border-black/10 bg-white px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-black/70">社内ポータル</div>
              </div>
            </header>
            <main className="px-4 py-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
