"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { config } from "@/config";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const { user, login, demoLogin, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.role === "employee") {
      router.replace("/employee");
    } else if (user?.role === "admin") {
      router.replace("/admin");
    }
  }, [router, user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemo = async (role: "employee" | "admin") => {
    setError(null);
    setSubmitting(true);
    try {
      await demoLogin(role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Welcome to {config.appName}</CardTitle>
          <CardDescription>Sign in to manage your attendance.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-200">
              {error}
            </div>
          )}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.local"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <Button className="w-full" type="submit" disabled={submitting || loading}>
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <div className="mt-6 space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Demo access</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => handleDemo("employee")}
                disabled={submitting || loading}
              >
                Demo: Employee
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => handleDemo("admin")}
                disabled={submitting || loading}
              >
                Demo: Admin
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
