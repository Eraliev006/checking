"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users } from "lucide-react";

import { config } from "@/config";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Employees", href: "/admin/employees", icon: Users }
];

export const AdminShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white/80 px-5 py-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/60 lg:flex">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Workspace</p>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {config.appName}
            </h2>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900/60 dark:hover:text-slate-100",
                    isActive &&
                      "bg-slate-100 text-slate-900 dark:bg-slate-900/60 dark:text-slate-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1">
          <div className="container-page space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
};
