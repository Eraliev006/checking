"use client";

import { useEffect, useMemo, useState } from "react";

import { api, type AdminRow, type AttendanceStatus } from "@/lib/api";
import { formatTime, toDateKey } from "@/lib/date";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const statusStyle = (status: AttendanceStatus) => {
  if (status === "LATE") return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200";
  if (status === "ABSENT") return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200";
  if (status === "INCOMPLETE")
    return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200";
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200";
};

const statusTabs: { value: string; label: string; filter?: AttendanceStatus }[] = [
  { value: "all", label: "All" },
  { value: "present", label: "Present", filter: "OK" },
  { value: "late", label: "Late", filter: "LATE" },
  { value: "absent", label: "Absent", filter: "ABSENT" },
  { value: "incomplete", label: "Incomplete", filter: "INCOMPLETE" }
];

export default function AdminOverviewPage() {
  const [date, setDate] = useState(toDateKey(new Date()));
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await api.getAdminRows(date);
      setRows(data);
      setLoading(false);
    };
    load();
  }, [date]);

  const summary = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.total += 1;
        acc[row.status] += 1;
        return acc;
      },
      { total: 0, OK: 0, LATE: 0, ABSENT: 0, INCOMPLETE: 0 }
    );
  }, [rows]);

  const [tab, setTab] = useState("all");

  const filteredRows = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    const statusFilter = statusTabs.find((item) => item.value === tab)?.filter;
    return rows.filter((row) => {
      const matchesSearch = row.fullName.toLowerCase().includes(normalized);
      const matchesStatus = statusFilter ? row.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [rows, search, tab]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Daily overview</CardTitle>
          <CardDescription>Monitor team attendance for the selected date.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <label className="text-sm text-slate-500">Select date</label>
              <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-950">
                <p className="text-slate-400">Present</p>
                <p className="text-xl font-semibold text-slate-900 dark:text-white">{summary.OK}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-950">
                <p className="text-slate-400">Late</p>
                <p className="text-xl font-semibold text-slate-900 dark:text-white">{summary.LATE}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-950">
                <p className="text-slate-400">Absent</p>
                <p className="text-xl font-semibold text-slate-900 dark:text-white">{summary.ABSENT}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-950">
                <p className="text-slate-400">Incomplete</p>
                <p className="text-xl font-semibold text-slate-900 dark:text-white">{summary.INCOMPLETE}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance list</CardTitle>
          <CardDescription>Search and filter employee check-ins.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Input
              className="md:max-w-xs"
              placeholder="Search employee"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                {statusTabs.map((item) => (
                  <TabsTrigger key={item.value} value={item.value}>
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-800">
              No results for this filter.
            </div>
          ) : (
            <>
              <div className="space-y-3 lg:hidden">
                {filteredRows.map((row) => (
                  <div
                    key={row.userId}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{row.fullName}</p>
                      <Badge className={statusStyle(row.status)}>{row.status}</Badge>
                    </div>
                    <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      <p>In: {formatTime(row.inTime)}</p>
                      <p>Out: {formatTime(row.outTime)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>In</TableHead>
                      <TableHead>Out</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.map((row) => (
                      <TableRow key={row.userId}>
                        <TableCell>{row.fullName}</TableCell>
                        <TableCell>{formatTime(row.inTime)}</TableCell>
                        <TableCell>{formatTime(row.outTime)}</TableCell>
                        <TableCell>
                          <Badge className={statusStyle(row.status)}>{row.status}</Badge>
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
    </div>
  );
}
