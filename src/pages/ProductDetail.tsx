import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Heart, ShoppingCart, Star, Download, Shield, Zap, Clock, Package, Monitor, Layers, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";
import type { Product } from "@/data/products";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [timerEnd] = useState(() => { const d = new Date(); d.setHours(d.getHours() + 12); return d; });
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
        const [relRes, revRes] = await Promise.all([
          supabase.from("products").select("*").eq("category_slug", data.category_slug).neq("id", data.id).eq("is_published", true).limit(4),
          supabase.from("reviews").select("*").eq("product_id", data.id).eq("is_approved", true).order("created_at", { ascending: false }),
        ]);
        if (relRes.data) setRelated(relRes.data.map((r: any) => ({
          id: r.id, title: r.title, description: r.description || "", price: r.price,
          originalPrice: r.original_price || undefined, category: r.category, categorySlug: r.category_slug,
          image: r.image || "/placeholder.svg", tags: r.tags || [], rating: r.rating || 0,
          reviews: r.reviews_count || 0, slug: r.slug,
        })));
        if (revRes.data) setReviews(revRes.data);
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  const handleSubmitReview = async () => {
    if (!user) { toast.error("Please sign in to leave a review"); return; }
    if (!newReview.comment.trim()) { toast.error("Please write a comment"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      product_id: product.id, user_id: user.id,
      reviewer_name: user.user_metadata?.display_name || user.email?.split("@")[0] || "User",
      rating: newReview.rating, comment: newReview.comment.trim(),
    });
    if (error) toast.error("Failed to submit review");
    else {
      toast.success("Review submitted!");
      setNewReview({ rating: 5, comment: "" });
      const { data } = await supabase.from("reviews").select("*").eq("product_id", product.id).eq("is_approved", true).order("created_at", { ascending: false });
      if (data) setReviews(data);
    }
    setSubmitting(false);
  };

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

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0";

  return (
    <div className="container pt-24 pb-16">
      <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image / Demo */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden aspect-square border border-border bg-muted/20">
            <img src={product.image || "/placeholder.svg"} alt={product.title} className="w-full h-full object-cover" />
            {discount && <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">-{discount}%</span>}
            {product.is_featured && <Badge className="absolute top-4 right-4 bg-secondary text-secondary-foreground">Featured</Badge>}
          </div>

          {/* Demo / Preview Video */}
          {product.preview_video_url && (
            <div className="rounded-2xl overflow-hidden border border-border bg-black aspect-video">
              {(() => {
                const url = product.preview_video_url as string;
                const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
                const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
                if (ytMatch) {
                  return <iframe src={`https://www.youtube.com/embed/${ytMatch[1]}`} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Demo video" />;
                }
                if (vimeoMatch) {
                  return <iframe src={`https://player.vimeo.com/video/${vimeoMatch[1]}`} className="w-full h-full" allow="autoplay; fullscreen" allowFullScreen title="Demo video" />;
                }
                return <video src={url} controls className="w-full h-full" />;
              })()}
            </div>
          )}

          {product.preview_demo_url && (
            <a href={product.preview_demo_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 text-primary py-3 text-sm font-semibold hover:bg-primary/10 transition-colors">
              <Monitor className="h-4 w-4" /> View Live Demo
            </a>
          )}

          {discount && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Flash Sale Ends In</span>
              </div>
              <div className="flex gap-3">
                {[{ label: "Hours", value: timeLeft.h }, { label: "Minutes", value: timeLeft.m }, { label: "Seconds", value: timeLeft.s }].map(t => (
                  <div key={t.label} className="bg-background rounded-lg px-4 py-2 text-center border border-border">
                    <span className="text-xl font-bold">{String(t.value).padStart(2, "0")}</span>
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
            <div className="flex items-center gap-1"><Star className="h-4 w-4 fill-primary text-primary" /><span className="font-medium">{avgRating}</span></div>
            <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
            {(product.tags || []).map((tag: string) => <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>)}
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-display font-bold">PKR {product.price.toLocaleString()}</span>
            {product.original_price && <span className="text-lg text-muted-foreground line-through">PKR {product.original_price.toLocaleString()}</span>}
            {discount && <Badge className="bg-green-500/10 text-green-600 border-green-200">{discount}% OFF</Badge>}
          </div>
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          <div className="flex gap-3">
            <Button size="lg" variant="outline" className="flex-1" onClick={() => addToCart(productForCart)}>
              <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
            </Button>
            <Button size="lg" className="flex-1" onClick={() => { addToCart(productForCart); navigate("/checkout"); }}>
              <Zap className="h-4 w-4 mr-2" /> Buy Now
            </Button>
            <Button variant="outline" size="lg" onClick={() => wishlisted ? removeFromWishlist(product.id) : addToWishlist(productForCart)}>
              <Heart className={`h-4 w-4 ${wishlisted ? "fill-primary text-primary" : ""}`} />
            </Button>
          </div>

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

          {(product.version || product.file_size) && (
            <div className="border border-border rounded-xl p-4 space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /> Product Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {product.version && <div><span className="text-muted-foreground">Version:</span> {product.version}</div>}
                {product.version_updated_at && <div><span className="text-muted-foreground">Updated:</span> {new Date(product.version_updated_at).toLocaleDateString()}</div>}
                {product.file_size && <div><span className="text-muted-foreground">File Size:</span> {product.file_size}</div>}
                {product.delivery_type && <div><span className="text-muted-foreground">Delivery:</span> {product.delivery_type}</div>}
              </div>
              {product.version_notes && (
                <div className="mt-2 pt-2 border-t border-border">
                  <p className="text-xs font-semibold text-primary mb-1">What's new in {product.version}:</p>
                  <p className="text-xs text-muted-foreground whitespace-pre-line">{product.version_notes}</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Reviews Section */}
      <section className="mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Rating Summary */}
          <div className="rounded-2xl border border-border p-6 bg-gradient-to-br from-primary/5 to-card text-center lg:col-span-1">
            <p className="text-5xl font-display font-extrabold text-primary">{avgRating}</p>
            <div className="flex justify-center gap-0.5 mt-2 mb-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.round(Number(avgRating)) ? "fill-primary text-primary" : "text-muted-foreground/25"}`} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
          </div>

          {/* Distribution */}
          <div className="rounded-2xl border border-border p-6 bg-card lg:col-span-2">
            <h3 className="text-sm font-semibold mb-4">Rating Distribution</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(star => {
                const count = reviews.filter(r => r.rating === star).length;
                const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-xs font-medium w-8 flex items-center gap-0.5">{star}<Star className="h-3 w-3 fill-primary text-primary" /></span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold">Customer Reviews</h2>
        </div>

        {/* Write Review */}
        <div className="rounded-2xl border border-border p-6 mb-8 bg-card">
          <h3 className="font-semibold mb-1">Share your experience</h3>
          <p className="text-xs text-muted-foreground mb-4">Help others by leaving a thoughtful review</p>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-medium text-muted-foreground mr-1">Your rating:</span>
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} onClick={() => setNewReview(r => ({ ...r, rating: s }))} className="focus:outline-none hover:scale-110 transition-transform">
                <Star className={`h-6 w-6 transition-colors ${s <= newReview.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
              </button>
            ))}
          </div>
          <Textarea placeholder="What did you like or dislike? How did the product perform?" value={newReview.comment} onChange={e => setNewReview(r => ({ ...r, comment: e.target.value }))} className="mb-3" rows={4} />
          <Button onClick={handleSubmitReview} disabled={submitting}>
            <Send className="h-4 w-4 mr-2" /> {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </div>

        {/* Review List */}
        {reviews.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-border">
            <Star className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground font-medium">No reviews yet</p>
            <p className="text-xs text-muted-foreground mt-1">Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map(r => (
              <div key={r.id} className="rounded-2xl border border-border p-5 bg-card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center text-sm font-bold shadow-sm">
                      {r.reviewer_name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{r.reviewer_name}</p>
                      <p className="text-[11px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px] px-2 py-0.5 rounded-md">Verified</Badge>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-primary text-primary" : "text-muted-foreground/20"}`} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>

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
