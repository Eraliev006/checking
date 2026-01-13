"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

export const AuthGuard = ({
  role,
  children
}: {
  role: "employee" | "admin";
  children: React.ReactNode;
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
    if (!loading && user && user.role !== role) {
      router.replace(user.role === "admin" ? "/admin" : "/employee");
    }
  }, [loading, router, user, role]);

  if (loading || !user || user.role !== role) {
    return (
      <div className="container-page space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return <>{children}</>;
};
