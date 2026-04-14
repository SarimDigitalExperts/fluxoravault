import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Heart, ShoppingCart, Star, Download, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/data/products";

export default function ProductDetail() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
      if (data) {
        const p: Product = {
          id: data.id, title: data.title, description: data.description || "",
          price: data.price, originalPrice: data.original_price || undefined,
          category: data.category, categorySlug: data.category_slug,
          image: data.image || "/placeholder.svg", tags: data.tags || [],
          rating: data.rating || 0, reviews: data.reviews_count || 0, slug: data.slug,
        };
        setProduct(p);
        const { data: rel } = await supabase.from("products").select("*")
          .eq("category_slug", data.category_slug).neq("id", data.id).eq("is_published", true).limit(4);
        if (rel) setRelated(rel.map(r => ({
          id: r.id, title: r.title, description: r.description || "",
          price: r.price, originalPrice: r.original_price || undefined,
          category: r.category, categorySlug: r.category_slug,
          image: r.image || "/placeholder.svg", tags: r.tags || [],
          rating: r.rating || 0, reviews: r.reviews_count || 0, slug: r.slug,
        })));
      }
      setLoading(false);
    };
    fetch();
  }, [slug]);

  if (loading) return <div className="container pt-24 pb-16 text-center text-muted-foreground">Loading...</div>;

  if (!product) {
    return (
      <div className="container pt-24 pb-16 text-center">
        <p className="text-muted-foreground text-lg">Product not found</p>
        <Button asChild className="mt-4"><Link to="/shop">Back to Shop</Link></Button>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

  return (
    <div className="container pt-24 pb-16">
      <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to Shop
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="relative rounded-xl overflow-hidden aspect-[4/3] border border-border">
          <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
          {discount && <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">-{discount}%</span>}
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <span className="text-xs text-primary font-semibold uppercase tracking-wider">{product.category}</span>
          <h1 className="text-3xl md:text-4xl font-display font-bold mt-2 mb-4">{product.title}</h1>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1"><Star className="h-4 w-4 fill-primary text-primary" /><span className="font-medium">{product.rating}</span></div>
            <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
            {product.tags.map((tag) => (
              <span key={tag} className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">{tag}</span>
            ))}
          </div>
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-display font-bold">PKR {product.price.toLocaleString()}</span>
            {product.originalPrice && <span className="text-lg text-muted-foreground line-through">PKR {product.originalPrice.toLocaleString()}</span>}
          </div>
          <p className="text-muted-foreground mb-8 leading-relaxed">{product.description}</p>
          <div className="flex gap-3 mb-8">
            <Button size="lg" className="flex-1" onClick={() => addToCart(product)}><ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart</Button>
            <Button variant="outline" size="lg" onClick={() => wishlisted ? removeFromWishlist(product.id) : addToWishlist(product)}>
              <Heart className={`h-4 w-4 ${wishlisted ? "fill-primary text-primary" : ""}`} />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[{ icon: Download, label: "Instant Download" }, { icon: Shield, label: "Secure Payment" }, { icon: Zap, label: "Lifetime Access" }].map((f) => (
              <div key={f.label} className="rounded-lg p-3 text-center border border-border bg-muted/30">
                <f.icon className="h-5 w-5 text-primary mx-auto mb-1" /><span className="text-[10px] text-muted-foreground">{f.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-display font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
