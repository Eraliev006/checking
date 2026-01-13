"use client";

import { useEffect, useMemo, useState } from "react";

import { api, type User, type UserRole } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const defaultForm = {
  id: "",
  fullName: "",
  email: "",
  role: "employee" as UserRole,
  active: true
};

export default function AdminEmployeesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

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
    setForm(user);
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
    await api.upsertUser(form);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employees</CardTitle>
        <CardDescription>Manage access for your team.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-slate-500">
            Active employees: <span className="font-semibold text-slate-900 dark:text-white">{activeCount}</span>
          </div>
          <Button onClick={handleAdd}>Add employee</Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-800">
            No employees added yet.
          </div>
        ) : (
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell>{user.active ? "Active" : "Inactive"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            Manage
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
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
        )}

        <div className="space-y-3 lg:hidden">
          {users.map((user) => (
            <div
              key={user.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold">{user.fullName}</p>
                <span className="text-xs text-slate-400">{user.active ? "Active" : "Inactive"}</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
                  Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleToggle(user.id)}>
                  {user.active ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit employee" : "Add employee"}</DialogTitle>
              <DialogDescription>Update employee access and role.</DialogDescription>
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
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={form.role}
                  onValueChange={(value) => setForm({ ...form, role: value as UserRole })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
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
  );
}
