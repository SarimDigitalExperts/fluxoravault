import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/data/products";

interface DBCategory { id: string; name: string; slug: string; }

type SortKey = "newest" | "price_asc" | "price_desc" | "rating" | "popular";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const urlSearch = searchParams.get("search") || "";

  const [search, setSearch] = useState(urlSearch);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<DBCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sort, setSort] = useState<SortKey>("newest");
  const [onSaleOnly, setOnSaleOnly] = useState(false);

  useEffect(() => { setSearch(urlSearch); }, [urlSearch]);

  useEffect(() => {
    const run = async () => {
      const [prodRes, catRes] = await Promise.all([
        supabase.from("products").select("*").eq("is_published", true).order("created_at", { ascending: false }),
        supabase.from("categories").select("id, name, slug").eq("is_active", true).order("display_order"),
      ]);
      if (prodRes.data) {
        const mapped = prodRes.data.map(p => ({
          id: p.id, title: p.title, description: p.description || "", price: Number(p.price),
          originalPrice: p.original_price ? Number(p.original_price) : undefined,
          category: p.category, categorySlug: p.category_slug,
          image: p.image || "/placeholder.svg", tags: p.tags || [],
          rating: p.rating || 0, reviews: p.reviews_count || 0, slug: p.slug,
        }));
        setProducts(mapped);
        const max = Math.max(1000, ...mapped.map(m => m.price));
        const rounded = Math.ceil(max / 500) * 500;
        setMaxPrice(rounded);
        setPriceRange([0, rounded]);
      }
      if (catRes.data) setCategories(catRes.data);
      setLoading(false);
    };
    run();
  }, []);

  // Collect brands (from tags)
  const allBrands = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => (p.tags || []).forEach(t => set.add(t)));
    return Array.from(set).sort().slice(0, 24);
  }, [products]);

  const filtered = useMemo(() => {
    let result = [...products];
    if (activeCategory !== "all") result = result.filter(p => p.categorySlug === activeCategory);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (selectedBrands.length > 0) {
      result = result.filter(p => (p.tags || []).some(t => selectedBrands.includes(t)));
    }
    if (onSaleOnly) result = result.filter(p => p.originalPrice && p.originalPrice > p.price);

    switch (sort) {
      case "price_asc": result.sort((a, b) => a.price - b.price); break;
      case "price_desc": result.sort((a, b) => b.price - a.price); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
      case "popular": result.sort((a, b) => b.reviews - a.reviews); break;
    }
    return result;
  }, [activeCategory, search, products, priceRange, selectedBrands, sort, onSaleOnly]);

  const toggleBrand = (b: string) =>
    setSelectedBrands(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);

  const setCategory = (slug: string) => {
    const next = new URLSearchParams(searchParams);
    if (slug === "all") next.delete("category"); else next.set("category", slug);
    setSearchParams(next);
  };

  const updateSearch = (v: string) => {
    setSearch(v);
    const next = new URLSearchParams(searchParams);
    if (v) next.set("search", v); else next.delete("search");
    setSearchParams(next, { replace: true });
  };

  const resetFilters = () => {
    setPriceRange([0, maxPrice]);
    setSelectedBrands([]);
    setOnSaleOnly(false);
    setSort("newest");
    setSearchParams({});
    setSearch("");
  };

  const activeFilterCount =
    (activeCategory !== "all" ? 1 : 0) +
    (selectedBrands.length) +
    (onSaleOnly ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0);

  const FiltersPanel = (
    <div className="space-y-7">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Categories</h3>
        <div className="space-y-1.5">
          <button
            onClick={() => setCategory("all")}
            className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${activeCategory === "all" ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-muted"}`}
          >All categories</button>
          {categories.map(c => (
            <button key={c.slug} onClick={() => setCategory(c.slug)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${activeCategory === c.slug ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-muted"}`}
            >{c.name}</button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Price range</h3>
        <Slider
          min={0} max={maxPrice} step={50}
          value={priceRange}
          onValueChange={(v) => setPriceRange([v[0], v[1]] as [number, number])}
          className="my-4"
        />
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">PKR {priceRange[0].toLocaleString()}</span>
          <span className="text-muted-foreground">—</span>
          <span className="font-semibold">PKR {priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {allBrands.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Brands & tags</h3>
          <div className="space-y-2 max-h-56 overflow-auto pr-2">
            {allBrands.map(b => (
              <label key={b} className="flex items-center gap-2.5 cursor-pointer text-sm hover:text-primary">
                <Checkbox checked={selectedBrands.includes(b)} onCheckedChange={() => toggleBrand(b)} />
                <span>{b}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Deals</h3>
        <label className="flex items-center gap-2.5 cursor-pointer text-sm">
          <Checkbox checked={onSaleOnly} onCheckedChange={(v) => setOnSaleOnly(!!v)} />
          <span>On sale only</span>
        </label>
      </div>

      {activeFilterCount > 0 && (
        <Button variant="outline" className="w-full rounded-lg" onClick={resetFilters}>
          <X className="h-4 w-4 mr-2" /> Reset filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="container pt-24 pb-16">
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold mb-2">Shop</h1>
        <p className="text-muted-foreground">Browse our collection of premium digital assets</p>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-8">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-auto rounded-2xl border border-border bg-card p-5">
          {FiltersPanel}
        </aside>

        <div>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products, brands, tags..."
                value={search}
                onChange={(e) => updateSearch(e.target.value)}
                className="pl-10 rounded-lg"
              />
            </div>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-full sm:w-[180px] rounded-lg">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Latest</SelectItem>
                <SelectItem value="popular">Most popular</SelectItem>
                <SelectItem value="rating">Top rated</SelectItem>
                <SelectItem value="price_asc">Price: low to high</SelectItem>
                <SelectItem value="price_desc">Price: high to low</SelectItem>
              </SelectContent>
            </Select>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden rounded-lg">
                  <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
                  {activeFilterCount > 0 && <span className="ml-2 bg-primary text-primary-foreground text-[10px] rounded-full px-1.5">{activeFilterCount}</span>}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="overflow-y-auto">
                <SheetHeader className="mb-6"><SheetTitle>Filters</SheetTitle></SheetHeader>
                {FiltersPanel}
              </SheetContent>
            </Sheet>
          </div>

          {/* Active chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {activeCategory !== "all" && (
                <FilterChip label={categories.find(c => c.slug === activeCategory)?.name || activeCategory} onClear={() => setCategory("all")} />
              )}
              {selectedBrands.map(b => (
                <FilterChip key={b} label={b} onClear={() => toggleBrand(b)} />
              ))}
              {onSaleOnly && <FilterChip label="On sale" onClear={() => setOnSaleOnly(false)} />}
              {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                <FilterChip label={`PKR ${priceRange[0]} – ${priceRange[1]}`} onClear={() => setPriceRange([0, maxPrice])} />
              )}
            </div>
          )}

          <div className="text-sm text-muted-foreground mb-4">
            {loading ? "Loading..." : `${filtered.length} ${filtered.length === 1 ? "product" : "products"} found`}
          </div>

          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Loading products...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground rounded-2xl border border-dashed border-border">
              <p className="text-lg mb-2">No products found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <button onClick={onClear} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border bg-card hover:border-primary hover:text-primary transition-colors">
      {label} <X className="h-3 w-3" />
    </button>
  );
}
