"use client";

import { AuthGuard } from "@/components/providers/auth-guard";
import { EmployeeTopBar } from "@/components/layout/employee-top-bar";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard role="employee">
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <main className="container-page space-y-8">
          <EmployeeTopBar />
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
