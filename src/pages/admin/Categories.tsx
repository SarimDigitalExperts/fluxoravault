import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Layers, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", slug: "", icon: "", description: "", display_order: 0 });

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from("categories").select("*").order("display_order");
    setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const resetForm = () => { setForm({ name: "", slug: "", icon: "", description: "", display_order: 0 }); setEditing(null); };

  const handleSave = async () => {
    if (!form.name || !form.slug) { toast.error("Name and slug required"); return; }
    if (editing) {
      const { error } = await supabase.from("categories").update(form).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Category updated");
    } else {
      const { error } = await supabase.from("categories").insert(form);
      if (error) { toast.error(error.message); return; }
      toast.success("Category created");
    }
    setOpen(false); resetForm(); fetch();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Category deleted"); fetch();
  };

  const openEdit = (cat: any) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon || "", description: cat.description || "", display_order: cat.display_order });
    setOpen(true);
  };

  return (
    <Card className="glass border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2"><Layers className="h-5 w-5 text-primary" /> Categories ({categories.length})</CardTitle>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add</Button></DialogTrigger>
          <DialogContent className="glass">
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Category</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="mt-1" /></div>
              <div><Label>Icon (Lucide name)</Label><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="mt-1" /></div>
              <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" /></div>
              <div><Label>Display Order</Label><Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} className="mt-1" /></div>
              <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Create"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : categories.length === 0 ? <p className="text-sm text-muted-foreground">No categories yet.</p> : (
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Slug</TableHead><TableHead>Order</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.slug}</TableCell>
                  <TableCell>{c.display_order}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
