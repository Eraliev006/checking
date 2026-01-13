"use client";

import { AuthGuard } from "@/components/providers/auth-guard";
import { AppHeader } from "@/components/layout/app-header";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard role="employee">
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <AppHeader
          title="Employee Portal"
          links={[
            { label: "Today", href: "/employee" },
            { label: "History", href: "/employee/history" }
          ]}
        />
        <main className="container-page">{children}</main>
      </div>
    </AuthGuard>
  );
}
