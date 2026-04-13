import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function AdminPricingPlans() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => { setLoading(true); const { data } = await supabase.from("subscriptions").select("*").order("created_at", { ascending: false }); setSubs(data || []); setLoading(false); };
  useEffect(() => { fetch(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("subscriptions").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Subscription updated"); fetch();
  };

  const updatePlan = async (id: string, plan: string) => {
    const { error } = await supabase.from("subscriptions").update({ plan }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Plan updated"); fetch();
  };

  return (
    <Card className="glass border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2"><Crown className="h-5 w-5 text-primary" /> Subscriptions ({subs.length})</CardTitle>
        <Button size="sm" variant="ghost" onClick={fetch}><RefreshCw className="h-4 w-4" /></Button>
      </CardHeader>
      <CardContent>
        {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : subs.length === 0 ? <p className="text-sm text-muted-foreground">No subscriptions yet.</p> : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Plan</TableHead><TableHead>Status</TableHead><TableHead>Started</TableHead><TableHead>Expires</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {subs.map((s) => (
                  <TableRow key={s.id}>
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
                    <TableCell />
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
