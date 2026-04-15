import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Heart, ShoppingCart, Star, Download, Shield, Zap, Clock, Package, Monitor, Tag, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/data/products";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [timerEnd] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 12);
    return d;
  });
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, timerEnd.getTime() - Date.now());
      setTimeLeft({ h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timerEnd]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
      if (data) {
        setProduct(data);
        const { data: rel } = await supabase.from("products").select("*")
          .eq("category_slug", data.category_slug).neq("id", data.id).eq("is_published", true).limit(4);
        if (rel) setRelated(rel.map((r: any) => ({
          id: r.id, title: r.title, description: r.description || "",
          price: r.price, originalPrice: r.original_price || undefined,
          category: r.category, categorySlug: r.category_slug,
          image: r.image || "/placeholder.svg", tags: r.tags || [],
          rating: r.rating || 0, reviews: r.reviews_count || 0, slug: r.slug,
        })));
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  if (loading) return <div className="container pt-24 pb-16 text-center text-muted-foreground">Loading...</div>;
  if (!product) return (
    <div className="container pt-24 pb-16 text-center">
      <p className="text-muted-foreground text-lg">Product not found</p>
      <Button asChild className="mt-4"><Link to="/shop">Back to Shop</Link></Button>
    </div>
  );

  const wishlisted = isInWishlist(product.id);
  const discount = product.original_price ? Math.round((1 - product.price / product.original_price) * 100) : null;
  const productForCart: Product = {
    id: product.id, title: product.title, description: product.description || "",
    price: product.price, originalPrice: product.original_price || undefined,
    category: product.category, categorySlug: product.category_slug,
    image: product.image || "/placeholder.svg", tags: product.tags || [],
    rating: product.rating || 0, reviews: product.reviews_count || 0, slug: product.slug,
  };

  const handleBuyNow = () => {
    addToCart(productForCart);
    navigate("/checkout");
  };

  return (
    <div className="container pt-24 pb-16">
      <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] border border-border bg-muted/20">
            <img src={product.image || "/placeholder.svg"} alt={product.title} className="w-full h-full object-cover" />
            {discount && <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">-{discount}%</span>}
            {product.is_featured && <Badge className="absolute top-4 right-4 bg-secondary text-secondary-foreground">Featured</Badge>}
          </div>

          {/* Sale Timer */}
          {discount && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Flash Sale Ends In</span>
              </div>
              <div className="flex gap-3">
                {[
                  { label: "Hours", value: timeLeft.h },
                  { label: "Minutes", value: timeLeft.m },
                  { label: "Seconds", value: timeLeft.s },
                ].map(t => (
                  <div key={t.label} className="bg-background rounded-lg px-4 py-2 text-center border border-border">
                    <span className="text-xl font-bold text-foreground">{String(t.value).padStart(2, "0")}</span>
                    <p className="text-[9px] text-muted-foreground uppercase">{t.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Details */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div>
            <span className="text-xs text-primary font-semibold uppercase tracking-wider">{product.category}</span>
            <h1 className="text-3xl md:text-4xl font-display font-bold mt-1">{product.title}</h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1"><Star className="h-4 w-4 fill-primary text-primary" /><span className="font-medium">{product.rating || 0}</span></div>
            <span className="text-sm text-muted-foreground">({product.reviews_count || 0} reviews)</span>
            {(product.tags || []).map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
            ))}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-display font-bold">PKR {product.price.toLocaleString()}</span>
            {product.original_price && <span className="text-lg text-muted-foreground line-through">PKR {product.original_price.toLocaleString()}</span>}
            {discount && <Badge className="bg-green-500/10 text-green-600 border-green-200">{discount}% OFF</Badge>}
          </div>

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          {/* CTA Buttons */}
          <div className="flex gap-3">
            <Button size="lg" variant="outline" className="flex-1" onClick={() => addToCart(productForCart)}>
              <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
            </Button>
            <Button size="lg" className="flex-1" onClick={handleBuyNow}>
              <Zap className="h-4 w-4 mr-2" /> Buy Now
            </Button>
            <Button variant="outline" size="lg" onClick={() => wishlisted ? removeFromWishlist(product.id) : addToWishlist(productForCart)}>
              <Heart className={`h-4 w-4 ${wishlisted ? "fill-primary text-primary" : ""}`} />
            </Button>
          </div>

          {/* Product Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Download, label: "Instant Download", desc: "After approval" },
              { icon: Shield, label: "Secure Payment", desc: "Manual verification" },
              { icon: Package, label: "Lifetime Access", desc: "One-time purchase" },
              { icon: Monitor, label: product.os_compatibility || "All Platforms", desc: "Compatibility" },
            ].map(f => (
              <div key={f.label} className="rounded-xl p-3 border border-border bg-muted/20">
                <f.icon className="h-4 w-4 text-primary mb-1" />
                <p className="text-xs font-medium">{f.label}</p>
                <p className="text-[10px] text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Product Details */}
          {(product.version || product.file_size) && (
            <div className="border border-border rounded-xl p-4 space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /> Product Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {product.version && <div><span className="text-muted-foreground">Version:</span> {product.version}</div>}
                {product.file_size && <div><span className="text-muted-foreground">File Size:</span> {product.file_size}</div>}
                {product.delivery_type && <div><span className="text-muted-foreground">Delivery:</span> {product.delivery_type}</div>}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Bundle Suggestion */}
      {related.length >= 2 && (
        <section className="mt-16">
          <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-5 w-5 text-secondary" />
              <h2 className="text-xl font-display font-bold">Bundle & Save</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Get this product with related items and save more!</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.slice(0, 2).map(r => (
                <div key={r.id} className="flex items-center gap-3 bg-background rounded-xl p-3 border border-border">
                  <img src={r.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.title}</p>
                    <p className="text-xs text-muted-foreground">PKR {r.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-center bg-primary/5 rounded-xl p-3 border border-primary/20">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">PKR {(product.price + related[0].price + related[1].price).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Bundle Price</p>
                  <Button size="sm" className="mt-2" onClick={() => { addToCart(productForCart); related.slice(0, 2).forEach(r => addToCart(r)); navigate("/cart"); }}>
                    Get Bundle
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-display font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
