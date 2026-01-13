"use client";

import { useEffect, useMemo, useState } from "react";

import { AlertTriangle, Clock, UserCheck, UserMinus } from "lucide-react";

import { api, type AdminRow, type AttendanceStatus } from "@/lib/api";
import { formatTime, toDateKey } from "@/lib/date";
import { AdminTopBar } from "@/components/layout/admin-top-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      <AdminTopBar
        title="Overview"
        subtitle="Monitor attendance and highlight exceptions."
        actions={
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Date
            </span>
            <Input
              className="h-9 w-[165px] border-none bg-transparent p-0 text-sm text-slate-700 shadow-none focus-visible:ring-0 dark:text-slate-100"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Present", value: summary.OK, icon: UserCheck, tone: "text-emerald-500" },
          { label: "Late", value: summary.LATE, icon: Clock, tone: "text-amber-500" },
          { label: "Absent", value: summary.ABSENT, icon: UserMinus, tone: "text-rose-500" },
          {
            label: "Incomplete",
            value: summary.INCOMPLETE,
            icon: AlertTriangle,
            tone: "text-slate-500"
          }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="border-slate-200/70 shadow-sm dark:border-slate-800">
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                    {item.value}
                  </p>
                </div>
                <div className={`rounded-2xl border border-slate-200 p-3 dark:border-slate-800 ${item.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-slate-200/70 shadow-sm dark:border-slate-800">
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Input
              className="lg:max-w-sm"
              placeholder="Search employees"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <div className="flex flex-wrap items-center gap-3">
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList>
                  {statusTabs.map((item) => (
                    <TabsTrigger key={item.value} value={item.value}>
                      {item.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-950">
                <span className="uppercase tracking-[0.2em]">Date</span>
                <Input
                  className="h-8 w-[150px] border-none bg-transparent p-0 text-sm text-slate-700 shadow-none focus-visible:ring-0 dark:text-slate-100"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
              </div>
            </div>
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
                    <TableRow className="text-slate-400">
                      <TableHead>Employee</TableHead>
                      <TableHead>In</TableHead>
                      <TableHead>Out</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.map((row) => (
                      <TableRow key={row.userId} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40">
                        <TableCell>{row.fullName}</TableCell>
                        <TableCell>{formatTime(row.inTime)}</TableCell>
                        <TableCell>{formatTime(row.outTime)}</TableCell>
                        <TableCell className="text-right">
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
