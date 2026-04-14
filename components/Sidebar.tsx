"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./BottomNav";
import { Zap } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-64 border-r border-slate-200 bg-white p-4 sm:flex flex-col shadow-sm z-10 shrink-0">
      <div className="flex items-center gap-2 px-2 py-4 mb-4 border-b border-sky-100">
        <div className="bg-sky-500 p-1.5 rounded-lg text-white shadow-sm">
          <Zap className="w-5 h-5" />
        </div>
        <span className="font-extrabold text-sky-950 text-lg tracking-tight">J-Management</span>
      </div>
      
      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all font-bold ${
                active 
                  ? "bg-sky-50 text-sky-700 shadow-sm ring-1 ring-sky-200/50" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-sky-600"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto px-2 py-4 text-xs font-semibold text-slate-300">
        © 2026 Admin Portal
      </div>
    </aside>
  );
}
