"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { api, type AttendanceDay } from "@/lib/api";
import { formatDate, formatTime, toDateKey } from "@/lib/date";
import { useAuth } from "@/hooks/use-auth";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const statusCopy = (day: AttendanceDay) => {
  if (!day.inTime) return "Not checked-in";
  if (day.inTime && !day.outTime) return "At work";
  return "Checked-out";
};

const statusTone = (status: AttendanceDay["status"]) => {
  if (status === "LATE") return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200";
  if (status === "ABSENT") return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200";
  if (status === "INCOMPLETE")
    return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200";
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200";
};

export default function EmployeeHomePage() {
  const { user } = useAuth();
  const [today, setToday] = useState<AttendanceDay | null>(null);
  const [week, setWeek] = useState<AttendanceDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      const todayKey = toDateKey(new Date());
      const day = await api.getHistory(user.id, todayKey.slice(0, 7));
      const todayEntry = day.find((item) => item.date === todayKey) ?? null;
      const weekEntries = await api.getWeek(user.id);
      setToday(todayEntry);
      setWeek(weekEntries);
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading || !today) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200/70 shadow-sm dark:border-slate-800">
        <CardContent className="space-y-6 p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={statusTone(today.status)}>{today.status}</Badge>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Today</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                  {statusCopy(today)}
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Last action: {formatTime(today.outTime ?? today.inTime)}
                </p>
              </div>
              <div className="grid gap-3 text-sm text-slate-500 dark:text-slate-400 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Checked in</p>
                  <p className="mt-1 font-medium text-slate-900 dark:text-white">
                    {formatTime(today.inTime)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Checked out</p>
                  <p className="mt-1 font-medium text-slate-900 dark:text-white">
                    {formatTime(today.outTime)}
                  </p>
                </div>
              </div>
            </div>
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/employee/scan">
                Scan QR
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200/70 shadow-sm dark:border-slate-800">
        <CardContent className="space-y-4 p-6">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Weekly preview
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your last seven working days.
            </p>
          </div>
          <div className="space-y-3">
            {week.map((day) => (
              <div
                key={day.date}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950"
              >
                <div>
                  <p className="font-medium">{formatDate(day.date)}</p>
                  <p className="text-xs text-slate-400">In: {formatTime(day.inTime)}</p>
                </div>
                <Badge className={statusTone(day.status)}>{day.status}</Badge>
                <p className="text-xs text-slate-400">Out: {formatTime(day.outTime)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
