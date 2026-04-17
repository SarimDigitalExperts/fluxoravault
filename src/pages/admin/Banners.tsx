import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Image as ImageIcon, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AdminToolbar from "@/components/admin/AdminToolbar";
import { useAdminTable } from "@/hooks/useAdminTable";

export default function AdminBanners() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", subtitle: "", image_url: "", link_url: "", position: "home_top", is_active: true, display_order: 0 });

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from("banners").select("*").order("display_order");
    setBanners(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const resetForm = () => { setForm({ title: "", subtitle: "", image_url: "", link_url: "", position: "home_top", is_active: true, display_order: 0 }); setEditing(null); };

  const handleSave = async () => {
    if (!form.title) { toast.error("Title required"); return; }
    if (editing) {
      const { error } = await supabase.from("banners").update(form).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Banner updated");
    } else {
      const { error } = await supabase.from("banners").insert(form);
      if (error) { toast.error(error.message); return; }
      toast.success("Banner created");
    }
    setOpen(false); resetForm(); fetchData();
  };

  const handleDelete = async (id: string) => { await supabase.from("banners").delete().eq("id", id); toast.success("Deleted"); fetchData(); };

  const openEdit = (b: any) => { setEditing(b); setForm({ title: b.title, subtitle: b.subtitle || "", image_url: b.image_url || "", link_url: b.link_url || "", position: b.position, is_active: b.is_active, display_order: b.display_order }); setOpen(true); };

  const tbl = useAdminTable<any>({
    table: "banners", rows: banners, refresh: fetchData,
    searchKeys: ["title", "subtitle", "position"],
    exportColumns: ["title","subtitle","image_url","link_url","position","is_active","display_order"],
    importPrepare: (r) => r.title ? {
      title: r.title, subtitle: r.subtitle || null, image_url: r.image_url || null, link_url: r.link_url || null,
      position: r.position || "home_top", is_active: r.is_active === false ? false : true,
      display_order: Number(r.display_order) || 0,
    } : null,
  });

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary" /> Banners ({banners.length})</CardTitle>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Banner</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" /></div>
              <div><Label>Subtitle</Label><Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="mt-1" /></div>
              <div><Label>Image URL</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="mt-1" /></div>
              <div><Label>Link URL</Label><Input value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Position</Label><Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="mt-1" /></div>
                <div><Label>Order</Label><Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} className="mt-1" /></div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                <Label>Active</Label>
              </div>
              <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Create"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <AdminToolbar searchQuery={tbl.search} onSearchChange={tbl.setSearch} searchPlaceholder="Search banners..."
          selectedCount={tbl.selected.size} onBulkDelete={tbl.bulkDelete} onExport={tbl.handleExport} onImport={tbl.handleImport} />
        {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : tbl.filtered.length === 0 ? <p className="text-sm text-muted-foreground">No banners found.</p> : (
          <Table>
            <TableHeader><TableRow>
              <TableHead className="w-10"><Checkbox checked={tbl.allSelected} onCheckedChange={tbl.toggleAll} /></TableHead>
              <TableHead>Title</TableHead><TableHead>Position</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {tbl.filtered.map((b) => (
                <TableRow key={b.id} data-state={tbl.selected.has(b.id) ? "selected" : undefined}>
                  <TableCell><Checkbox checked={tbl.selected.has(b.id)} onCheckedChange={() => tbl.toggleOne(b.id)} /></TableCell>
                  <TableCell className="font-medium">{b.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{b.position}</TableCell>
                  <TableCell><span className={`text-xs px-2 py-0.5 rounded-full ${b.is_active ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>{b.is_active ? "Active" : "Hidden"}</span></TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(b)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
