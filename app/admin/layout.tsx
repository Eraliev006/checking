"use client";

import { AuthGuard } from "@/components/providers/auth-guard";
import { AdminShell } from "@/components/layout/admin-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard role="admin">
      <AdminShell>{children}</AdminShell>
    </AuthGuard>
  );
}
