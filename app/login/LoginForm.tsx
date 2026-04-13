"use client";

import { useTransition, useState } from "react";
import { loginAction } from "./actions";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        // ログイン成功時はダッシュボードへ
        router.push("/");
        router.refresh(); // ヘッダー状態やミドルウェアをリフレッシュ
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 flex flex-col mt-6">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-sky-900 mb-1">
          ログインID
        </label>
        <input
          type="text"
          name="username"
          required
          className="w-full px-4 py-3 rounded-xl border border-sky-100 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-colors"
          placeholder="idを入力"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-sky-900 mb-1">
          パスワード
        </label>
        <input
          type="password"
          name="password"
          required
          className="w-full px-4 py-3 rounded-xl border border-sky-100 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-colors"
          placeholder="パスワードを入力"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full mt-4 bg-sky-600 hover:bg-sky-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-sky-600/30"
      >
        {isPending ? "ログイン中..." : "ログイン"}
      </button>
    </form>
  );
}
