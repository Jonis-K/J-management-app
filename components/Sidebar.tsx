"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Dashboard" },
  { href: "/members", label: "Members" },
  { href: "/goals", label: "Goals" },
  { href: "/links", label: "Links" },
  { href: "/calendar", label: "Calendar" },
  { href: "/org", label: "Org" }
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-56 border-r border-black/10 bg-white p-3 sm:block">
      <nav className="space-y-1">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm ${
                active ? "bg-black/5 font-medium" : "hover:bg-black/5"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
