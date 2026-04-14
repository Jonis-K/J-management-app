import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

import MobileNav from "@/components/MobileNav";

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
      <body className="antialiased bg-slate-50 text-slate-800">
        <div className="flex min-h-screen">
          {/* PC用のサイドバー */}
          <Sidebar />
          
          <div className="flex-1 flex flex-col min-w-0">
            {/* ヘッダー */}
            <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 py-3 shadow-sm">
              <div className="flex items-center justify-between">
                {/* スマホ用ハンバーガーメニュー */}
                <MobileNav />
                
                {/* スマホ用中央ロゴ */}
                <div className="sm:hidden font-extrabold text-sky-950 flex items-center gap-1.5">
                  <span className="text-sky-500">◆</span> J-Management
                </div>
                
                {/* スマホ用センタリングのためのダミー要素 */}
                <div className="w-10 sm:hidden"></div> 

                {/* PC用右のウェルカムテキスト等（今回は一旦非表示かシンプルに） */}
                <div className="hidden sm:block text-sm font-medium text-slate-500 ml-auto">
                  社内ポータル ダッシュボード
                </div>
              </div>
            </header>
            
            <main className="flex-1 overflow-x-hidden">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
