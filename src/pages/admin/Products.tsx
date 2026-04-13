import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Package, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type Product = Tables<"products">;

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const { toast } = useToast();

  const emptyForm: TablesInsert<"products"> = {
    title: "", description: "", price: 0, original_price: null,
    category: "", category_slug: "", image: "", tags: [], slug: "",
  };
  const [form, setForm] = useState<TablesInsert<"products">>(emptyForm);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      title: p.title, description: p.description, price: p.price,
      original_price: p.original_price, category: p.category,
      category_slug: p.category_slug, image: p.image, tags: p.tags || [],
      slug: p.slug,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.slug || !form.category) {
      toast({ title: "Error", description: "Title, slug, and category are required.", variant: "destructive" });
      return;
    }

    if (editing) {
      const { error } = await supabase.from("products").update(form).eq("id", editing.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Product updated!" });
    } else {
      const { error } = await supabase.from("products").insert(form);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Product created!" });
    }
    setDialogOpen(false);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Product deleted." });
    fetchProducts();
  };

  return (
    <Card className="glass border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Products ({products.length})
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-1" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg glass-strong">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              <Input placeholder="Description" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} />
                <Input type="number" placeholder="Original Price" value={form.original_price || ""} onChange={(e) => setForm({ ...form, original_price: +e.target.value || null })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                <Input placeholder="Category Slug" value={form.category_slug} onChange={(e) => setForm({ ...form, category_slug: e.target.value })} />
              </div>
              <Input placeholder="Image URL" value={form.image || ""} onChange={(e) => setForm({ ...form, image: e.target.value })} />
              <Input placeholder="Tags (comma-separated)" value={(form.tags || []).join(", ")} onChange={(e) => setForm({ ...form, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost-border" onClick={() => setDialogOpen(false)}>
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-1" /> {editing ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : products.length === 0 ? (
          <p className="text-muted-foreground text-sm">No products yet. Add your first product!</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {p.image && <img src={p.image} alt="" className="h-10 w-10 rounded object-cover" />}
                        <span className="font-medium text-sm">{p.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.category}</TableCell>
                    <TableCell className="text-sm">${Number(p.price).toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {(p.tags || []).map((t) => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{t}</span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
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
