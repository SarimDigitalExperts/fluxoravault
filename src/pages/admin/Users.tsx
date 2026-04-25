import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users as UsersIcon, RefreshCw, Plus, Trash2, Pencil, Search, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Role = "admin" | "moderator" | "user";

interface AdminUserRow {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: Role;
  plan: string;
  plan_expires_at: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed: boolean;
  provider: string;
}

const FN = "admin-users";

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUserRow | null>(null);
  const [busy, setBusy] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke(FN, { body: { action: "list" } });
    if (error) {
      toast.error(error.message || "Failed to load users");
      setLoading(false);
      return;
    }
    setUsers((data?.users || []) as AdminUserRow[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    let rows = users;
    if (roleFilter !== "all") rows = rows.filter((u) => u.role === roleFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((u) =>
        [u.email, u.display_name, u.role, u.plan, u.id]
          .some((v) => v && String(v).toLowerCase().includes(q))
      );
    }
    return rows;
  }, [users, search, roleFilter]);

  const counts = useMemo(() => ({
    total: users.length,
    admin: users.filter((u) => u.role === "admin").length,
    moderator: users.filter((u) => u.role === "moderator").length,
    user: users.filter((u) => u.role === "user").length,
  }), [users]);

  const updateRole = async (user_id: string, role: Role) => {
    setBusy(true);
    const { error } = await supabase.functions.invoke(FN, { body: { action: "update_role", user_id, role } });
    setBusy(false);
    if (error) { toast.error(error.message || "Failed to update role"); return; }
    setUsers((prev) => prev.map((u) => (u.id === user_id ? { ...u, role } : u)));
    toast.success("Role updated");
  };

  const deleteUser = async (u: AdminUserRow) => {
    if (u.id === me?.id) { toast.error("You cannot delete yourself"); return; }
    if (!confirm(`Delete ${u.email || u.id}? This is irreversible.`)) return;
    setBusy(true);
    const { error } = await supabase.functions.invoke(FN, { body: { action: "delete", user_id: u.id } });
    setBusy(false);
    if (error) { toast.error(error.message || "Failed to delete user"); return; }
    setUsers((prev) => prev.filter((x) => x.id !== u.id));
    toast.success("User deleted");
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Users", value: counts.total, icon: UsersIcon, tint: "text-primary" },
          { label: "Admins", value: counts.admin, icon: ShieldCheck, tint: "text-secondary" },
          { label: "Moderators", value: counts.moderator, icon: ShieldCheck, tint: "text-foreground" },
          { label: "Members", value: counts.user, icon: UsersIcon, tint: "text-muted-foreground" },
        ].map((s) => (
          <Card key={s.label} className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <s.icon className={`h-5 w-5 ${s.tint}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-primary" /> Users
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, name, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as any)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="moderator">Moderators</SelectItem>
                <SelectItem value="user">Members</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <p className="text-muted-foreground text-sm py-8 text-center">Loading users...</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">No users found.</p>
          ) : (
            <div className="rounded-lg border border-border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((u) => {
                    const isMe = u.id === me?.id;
                    return (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground flex items-center justify-center text-xs font-bold">
                              {(u.display_name || u.email || "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-sm flex items-center gap-1.5">
                                {u.display_name || "—"}
                                {isMe && <Badge variant="outline" className="text-[10px] px-1 py-0">you</Badge>}
                              </p>
                              <p className="text-[10px] text-muted-foreground">{u.id.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate max-w-[200px]">{u.email || "—"}</span>
                            {u.email_confirmed && (
                              <Badge variant="secondary" className="text-[10px] px-1 py-0">verified</Badge>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground capitalize mt-0.5">via {u.provider}</p>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={u.role}
                            onValueChange={(v) => updateRole(u.id, v as Role)}
                            disabled={busy || isMe}
                          >
                            <SelectTrigger className="h-8 w-[120px] text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="moderator">Moderator</SelectItem>
                              <SelectItem value="user">User</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={u.plan !== "free" ? "default" : "secondary"}
                            className="text-xs capitalize"
                          >
                            {u.plan}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(u.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : "Never"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setEditing(u)}
                              title="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => deleteUser(u)}
                              disabled={busy || isMe}
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={fetchData} />
      <EditUserDialog
        user={editing}
        onOpenChange={(o) => !o && setEditing(null)}
        onSaved={fetchData}
      />
    </div>
  );
}

// ----- Create User Dialog -----
function CreateUserDialog({
  open, onOpenChange, onCreated,
}: { open: boolean; onOpenChange: (o: boolean) => void; onCreated: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<Role>("user");
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setEmail(""); setPassword(""); setDisplayName(""); setRole("user");
  };

  const submit = async () => {
    if (!email || !password) { toast.error("Email and password are required"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setBusy(true);
    const { error } = await supabase.functions.invoke(FN, {
      body: { action: "create", email, password, display_name: displayName, role },
    });
    setBusy(false);
    if (error) { toast.error(error.message || "Failed to create user"); return; }
    toast.success("User created");
    reset();
    onOpenChange(false);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new user</DialogTitle>
          <DialogDescription>Creates a new user account with verified email.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Email *</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
          </div>
          <div>
            <Label className="text-xs">Password *</Label>
            <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" />
          </div>
          <div>
            <Label className="text-xs">Display name</Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Optional" />
          </div>
          <div>
            <Label className="text-xs">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>{busy ? "Creating..." : "Create user"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ----- Edit User Dialog -----
function EditUserDialog({
  user, onOpenChange, onSaved,
}: { user: AdminUserRow | null; onOpenChange: (o: boolean) => void; onSaved: () => void }) {
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<Role>("user");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || "");
      setRole(user.role);
    }
  }, [user]);

  if (!user) return null;

  const submit = async () => {
    setBusy(true);
    const tasks: Promise<any>[] = [];
    if (displayName !== (user.display_name || "")) {
      tasks.push(supabase.functions.invoke(FN, { body: { action: "update_profile", user_id: user.id, display_name: displayName } }));
    }
    if (role !== user.role) {
      tasks.push(supabase.functions.invoke(FN, { body: { action: "update_role", user_id: user.id, role } }));
    }
    const results = await Promise.all(tasks);
    setBusy(false);
    const err = results.find((r) => r.error);
    if (err) { toast.error(err.error.message || "Failed to update"); return; }
    toast.success("User updated");
    onOpenChange(false);
    onSaved();
  };

  return (
    <Dialog open={!!user} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Display name</Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>{busy ? "Saving..." : "Save changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
