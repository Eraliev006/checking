"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, History } from "lucide-react";

import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";

const navItems = [
  { label: "Today", href: "/employee", icon: CalendarClock },
  { label: "History", href: "/employee/history", icon: History }
];

export const EmployeeTopBar = () => {
  const pathname = usePathname();
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200/70 pb-6 dark:border-slate-800/70 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/employee" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900/60 dark:hover:text-slate-100",
                isActive &&
                  "bg-slate-100 text-slate-900 dark:bg-slate-900/60 dark:text-slate-100"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <UserMenu />
      </div>
    </div>
  );
};
