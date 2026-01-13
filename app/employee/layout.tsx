"use client";

import { AuthGuard } from "@/components/providers/auth-guard";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard role="employee">{children}</AuthGuard>;
}
