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
import { FileText, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AdminToolbar from "@/components/admin/AdminToolbar";
import { useAdminTable } from "@/hooks/useAdminTable";

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", slug: "", excerpt: "", content: "", cover_image: "", is_published: false, tags: "" });

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from("blogs").select("*").order("created_at", { ascending: false });
    setBlogs(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const resetForm = () => { setForm({ title: "", slug: "", excerpt: "", content: "", cover_image: "", is_published: false, tags: "" }); setEditing(null); };

  const handleSave = async () => {
    if (!form.title || !form.slug) { toast.error("Title and slug required"); return; }
    const payload = { title: form.title, slug: form.slug, excerpt: form.excerpt || null, content: form.content, cover_image: form.cover_image || null, is_published: form.is_published, tags: form.tags ? form.tags.split(",").map((t: string) => t.trim()) : [] };
    if (editing) {
      const { error } = await supabase.from("blogs").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Blog updated");
    } else {
      const { error } = await supabase.from("blogs").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Blog created");
    }
    setOpen(false); resetForm(); fetchData();
  };

  const handleDelete = async (id: string) => { await supabase.from("blogs").delete().eq("id", id); toast.success("Deleted"); fetchData(); };

  const openEdit = (b: any) => { setEditing(b); setForm({ title: b.title, slug: b.slug, excerpt: b.excerpt || "", content: b.content, cover_image: b.cover_image || "", is_published: b.is_published, tags: b.tags?.join(", ") || "" }); setOpen(true); };

  const tbl = useAdminTable<any>({
    table: "blogs", rows: blogs, refresh: fetchData,
    searchKeys: ["title", "slug", "excerpt", "tags"],
    exportColumns: ["title","slug","excerpt","content","cover_image","is_published","tags"],
    importPrepare: (r) => (r.title && r.slug) ? {
      title: r.title, slug: r.slug, excerpt: r.excerpt || null, content: r.content || "",
      cover_image: r.cover_image || null,
      is_published: r.is_published === false ? false : true,
      tags: typeof r.tags === "string" ? r.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
    } : null,
  });

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Blog Posts ({blogs.length})</CardTitle>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} Blog Post</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="mt-1" /></div>
              <div><Label>Excerpt</Label><Input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="mt-1" /></div>
              <div><Label>Cover Image URL</Label><Input value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} className="mt-1" /></div>
              <div><Label>Tags (comma separated)</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="mt-1" /></div>
              <div><Label>Content</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={10} className="mt-1" /></div>
              <div className="flex items-center gap-2"><Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} /><Label>Published</Label></div>
              <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Publish"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <AdminToolbar searchQuery={tbl.search} onSearchChange={tbl.setSearch} searchPlaceholder="Search blogs..."
          selectedCount={tbl.selected.size} onBulkDelete={tbl.bulkDelete} onExport={tbl.handleExport} onImport={tbl.handleImport} />
        {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : tbl.filtered.length === 0 ? <p className="text-sm text-muted-foreground">No blogs found.</p> : (
          <Table>
            <TableHeader><TableRow>
              <TableHead className="w-10"><Checkbox checked={tbl.allSelected} onCheckedChange={tbl.toggleAll} /></TableHead>
              <TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {tbl.filtered.map((b) => (
                <TableRow key={b.id} data-state={tbl.selected.has(b.id) ? "selected" : undefined}>
                  <TableCell><Checkbox checked={tbl.selected.has(b.id)} onCheckedChange={() => tbl.toggleOne(b.id)} /></TableCell>
                  <TableCell className="font-medium">{b.title}</TableCell>
                  <TableCell><span className={`text-xs px-2 py-0.5 rounded-full ${b.is_published ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-600"}`}>{b.is_published ? "Published" : "Draft"}</span></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</TableCell>
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
