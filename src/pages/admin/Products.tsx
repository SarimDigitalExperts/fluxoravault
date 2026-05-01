import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Pencil, Trash2, Package, Save, X, FileText, DollarSign, Tag, Image as ImageIcon,
  Download, Shield, Settings, Search as SearchIcon, Eye, Upload, Link as LinkIcon, Key, QrCode,
  Star, TrendingUp, Globe, Layers
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import AdminToolbar from "@/components/admin/AdminToolbar";
import { useAdminTable } from "@/hooks/useAdminTable";
import ProductVariationsEditor from "@/components/admin/ProductVariationsEditor";

interface ProductForm {
  title: string; slug: string; description: string; price: number;
  original_price: number | null; category: string; category_slug: string;
  image: string; tags: string[]; delivery_type: string; file_url: string;
  file_size: string; download_link: string; qr_image_url: string;
  qr_target_url: string; meta_title: string; meta_description: string;
  status: string; is_featured: boolean; is_trending: boolean;
  requires_approval: boolean; max_downloads_per_user: number;
  download_expiry_days: number | null; os_compatibility: string; version: string;
}

const emptyForm: ProductForm = {
  title: "", slug: "", description: "", price: 0, original_price: null,
  category: "", category_slug: "", image: "", tags: [], delivery_type: "file",
  file_url: "", file_size: "", download_link: "", qr_image_url: "",
  qr_target_url: "", meta_title: "", meta_description: "", status: "published",
  is_featured: false, is_trending: false, requires_approval: true,
  max_downloads_per_user: 5, download_expiry_days: null, os_compatibility: "", version: "1.0",
};

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [tagInput, setTagInput] = useState("");
  const [licenseInput, setLicenseInput] = useState("");
  const [licenseKeys, setLicenseKeys] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [productFile, setProductFile] = useState<File | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts(data || []);
    setLoading(false);
  }, []);

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase.from("categories").select("*").eq("is_active", true).order("display_order");
    setCategories(data || []);
  }, []);

  useEffect(() => { fetchProducts(); fetchCategories(); }, [fetchProducts, fetchCategories]);

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const updateField = (key: keyof ProductForm, value: any) => {
    setForm(prev => {
      const updated = { ...prev, [key]: value };
      if (key === "title" && !editing) updated.slug = generateSlug(value);
      if (key === "category") {
        const cat = categories.find(c => c.name === value);
        if (cat) updated.category_slug = cat.slug;
      }
      return updated;
    });
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) { updateField("tags", [...form.tags, t]); setTagInput(""); }
  };

  const removeTag = (tag: string) => updateField("tags", form.tags.filter(t => t !== tag));

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Image must be under 5MB.", variant: "destructive" });
      return;
    }
    setImageUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, {
        cacheControl: "3600", upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      updateField("image", data.publicUrl);
      toast({ title: "Image uploaded!" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setImageUploading(false);
    }
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setLicenseKeys([]); setProductFile(null); setDialogOpen(true); };

  const openEdit = async (p: any) => {
    setEditing(p);
    setForm({
      title: p.title, slug: p.slug, description: p.description || "", price: p.price,
      original_price: p.original_price, category: p.category, category_slug: p.category_slug,
      image: p.image || "", tags: p.tags || [], delivery_type: p.delivery_type || "file",
      file_url: p.file_url || "", file_size: p.file_size || "", download_link: p.download_link || "",
      qr_image_url: p.qr_image_url || "", qr_target_url: p.qr_target_url || "",
      meta_title: p.meta_title || "", meta_description: p.meta_description || "",
      status: p.status || "published", is_featured: p.is_featured || false,
      is_trending: p.is_trending || false, requires_approval: p.requires_approval ?? true,
      max_downloads_per_user: p.max_downloads_per_user || 5,
      download_expiry_days: p.download_expiry_days, os_compatibility: p.os_compatibility || "",
      version: p.version || "1.0",
    });
    setProductFile(null);
    const { data: keys } = await supabase.from("license_keys").select("key_value").eq("product_id", p.id).eq("is_used", false);
    setLicenseKeys(keys?.map(k => k.key_value) || []);
    setDialogOpen(true);
  };

  const handleFileUpload = async (productId: string) => {
    if (!productFile) return form.file_url;
    const ext = productFile.name.split(".").pop();
    const path = `${productId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("product-files").upload(path, productFile);
    if (error) throw error;
    return path;
  };

  const handleSave = async () => {
    if (!form.title || !form.slug || !form.category) {
      toast({ title: "Error", description: "Title, slug, and category are required.", variant: "destructive" });
      return;
    }

    const payload: any = { ...form };
    delete payload.file_url; // handled separately

    try {
      if (editing) {
        if (productFile) payload.file_url = await handleFileUpload(editing.id);
        else payload.file_url = form.file_url;

        const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
        if (error) throw error;

        // Sync license keys
        if (form.delivery_type === "license_key") {
          await supabase.from("license_keys").delete().eq("product_id", editing.id).eq("is_used", false);
          if (licenseKeys.length > 0) {
            await supabase.from("license_keys").insert(licenseKeys.map(k => ({ product_id: editing.id, key_value: k })));
          }
        }
        toast({ title: "Product updated!" });
      } else {
        payload.file_url = null;
        const { data: newProduct, error } = await supabase.from("products").insert(payload).select().single();
        if (error) throw error;

        if (productFile && newProduct) {
          const fileUrl = await handleFileUpload(newProduct.id);
          await supabase.from("products").update({ file_url: fileUrl }).eq("id", newProduct.id);
        }

        if (form.delivery_type === "license_key" && licenseKeys.length > 0 && newProduct) {
          await supabase.from("license_keys").insert(licenseKeys.map(k => ({ product_id: newProduct.id, key_value: k })));
        }
        toast({ title: "Product created!" });
      }
      setDialogOpen(false);
      fetchProducts();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Product deleted." });
    fetchProducts();
  };

  const discount = form.original_price && form.price ? Math.round((1 - form.price / form.original_price) * 100) : null;

  const baseFiltered = products.filter(p => {
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterStatus !== "all" && p.status !== filterStatus) return false;
    return true;
  });
  const tbl = useAdminTable<any>({
    table: "products", rows: baseFiltered, refresh: fetchProducts,
    searchKeys: ["title","category","slug","tags"],
    exportColumns: ["title","slug","description","price","original_price","category","category_slug","image","status","delivery_type","version","is_featured","is_trending"],
    importPrepare: (r) => (r.title && r.slug && r.category && r.category_slug) ? {
      title: r.title, slug: r.slug, description: r.description || "", price: Number(r.price) || 0,
      original_price: r.original_price ? Number(r.original_price) : null,
      category: r.category, category_slug: r.category_slug, image: r.image || null,
      status: r.status || "published", delivery_type: r.delivery_type || "file",
      version: r.version || "1.0", is_featured: !!r.is_featured, is_trending: !!r.is_trending,
    } : null,
  });
  const filtered = tbl.filtered;

  const statusBadge = (s: string) => {
    if (s === "published") return <Badge className="bg-green-500/10 text-green-600 border-green-200">Published</Badge>;
    if (s === "draft") return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200">Draft</Badge>;
    return <Badge className="bg-muted text-muted-foreground">Hidden</Badge>;
  };

  return (
    <Card className="border-border bg-background">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Products ({products.length})
        </CardTitle>
        <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Add Product</Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Quick title search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <AdminToolbar
          searchQuery={tbl.search} onSearchChange={tbl.setSearch}
          searchPlaceholder="Search across title, category, slug, tags..."
          selectedCount={tbl.selected.size} onBulkDelete={tbl.bulkDelete}
          onExport={tbl.handleExport} onImport={tbl.handleImport}
        />

        {loading ? <p className="text-muted-foreground text-sm">Loading...</p> : filtered.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">No products found.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"><Checkbox checked={tbl.allSelected} onCheckedChange={tbl.toggleAll} /></TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(p => (
                  <TableRow key={p.id} data-state={tbl.selected.has(p.id) ? "selected" : undefined}>
                    <TableCell><Checkbox checked={tbl.selected.has(p.id)} onCheckedChange={() => tbl.toggleOne(p.id)} /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {p.image && <img src={p.image} alt="" className="h-10 w-10 rounded object-cover border" />}
                        <div>
                          <span className="font-medium text-sm">{p.title}</span>
                          <div className="flex gap-1 mt-0.5">
                            {p.is_featured && <Badge variant="outline" className="text-[9px] px-1 py-0">Featured</Badge>}
                            {p.is_trending && <Badge variant="outline" className="text-[9px] px-1 py-0">Trending</Badge>}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.category}</TableCell>
                    <TableCell className="text-sm">PKR {Number(p.price).toLocaleString()}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{p.delivery_type || "file"}</Badge></TableCell>
                    <TableCell>{statusBadge(p.status || "published")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background">
          <DialogHeader>
            <DialogTitle className="text-xl">{editing ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid grid-cols-6 w-full">
                  <TabsTrigger value="basic" className="text-xs"><FileText className="h-3 w-3 mr-1" />Basic</TabsTrigger>
                  <TabsTrigger value="pricing" className="text-xs"><DollarSign className="h-3 w-3 mr-1" />Pricing</TabsTrigger>
                  <TabsTrigger value="variations" className="text-xs"><Layers className="h-3 w-3 mr-1" />Variations</TabsTrigger>
                  <TabsTrigger value="delivery" className="text-xs"><Download className="h-3 w-3 mr-1" />Delivery</TabsTrigger>
                  <TabsTrigger value="access" className="text-xs"><Shield className="h-3 w-3 mr-1" />Access</TabsTrigger>
                  <TabsTrigger value="seo" className="text-xs"><Globe className="h-3 w-3 mr-1" />SEO</TabsTrigger>
                </TabsList>

                {/* BASIC INFO */}
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div>
                    <Label className="text-xs font-medium">Product Title *</Label>
                    <Input value={form.title} onChange={e => updateField("title", e.target.value)} placeholder="e.g. Premium UI Kit" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Slug</Label>
                    <Input value={form.slug} onChange={e => updateField("slug", e.target.value)} placeholder="premium-ui-kit" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Description</Label>
                    <Textarea value={form.description} onChange={e => updateField("description", e.target.value)} placeholder="Describe your product..." rows={4} className="mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium">Category *</Label>
                      <Select value={form.category} onValueChange={v => updateField("category", v)}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Version</Label>
                      <Input value={form.version} onChange={e => updateField("version", e.target.value)} placeholder="1.0" className="mt-1" />
                    </div>
                  </div>
                  {/* Tags */}
                  <div>
                    <Label className="text-xs font-medium">Tags</Label>
                    <div className="flex gap-2 mt-1">
                      <Input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Add tag..." onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())} />
                      <Button type="button" variant="outline" size="sm" onClick={addTag}><Plus className="h-3 w-3" /></Button>
                    </div>
                    {form.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {form.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="gap-1 cursor-pointer" onClick={() => removeTag(tag)}>
                            {tag} <X className="h-3 w-3" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Media */}
                  <div>
                    <Label className="text-xs font-medium">Product Image</Label>
                    <div className="mt-1 space-y-2">
                      {form.image && (
                        <div className="relative inline-block">
                          <img src={form.image} alt="Preview" className="h-32 w-32 rounded-lg object-cover border border-border" />
                          <Button
                            type="button" variant="destructive" size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            onClick={() => updateField("image", "")}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <label className="flex-1">
                          <input
                            type="file" accept="image/*" className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleImageUpload(f);
                              e.target.value = "";
                            }}
                          />
                          <Button type="button" variant="outline" className="w-full cursor-pointer" asChild disabled={imageUploading}>
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              {imageUploading ? "Uploading..." : form.image ? "Replace Image" : "Upload Image"}
                            </span>
                          </Button>
                        </label>
                      </div>
                      <Input
                        value={form.image}
                        onChange={(e) => updateField("image", e.target.value)}
                        placeholder="...or paste image URL"
                        className="text-xs"
                      />
                      <p className="text-[10px] text-muted-foreground">Recommended: 1080×1080px square. Max 5MB.</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium">OS / Compatibility</Label>
                    <Input value={form.os_compatibility} onChange={e => updateField("os_compatibility", e.target.value)} placeholder="Windows, macOS, Linux" className="mt-1" />
                  </div>
                </TabsContent>

                {/* PRICING */}
                <TabsContent value="pricing" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium">Price (PKR) *</Label>
                      <Input type="number" value={form.price} onChange={e => updateField("price", +e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Original Price (PKR)</Label>
                      <Input type="number" value={form.original_price || ""} onChange={e => updateField("original_price", +e.target.value || null)} className="mt-1" />
                    </div>
                  </div>
                  {discount && discount > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                      🎉 Discount: <strong>{discount}% off</strong> (saves PKR {((form.original_price || 0) - form.price).toLocaleString()})
                    </div>
                  )}
                </TabsContent>

                {/* VARIATIONS */}
                <TabsContent value="variations" className="space-y-4 mt-4">
                  <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
                    <strong className="text-foreground">Advanced variations:</strong> Define axes (Duration, Tier, Seats…) and combinations with their own prices, durations, badges, and stock. Buyers will pick from these on the product page.
                  </div>
                  <ProductVariationsEditor productId={editing?.id || null} />
                </TabsContent>

                {/* DELIVERY */}
                <TabsContent value="delivery" className="space-y-4 mt-4">
                  <div>
                    <Label className="text-xs font-medium">Delivery Type</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {[
                        { value: "file", icon: Upload, label: "File Upload" },
                        { value: "link", icon: LinkIcon, label: "External Link" },
                        { value: "license_key", icon: Key, label: "License Key" },
                        { value: "qr_code", icon: QrCode, label: "QR Code" },
                      ].map(dt => (
                        <button key={dt.value} type="button" onClick={() => updateField("delivery_type", dt.value)}
                          className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${form.delivery_type === dt.value ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/30"}`}>
                          <dt.icon className="h-4 w-4" /><span className="text-sm font-medium">{dt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {form.delivery_type === "file" && (
                    <div className="space-y-3 border border-border rounded-lg p-4">
                      <Label className="text-xs font-medium">Upload Product File</Label>
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-colors">
                        <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                        <span className="text-xs text-muted-foreground">{productFile ? productFile.name : (form.file_url || "Click to upload ZIP, PDF, APK...")}</span>
                        <input type="file" className="hidden" onChange={e => { if (e.target.files?.[0]) { setProductFile(e.target.files[0]); updateField("file_size", `${(e.target.files[0].size / 1024 / 1024).toFixed(1)} MB`); } }} />
                      </label>
                      {form.file_size && <p className="text-xs text-muted-foreground">File size: {form.file_size}</p>}
                    </div>
                  )}

                  {form.delivery_type === "link" && (
                    <div className="space-y-3 border border-border rounded-lg p-4">
                      <Label className="text-xs font-medium">Download URL</Label>
                      <Input value={form.download_link} onChange={e => updateField("download_link", e.target.value)} placeholder="https://drive.google.com/..." className="mt-1" />
                    </div>
                  )}

                  {form.delivery_type === "license_key" && (
                    <div className="space-y-3 border border-border rounded-lg p-4">
                      <Label className="text-xs font-medium">License Keys ({licenseKeys.length} available)</Label>
                      <Textarea value={licenseInput} onChange={e => setLicenseInput(e.target.value)} placeholder="Paste keys, one per line..." rows={4} className="mt-1" />
                      <Button type="button" variant="outline" size="sm" onClick={() => {
                        const keys = licenseInput.split("\n").map(k => k.trim()).filter(Boolean);
                        setLicenseKeys(prev => [...prev, ...keys]);
                        setLicenseInput("");
                      }}><Plus className="h-3 w-3 mr-1" /> Add Keys</Button>
                      {licenseKeys.length > 0 && (
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {licenseKeys.map((k, i) => (
                            <div key={i} className="flex items-center justify-between bg-muted/50 rounded px-2 py-1 text-xs font-mono">
                              <span>{k}</span>
                              <button onClick={() => setLicenseKeys(prev => prev.filter((_, j) => j !== i))}><X className="h-3 w-3 text-destructive" /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {form.delivery_type === "qr_code" && (
                    <div className="space-y-3 border border-border rounded-lg p-4">
                      <Label className="text-xs font-medium">QR Target URL</Label>
                      <Input value={form.qr_target_url} onChange={e => updateField("qr_target_url", e.target.value)} placeholder="https://..." className="mt-1" />
                      <Label className="text-xs font-medium">QR Code Image URL (optional)</Label>
                      <Input value={form.qr_image_url} onChange={e => updateField("qr_image_url", e.target.value)} placeholder="https://..." className="mt-1" />
                    </div>
                  )}
                </TabsContent>

                {/* ACCESS CONTROL */}
                <TabsContent value="access" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <p className="text-sm font-medium">Require Admin Approval</p>
                        <p className="text-xs text-muted-foreground">Downloads only after admin approves the order</p>
                      </div>
                      <Switch checked={form.requires_approval} onCheckedChange={v => updateField("requires_approval", v)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-medium">Max Downloads Per User</Label>
                        <Input type="number" value={form.max_downloads_per_user} onChange={e => updateField("max_downloads_per_user", +e.target.value)} className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs font-medium">Download Expiry (days)</Label>
                        <Input type="number" value={form.download_expiry_days || ""} onChange={e => updateField("download_expiry_days", +e.target.value || null)} placeholder="Never" className="mt-1" />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* SEO */}
                <TabsContent value="seo" className="space-y-4 mt-4">
                  <div>
                    <Label className="text-xs font-medium">Meta Title</Label>
                    <Input value={form.meta_title} onChange={e => updateField("meta_title", e.target.value)} placeholder={form.title || "SEO title..."} className="mt-1" />
                    <p className="text-[10px] text-muted-foreground mt-1">{(form.meta_title || form.title).length}/60</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Meta Description</Label>
                    <Textarea value={form.meta_description} onChange={e => updateField("meta_description", e.target.value)} placeholder="Brief description for search engines..." rows={3} className="mt-1" />
                    <p className="text-[10px] text-muted-foreground mt-1">{form.meta_description.length}/160</p>
                  </div>
                  <div className="bg-muted/50 border border-border rounded-lg p-3">
                    <p className="text-xs text-primary font-medium">{form.meta_title || form.title || "Product Title"}</p>
                    <p className="text-[10px] text-green-600">fluxoramart.lovable.app/product/{form.slug || "slug"}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{form.meta_description || form.description || "Product description..."}</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar: Preview + Status */}
            <div className="space-y-4">
              {/* Status Card */}
              <Card className="border-border">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <Label className="text-xs font-medium">Status</Label>
                    <Select value={form.status} onValueChange={v => updateField("status", v)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="hidden">Hidden</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Featured</Label>
                    <Switch checked={form.is_featured} onCheckedChange={v => updateField("is_featured", v)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Trending</Label>
                    <Switch checked={form.is_trending} onCheckedChange={v => updateField("is_trending", v)} />
                  </div>
                </CardContent>
              </Card>

              {/* Preview Card */}
              <Card className="border-border">
                <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground flex items-center gap-1"><Eye className="h-3 w-3" /> Preview</CardTitle></CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="rounded-lg border border-border overflow-hidden">
                    {form.image ? (
                      <img src={form.image} alt="" className="w-full aspect-[4/3] object-cover" />
                    ) : (
                      <div className="w-full aspect-[4/3] bg-muted flex items-center justify-center"><ImageIcon className="h-8 w-8 text-muted-foreground" /></div>
                    )}
                    <div className="p-3">
                      <div className="flex gap-1 mb-1">
                        {form.is_featured && <Badge className="text-[8px] px-1 py-0 bg-primary/10 text-primary border-0">Featured</Badge>}
                        {discount && discount > 0 && <Badge className="text-[8px] px-1 py-0 bg-green-500/10 text-green-600 border-0">-{discount}%</Badge>}
                      </div>
                      <p className="font-medium text-sm truncate">{form.title || "Product Title"}</p>
                      <p className="text-xs text-muted-foreground">{form.category || "Category"}</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-bold text-sm">PKR {form.price.toLocaleString()}</span>
                        {form.original_price && <span className="text-xs text-muted-foreground line-through">PKR {form.original_price.toLocaleString()}</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <Button onClick={() => { updateField("status", "draft"); handleSave(); }} variant="outline" className="w-full">
                  <Save className="h-4 w-4 mr-1" /> Save as Draft
                </Button>
                <Button onClick={handleSave} className="w-full">
                  <Save className="h-4 w-4 mr-1" /> {editing ? "Update" : "Publish"} Product
                </Button>
                <Button variant="ghost" onClick={() => setDialogOpen(false)} className="w-full">
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
