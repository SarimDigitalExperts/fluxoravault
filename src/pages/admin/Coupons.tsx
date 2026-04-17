import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Ticket, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AdminToolbar from "@/components/admin/AdminToolbar";
import { useAdminTable } from "@/hooks/useAdminTable";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ code: "", discount_type: "percentage", discount_value: 0, min_order_amount: 0, max_uses: "", expires_at: "", is_active: true });

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const resetForm = () => { setForm({ code: "", discount_type: "percentage", discount_value: 0, min_order_amount: 0, max_uses: "", expires_at: "", is_active: true }); setEditing(null); };

  const handleSave = async () => {
    if (!form.code) { toast.error("Code required"); return; }
    const payload: any = { code: form.code.toUpperCase(), discount_type: form.discount_type, discount_value: form.discount_value, min_order_amount: form.min_order_amount, is_active: form.is_active, max_uses: form.max_uses ? Number(form.max_uses) : null, expires_at: form.expires_at || null };
    if (editing) {
      const { error } = await supabase.from("coupons").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Coupon updated");
    } else {
      const { error } = await supabase.from("coupons").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Coupon created");
    }
    setOpen(false); resetForm(); fetchData();
  };

  const handleDelete = async (id: string) => { await supabase.from("coupons").delete().eq("id", id); toast.success("Deleted"); fetchData(); };

  const openEdit = (c: any) => {
    setEditing(c);
    setForm({ code: c.code, discount_type: c.discount_type, discount_value: Number(c.discount_value), min_order_amount: Number(c.min_order_amount || 0), max_uses: c.max_uses?.toString() || "", expires_at: c.expires_at ? c.expires_at.split("T")[0] : "", is_active: c.is_active });
    setOpen(true);
  };

  const tbl = useAdminTable<any>({
    table: "coupons", rows: coupons, refresh: fetchData,
    searchKeys: ["code", "discount_type"],
    exportColumns: ["code","discount_type","discount_value","min_order_amount","max_uses","expires_at","is_active","used_count"],
    importPrepare: (r) => r.code ? {
      code: String(r.code).toUpperCase(),
      discount_type: r.discount_type || "percentage",
      discount_value: Number(r.discount_value) || 0,
      min_order_amount: Number(r.min_order_amount) || 0,
      max_uses: r.max_uses ? Number(r.max_uses) : null,
      expires_at: r.expires_at || null,
      is_active: r.is_active === false ? false : true,
    } : null,
  });

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2"><Ticket className="h-5 w-5 text-primary" /> Coupons ({coupons.length})</CardTitle>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Coupon</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="mt-1 uppercase" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Type</Label>
                  <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="percentage">Percentage</SelectItem><SelectItem value="fixed">Fixed Amount</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Value</Label><Input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} className="mt-1" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Min Order (PKR)</Label><Input type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: Number(e.target.value) })} className="mt-1" /></div>
                <div><Label>Max Uses</Label><Input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} placeholder="Unlimited" className="mt-1" /></div>
              </div>
              <div><Label>Expires At</Label><Input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className="mt-1" /></div>
              <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Create"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <AdminToolbar searchQuery={tbl.search} onSearchChange={tbl.setSearch} searchPlaceholder="Search coupons..."
          selectedCount={tbl.selected.size} onBulkDelete={tbl.bulkDelete} onExport={tbl.handleExport} onImport={tbl.handleImport} />
        {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : tbl.filtered.length === 0 ? <p className="text-sm text-muted-foreground">No coupons found.</p> : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead className="w-10"><Checkbox checked={tbl.allSelected} onCheckedChange={tbl.toggleAll} /></TableHead>
                <TableHead>Code</TableHead><TableHead>Discount</TableHead><TableHead>Uses</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {tbl.filtered.map((c) => (
                  <TableRow key={c.id} data-state={tbl.selected.has(c.id) ? "selected" : undefined}>
                    <TableCell><Checkbox checked={tbl.selected.has(c.id)} onCheckedChange={() => tbl.toggleOne(c.id)} /></TableCell>
                    <TableCell className="font-mono text-xs">{c.code}</TableCell>
                    <TableCell className="text-sm">{c.discount_type === "percentage" ? `${c.discount_value}%` : `PKR ${Number(c.discount_value).toLocaleString()}`}</TableCell>
                    <TableCell className="text-sm">{c.used_count}/{c.max_uses || "∞"}</TableCell>
                    <TableCell><span className={`text-xs px-2 py-0.5 rounded-full ${c.is_active ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>{c.is_active ? "Active" : "Inactive"}</span></TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
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
