"use client";

import { useEffect, useMemo, useState } from "react";

import { ShieldCheck } from "lucide-react";

import { api, resolveRoleFromEmail, type User } from "@/lib/api";
import { AdminTopBar } from "@/components/layout/admin-top-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const defaultForm = {
  id: "",
  fullName: "",
  email: "",
  role: "employee" as User["role"],
  active: true
};

export default function AdminEmployeesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const data = await api.listUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleEdit = (user: User) => {
    setForm({ ...user, role: resolveRoleFromEmail(user.email) });
    setError(null);
    setIsEditing(true);
    setOpen(true);
  };

  const handleAdd = () => {
    setForm({ ...defaultForm, id: `user-${Date.now()}` });
    setError(null);
    setIsEditing(false);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.fullName || !form.email) {
      setError("Full name and email are required.");
      return;
    }
    await api.upsertUser({
      ...form,
      role: resolveRoleFromEmail(form.email)
    });
    setOpen(false);
    load();
  };

  const handleToggle = async (userId: string) => {
    await api.toggleUser(userId);
    load();
  };

  const activeCount = useMemo(
    () => users.filter((user) => user.active).length,
    [users]
  );

  const filteredUsers = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return users;
    return users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(normalized) ||
        user.email.toLowerCase().includes(normalized)
    );
  }, [users, search]);

  return (
    <div className="space-y-6">
      <AdminTopBar
        title="Employees"
        subtitle="Manage access, activation, and admin privileges."
      />

      <Card className="border-slate-200/70 shadow-sm dark:border-slate-800">
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-400 dark:border-slate-800 dark:bg-slate-950">
                Active
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {activeCount}
                </span>
              </div>
              <Input
                className="lg:w-72"
                placeholder="Search employees"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <Button onClick={handleAdd}>Add employee</Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 text-slate-400 dark:border-slate-800">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm text-slate-500">No employees match this search.</p>
            </div>
          ) : (
            <>
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow className="text-slate-400">
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40">
                        <TableCell>{user.fullName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="capitalize">
                          <Badge variant="outline" className="capitalize">
                            {resolveRoleFromEmail(user.email)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant={user.active ? "secondary" : "outline"}
                            onClick={() => handleToggle(user.id)}
                          >
                            {user.active ? "Active" : "Inactive"}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost">
                                Manage
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => handleEdit(user)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleToggle(user.id)}>
                                {user.active ? "Deactivate" : "Activate"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-3 lg:hidden">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{user.fullName}</p>
                      <Badge variant="outline" className="capitalize">
                        {resolveRoleFromEmail(user.email)}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
                        Edit
                      </Button>
                      <Button size="sm" variant={user.active ? "secondary" : "outline"} onClick={() => handleToggle(user.id)}>
                        {user.active ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isEditing ? "Edit employee" : "Add employee"}</DialogTitle>
                <DialogDescription>
                  Roles are resolved automatically based on the email address.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {error && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-200">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    value={form.fullName}
                    onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                  />
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900/40">
                  <div className="flex items-center gap-2 text-slate-500">
                    <ShieldCheck className="h-4 w-4" />
                    Role
                  </div>
                  <span className="font-semibold capitalize text-slate-900 dark:text-slate-100">
                    {form.email ? resolveRoleFromEmail(form.email) : "employee"}
                  </span>
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1" onClick={handleSave}>
                    Save
                  </Button>
                  <Button className="flex-1" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
