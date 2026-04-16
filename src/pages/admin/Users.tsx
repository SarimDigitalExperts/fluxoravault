import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users as UsersIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminUsers() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    const [profRes, rolesRes, subsRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
      supabase.from("subscriptions").select("*").eq("status", "active"),
    ]);
    const roles = rolesRes.data || [];
    const subs = subsRes.data || [];
    const data = (profRes.data || []).map(p => ({
      ...p,
      role: roles.find(r => r.user_id === p.user_id)?.role || "user",
      subscription: subs.find(s => s.user_id === p.user_id),
    }));
    setProfiles(data);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2"><UsersIcon className="h-5 w-5 text-primary" /> Users ({profiles.length})</CardTitle>
        <Button variant="ghost" size="icon" onClick={fetch}><RefreshCw className="h-4 w-4" /></Button>
      </CardHeader>
      <CardContent>
        {loading ? <p className="text-muted-foreground text-sm">Loading...</p> : (
          <div className="rounded-lg border border-border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <p className="font-medium text-sm">{p.display_name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{p.user_id.slice(0, 8)}...</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.role === "admin" ? "default" : "secondary"} className="text-xs">{p.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm capitalize">{p.subscription?.plan || "Free"}</span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
