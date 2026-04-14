"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Home, Users, Target, Link as LinkIcon, Calendar, Network, Zap } from "lucide-react";

export const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/members", label: "Members", icon: Users },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/links", label: "Links", icon: LinkIcon },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/org", label: "Org Chart", icon: Network }
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="sm:hidden">
      <button onClick={() => setOpen(true)} className="p-2 -ml-2 text-slate-600 hover:text-sky-600 transition-colors">
        <Menu className="w-6 h-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setOpen(false)} 
          />
          
          {/* Sliding Menu */}
          <div className="relative w-64 h-full bg-white shadow-2xl flex flex-col p-4 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-sky-100">
              <div className="flex items-center gap-2">
                <div className="bg-sky-500 p-1.5 rounded-lg text-white shadow-sm">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-sky-950">メニュー</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 bg-slate-50 rounded-full text-slate-500 hover:text-sky-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto">
              {navItems.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all font-bold ${
                      active ? "bg-sky-50 text-sky-700 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-sky-600"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            
            <div className="pt-4 border-t border-slate-100 mt-auto text-xs text-center text-slate-400 font-medium tracking-wider">
              J-MANAGEMENT APP
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
