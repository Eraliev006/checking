"use client";

import Link from "next/link";

import { config } from "@/config";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export const AppHeader = ({
  title,
  links
}: {
  title: string;
  links: { label: string; href: string }[];
}) => {
  const { user, logout } = useAuth();
  return (
    <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
      <div className="container-page flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{config.appName}</p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {links.map((link) => (
            <Button asChild variant="ghost" key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
          <ThemeToggle />
          {user && (
            <Button variant="outline" onClick={logout}>
              Sign out
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
