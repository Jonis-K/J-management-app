"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Target, Link as LinkIcon, Network, Calendar } from "lucide-react";

export const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/members", label: "Members", icon: Users },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/links", label: "Links", icon: LinkIcon },
  { href: "/org", label: "Org", icon: Network },
  { href: "/calendar", label: "Calendar", icon: Calendar }
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                active ? "text-sky-600" : "text-slate-400 hover:text-sky-500"
              }`}
            >
              <div className={`relative flex items-center justify-center w-12 h-8 rounded-full transition-all ${
                active ? "bg-sky-100" : "bg-transparent"
              }`}>
                <Icon className={`w-5 h-5 ${active ? "stroke-[2.5px]" : "stroke-2"}`} />
              </div>
              <span className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
