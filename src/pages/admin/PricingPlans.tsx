import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import AdminToolbar from "@/components/admin/AdminToolbar";
import { useAdminTable } from "@/hooks/useAdminTable";

export default function AdminPricingPlans() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from("subscriptions").select("*").order("created_at", { ascending: false });
    setSubs(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("subscriptions").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Subscription updated"); fetchData();
  };
  const updatePlan = async (id: string, plan: string) => {
    const { error } = await supabase.from("subscriptions").update({ plan }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Plan updated"); fetchData();
  };

  const tbl = useAdminTable<any>({
    table: "subscriptions", rows: subs, refresh: fetchData,
    searchKeys: ["user_id", "plan", "status"],
    exportColumns: ["user_id","plan","status","starts_at","expires_at","created_at"],
  });

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2"><Crown className="h-5 w-5 text-primary" /> Subscriptions ({subs.length})</CardTitle>
        <Button size="sm" variant="ghost" onClick={fetchData}><RefreshCw className="h-4 w-4" /></Button>
      </CardHeader>
      <CardContent>
        <AdminToolbar searchQuery={tbl.search} onSearchChange={tbl.setSearch} searchPlaceholder="Search subscriptions..."
          selectedCount={tbl.selected.size} onBulkDelete={tbl.bulkDelete} onExport={tbl.handleExport} />
        {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : tbl.filtered.length === 0 ? <p className="text-sm text-muted-foreground">No subscriptions found.</p> : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead className="w-10"><Checkbox checked={tbl.allSelected} onCheckedChange={tbl.toggleAll} /></TableHead>
                <TableHead>User</TableHead><TableHead>Plan</TableHead><TableHead>Status</TableHead><TableHead>Started</TableHead><TableHead>Expires</TableHead></TableRow></TableHeader>
              <TableBody>
                {tbl.filtered.map((s) => (
                  <TableRow key={s.id} data-state={tbl.selected.has(s.id) ? "selected" : undefined}>
                    <TableCell><Checkbox checked={tbl.selected.has(s.id)} onCheckedChange={() => tbl.toggleOne(s.id)} /></TableCell>
                    <TableCell className="font-mono text-xs">{s.user_id.slice(0, 8)}...</TableCell>
                    <TableCell>
                      <Select value={s.plan} onValueChange={(v) => updatePlan(s.id, v)}>
                        <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="free">Free</SelectItem><SelectItem value="starter">Starter</SelectItem><SelectItem value="pro">Pro</SelectItem><SelectItem value="enterprise">Enterprise</SelectItem></SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select value={s.status} onValueChange={(v) => updateStatus(s.id, v)}>
                        <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="expired">Expired</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm">{new Date(s.starts_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-sm">{s.expires_at ? new Date(s.expires_at).toLocaleDateString() : "—"}</TableCell>
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
