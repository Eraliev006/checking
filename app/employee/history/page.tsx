"use client";

import { useEffect, useState } from "react";

import { api, type AttendanceDay } from "@/lib/api";
import { formatDate, formatTime, getMonthOptions } from "@/lib/date";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const statusClass = (status: AttendanceDay["status"]) => {
  if (status === "LATE") return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200";
  if (status === "ABSENT") return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200";
  if (status === "INCOMPLETE")
    return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200";
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200";
};

export default function EmployeeHistoryPage() {
  const { user } = useAuth();
  const options = getMonthOptions();
  const [month, setMonth] = useState(options[0]?.value ?? "");
  const [history, setHistory] = useState<AttendanceDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user || !month) return;
      setLoading(true);
      const data = await api.getHistory(user.id, month);
      setHistory(data);
      setLoading(false);
    };
    load();
  }, [user, month]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>History</CardTitle>
        <CardDescription>Review your attendance month by month.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-w-xs">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger>
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-800">
            No attendance records yet.
          </div>
        ) : (
          <>
            <div className="space-y-3 lg:hidden">
              {history.map((day) => (
                <div
                  key={day.date}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{formatDate(day.date)}</p>
                    <Badge className={statusClass(day.status)}>{day.status}</Badge>
                  </div>
                  <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    <p>In: {formatTime(day.inTime)}</p>
                    <p>Out: {formatTime(day.outTime)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>In</TableHead>
                    <TableHead>Out</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((day) => (
                    <TableRow key={day.date}>
                      <TableCell>{formatDate(day.date)}</TableCell>
                      <TableCell>{formatTime(day.inTime)}</TableCell>
                      <TableCell>{formatTime(day.outTime)}</TableCell>
                      <TableCell>
                        <Badge className={statusClass(day.status)}>{day.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
