import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-sky-100 p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sky-50 mb-4">
            <svg
              className="w-8 h-8 text-sky-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 11c0 3.517-1.009 6.799-2.753 9.571M12 11c0 3.517 1.009 6.799 2.753 9.571M12 11V3m0 8c-2.476 0-4.708 1-6.328 2.328"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-sky-950">ログイン</h1>
          <p className="text-sm text-sky-600/70 mt-2">
            社内で指定されたIDとパスワードを入力してください
          </p>
        </div>
        
        <LoginForm />
      </div>
      
      <div className="mt-8 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Management Dashboard. All rights reserved.
      </div>
    </div>
  );
}
