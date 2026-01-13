"use client";

import { AuthGuard } from "@/components/providers/auth-guard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard role="admin">{children}</AuthGuard>;
}
