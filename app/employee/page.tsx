"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { api, type AttendanceDay } from "@/lib/api";
import { formatDate, formatTime, toDateKey } from "@/lib/date";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Card>
        <CardHeader>
          <CardTitle>Today</CardTitle>
          <CardDescription>Track your latest check-in status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
              <div className="mt-2 flex items-center gap-3">
                <p className="text-2xl font-semibold">{statusCopy(today)}</p>
                <Badge className={statusTone(today.status)}>{today.status}</Badge>
              </div>
              <div className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                <p>Last action: {formatTime(today.outTime ?? today.inTime)}</p>
                <p>Checked-in: {formatTime(today.inTime)}</p>
                <p>Checked-out: {formatTime(today.outTime)}</p>
              </div>
            </div>
            <Button asChild size="lg">
              <Link href="/employee/scan">Scan QR</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly preview</CardTitle>
          <CardDescription>Keep an eye on your last 7 days.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
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
        </CardContent>
      </Card>
    </div>
  );
}
