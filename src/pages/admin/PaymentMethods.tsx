import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Wallet, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AdminToolbar from "@/components/admin/AdminToolbar";
import { useAdminTable } from "@/hooks/useAdminTable";

export default function AdminPaymentMethods() {
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", type: "", account_title: "", account_number: "", bank_name: "", phone_number: "", qr_image_url: "", instructions: "", is_active: true, display_order: 0 });

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from("payment_methods").select("*").order("display_order");
    setMethods(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const resetForm = () => { setForm({ name: "", type: "", account_title: "", account_number: "", bank_name: "", phone_number: "", qr_image_url: "", instructions: "", is_active: true, display_order: 0 }); setEditing(null); };

  const handleSave = async () => {
    if (!form.name || !form.type) { toast.error("Name and type required"); return; }
    const payload = { ...form, account_number: form.account_number || null, bank_name: form.bank_name || null, phone_number: form.phone_number || null, qr_image_url: form.qr_image_url || null, instructions: form.instructions || null };
    if (editing) {
      const { error } = await supabase.from("payment_methods").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Payment method updated");
    } else {
      const { error } = await supabase.from("payment_methods").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Payment method created");
    }
    setOpen(false); resetForm(); fetchData();
  };

  const handleDelete = async (id: string) => { await supabase.from("payment_methods").delete().eq("id", id); toast.success("Deleted"); fetchData(); };

  const openEdit = (m: any) => { setEditing(m); setForm({ name: m.name, type: m.type, account_title: m.account_title || "", account_number: m.account_number || "", bank_name: m.bank_name || "", phone_number: m.phone_number || "", qr_image_url: m.qr_image_url || "", instructions: m.instructions || "", is_active: m.is_active, display_order: m.display_order }); setOpen(true); };

  const tbl = useAdminTable<any>({
    table: "payment_methods", rows: methods, refresh: fetchData,
    searchKeys: ["name", "type", "bank_name", "account_title"],
    exportColumns: ["name","type","account_title","account_number","bank_name","phone_number","qr_image_url","instructions","is_active","display_order"],
    importPrepare: (r) => (r.name && r.type) ? {
      name: r.name, type: r.type, account_title: r.account_title || null, account_number: r.account_number || null,
      bank_name: r.bank_name || null, phone_number: r.phone_number || null, qr_image_url: r.qr_image_url || null,
      instructions: r.instructions || null, is_active: r.is_active === false ? false : true,
      display_order: Number(r.display_order) || 0,
    } : null,
  });

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2"><Wallet className="h-5 w-5 text-primary" /> Payment Methods ({methods.length})</CardTitle>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add</Button></DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Payment Method</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" /></div>
                <div><Label>Type</Label><Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="bank_transfer, easypaisa..." className="mt-1" /></div>
              </div>
              <div><Label>Account Title</Label><Input value={form.account_title} onChange={(e) => setForm({ ...form, account_title: e.target.value })} className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Account Number</Label><Input value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} className="mt-1" /></div>
                <div><Label>Bank Name</Label><Input value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} className="mt-1" /></div>
              </div>
              <div><Label>Phone Number</Label><Input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} className="mt-1" /></div>
              <div><Label>QR Image URL</Label><Input value={form.qr_image_url} onChange={(e) => setForm({ ...form, qr_image_url: e.target.value })} className="mt-1" /></div>
              <div><Label>Instructions</Label><Textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} rows={3} className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Display Order</Label><Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} className="mt-1" /></div>
                <div className="flex items-center gap-2 mt-6"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><Label>Active</Label></div>
              </div>
              <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Create"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <AdminToolbar searchQuery={tbl.search} onSearchChange={tbl.setSearch} searchPlaceholder="Search payment methods..."
          selectedCount={tbl.selected.size} onBulkDelete={tbl.bulkDelete} onExport={tbl.handleExport} onImport={tbl.handleImport} />
        {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : tbl.filtered.length === 0 ? <p className="text-sm text-muted-foreground">No payment methods.</p> : (
          <Table>
            <TableHeader><TableRow>
              <TableHead className="w-10"><Checkbox checked={tbl.allSelected} onCheckedChange={tbl.toggleAll} /></TableHead>
              <TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {tbl.filtered.map((m) => (
                <TableRow key={m.id} data-state={tbl.selected.has(m.id) ? "selected" : undefined}>
                  <TableCell><Checkbox checked={tbl.selected.has(m.id)} onCheckedChange={() => tbl.toggleOne(m.id)} /></TableCell>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{m.type}</TableCell>
                  <TableCell><span className={`text-xs px-2 py-0.5 rounded-full ${m.is_active ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>{m.is_active ? "Active" : "Inactive"}</span></TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(m)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
