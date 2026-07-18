import LoginForm from "./LoginForm";
import { Zap } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-br from-sky-100 via-slate-50 to-indigo-100 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
      {/* 背景の装飾（ぼかした円） */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-sky-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-indigo-300/30 blur-3xl" />

      <div className="relative w-full max-w-[400px] sm:max-w-md">
        {/* ブランドロゴ */}
        <div className="flex items-center justify-center gap-2.5 mb-6 sm:mb-8">
          <div className="bg-sky-500 p-2 sm:p-2.5 rounded-xl text-white shadow-lg shadow-sky-500/30">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="font-extrabold text-sky-950 text-xl sm:text-2xl tracking-tight">
            J-Management
          </span>
        </div>

        {/* ログインカード */}
        <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl shadow-sky-950/5 border border-white p-6 sm:p-10">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-sky-950">ログイン</h1>
            <p className="text-xs sm:text-sm text-sky-600/70 mt-2 leading-relaxed">
              社内で指定されたIDとパスワードを
              <br className="sm:hidden" />
              入力してください
            </p>
          </div>

          <LoginForm />
        </div>

        <div className="mt-6 sm:mt-8 text-center text-[11px] sm:text-xs text-slate-400">
          &copy; {new Date().getFullYear()} Management Dashboard. All rights reserved.
        </div>
      </div>
    </div>
  );
}
