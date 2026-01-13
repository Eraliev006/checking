"use client";

import { AuthGuard } from "@/components/providers/auth-guard";
import { AppHeader } from "@/components/layout/app-header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard role="admin">
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <AppHeader
          title="Admin Dashboard"
          links={[
            { label: "Overview", href: "/admin" },
            { label: "Employees", href: "/admin/employees" }
          ]}
        />
        <main className="container-page">{children}</main>
      </div>
    </AuthGuard>
  );
}
