import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/data/products";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = products;
    if (activeCategory !== "all") result = result.filter((p) => p.categorySlug === activeCategory);
    if (search) result = result.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));
    return result;
  }, [activeCategory, search]);

  return (
    <div className="container pt-24 pb-16">
      <h1 className="text-4xl font-display font-bold mb-2">Shop</h1>
      <p className="text-muted-foreground mb-8">Browse our collection of premium digital assets</p>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSearchParams({})}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${activeCategory === "all" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSearchParams({ category: cat.slug })}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${activeCategory === cat.slug ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg mb-2">No products found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
