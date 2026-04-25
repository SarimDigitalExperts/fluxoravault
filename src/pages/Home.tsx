import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/data/products";
import { motion } from "framer-motion";
import {
  ArrowRight, Download, Shield, Zap, Star, Users, Package, Check,
  ChevronDown, Layers, Award, Clock, Globe, Headphones, Lock,
  TrendingUp, Sparkles, Heart, ChevronLeft, ChevronRight, Search, BadgeCheck,
} from "lucide-react";
import HeroSlideshow from "@/components/HeroSlideshow";
import CategoriesRail from "@/components/CategoriesRail";
import { plans as pricingPlans } from "@/data/plans";

const fadeUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

interface DBProduct {
  id: string; title: string; description: string | null; price: number;
  original_price: number | null; category: string; category_slug: string;
  image: string | null; tags: string[] | null; rating: number | null;
  reviews_count: number | null; slug: string;
}

interface DBCategory {
  id: string; name: string; slug: string; icon: string | null; description: string | null;
}

function toProduct(p: DBProduct): Product {
  return {
    id: p.id, title: p.title, description: p.description || "", price: p.price,
    originalPrice: p.original_price || undefined, category: p.category,
    categorySlug: p.category_slug, image: p.image || "/placeholder.svg",
    tags: p.tags || [], rating: p.rating || 0, reviews: p.reviews_count || 0, slug: p.slug,
  };
}

const iconMap: Record<string, any> = {
  Layers, Package, Zap, Star, Globe, Shield, Award, Download, Sparkles, Heart,
};

function ProductCarousel({ products, title, subtitle }: { products: Product[]; title: string; subtitle: string }) {
  const [scrollIndex, setScrollIndex] = useState(0);
  const maxIndex = Math.max(0, products.length - 4);
  const prev = () => setScrollIndex(i => Math.max(0, i - 1));
  const next = () => setScrollIndex(i => Math.min(maxIndex, i + 1));

  if (products.length === 0) return null;

  return (
    <section className="section-padding">
      <div className="container">
        <motion.div {...fadeUp} className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-display font-bold">{title}</h2>
            <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prev} disabled={scrollIndex === 0} className="h-9 w-9 rounded-full border border-border flex items-center justify-center hover:border-primary disabled:opacity-30 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={next} disabled={scrollIndex >= maxIndex} className="h-9 w-9 rounded-full border border-border flex items-center justify-center hover:border-primary disabled:opacity-30 transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
            <Button variant="outline" asChild className="ml-2 hidden sm:inline-flex">
              <Link to="/shop">View All <ArrowRight className="h-4 w-4 ml-1" /></Link>
            </Button>
          </div>
        </motion.div>
        <div className="overflow-hidden hidden lg:block">
          <div
            className="flex gap-6 transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${scrollIndex * (100 / 4 + 1.5)}%)` }}
          >
            {products.map(p => (
              <div key={p.id} className="min-w-[calc(25%-18px)] max-w-[calc(25%-18px)] flex-shrink-0">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
        {/* Mobile/tablet: horizontally scrollable cards */}
        <div className="lg:hidden -mx-4 px-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
          <div className="flex gap-4 pb-2">
            {products.map(p => (
              <div key={p.id} className="min-w-[75%] sm:min-w-[45%] snap-start">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// CategoriesRow replaced by reusable <CategoriesRail /> component

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<DBCategory[]>([]);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [prodRes, catRes] = await Promise.all([
        supabase.from("products").select("*").eq("is_published", true).order("created_at", { ascending: false }),
        supabase.from("categories").select("*").eq("is_active", true).order("display_order"),
      ]);
      if (prodRes.data) setProducts(prodRes.data.map(toProduct));
      if (catRes.data) setCategories(catRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const featured = products.filter(p => p.tags.includes("Featured")).slice(0, 8);
  const trending = products.filter(p => p.tags.includes("Hot") || p.tags.includes("Trending")).slice(0, 8);
  const bestSellers = products.filter(p => p.tags.includes("Best Seller")).slice(0, 8);
  const latest = products.slice(0, 8);
  const newProducts = products.filter(p => p.tags.includes("New")).slice(0, 8);

  const stats = [
    { label: "Products", value: `${products.length}+`, icon: Package },
    { label: "Happy Customers", value: "2,500+", icon: Users },
    { label: "Downloads", value: "15K+", icon: Download },
    { label: "Rating", value: "4.9", icon: Star },
  ];

  const features = [
    { icon: Download, title: "Instant Download", desc: "Get your files immediately after purchase" },
    { icon: Shield, title: "Secure Payment", desc: "Your transactions are safe and protected" },
    { icon: Zap, title: "Lifetime Access", desc: "Buy once, access forever with free updates" },
    { icon: Headphones, title: "24/7 Support", desc: "Our team is always here to help you" },
    { icon: Lock, title: "Licensed Assets", desc: "All assets come with commercial licensing" },
    { icon: TrendingUp, title: "Regular Updates", desc: "New assets added weekly to our collection" },
  ];

  const faqs = [
    { q: "How do I download after purchase?", a: "After your payment is verified, downloads appear in your account dashboard. You can download up to 5 times per purchase." },
    { q: "What payment methods do you accept?", a: "We accept Bank Transfer, Easypaisa, SadaPay, and QR payments. PayPal and Google Pay coming soon!" },
    { q: "Can I use assets for commercial projects?", a: "Yes! All our assets come with a commercial license. Check the specific plan for details." },
    { q: "Do you offer refunds?", a: "Since we sell digital products, refunds are handled on a case-by-case basis. Contact support within 24 hours of purchase." },
    { q: "How long does order verification take?", a: "Orders are typically verified within 1-6 hours during business hours." },
  ];

  const testimonials = [
    { name: "Sarah M.", role: "UI Designer", text: "The quality of templates from Signify Vault is outstanding. Saved me weeks of work!", rating: 5 },
    { name: "Ahmed K.", role: "Developer", text: "Best digital assets store I've used. Great support and instant delivery.", rating: 5 },
    { name: "Lisa T.", role: "Freelancer", text: "Premium quality at affordable prices. The lifetime access is a game changer.", rating: 5 },
    { name: "Usman R.", role: "Agency Owner", text: "Our go-to marketplace for digital assets. The enterprise plan is worth every rupee.", rating: 5 },
    { name: "Fatima S.", role: "Content Creator", text: "Amazing collection and super fast delivery. Highly recommend!", rating: 5 },
    { name: "David L.", role: "Startup Founder", text: "Signify Vault helped us launch our product 3x faster. Incredible value.", rating: 5 },
  ];

  return (
    <div className="min-h-screen">
      {/* HERO — slideshow + animated */}
      <HeroSlideshow />

      {/* Stats */}
      <section className="py-12 border-y border-border bg-muted/20">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div key={s.label} {...fadeUp} transition={{ delay: i * 0.1 }} className="text-center p-6 rounded-xl border border-border bg-card">
                <s.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-display font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding">
        <div className="container">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">Why Choose <span className="text-primary">Signify Vault</span></h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Everything you need in one platform</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} {...fadeUp} transition={{ delay: i * 0.08 }} className="p-6 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories — horizontal scroll rail */}
      {categories.length > 0 && (
        <CategoriesRail
          categories={categories}
          countFor={(slug) => products.filter((p) => p.categorySlug === slug).length}
        />
      )}

      {/* Product Carousels */}
      <ProductCarousel products={featured} title="Featured Products" subtitle="Hand-picked premium assets" />
      
      <div className="bg-muted/30">
        <ProductCarousel products={trending} title="Trending Now" subtitle="Most popular this week" />
      </div>

      <ProductCarousel products={bestSellers} title="Best Sellers" subtitle="Top-rated by our customers" />

      <div className="bg-muted/30">
        <ProductCarousel products={newProducts} title="New Arrivals" subtitle="Fresh assets just added" />
      </div>

      <ProductCarousel products={latest} title="Latest Products" subtitle="Recently added to our collection" />

      {/* How It Works */}
      <section className="section-padding bg-muted/30 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-72 w-[44rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="container relative">
          <motion.div {...fadeUp} className="text-center mb-14 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-2">
              <Sparkles className="h-3 w-3" /> Simple process
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold mb-3">How It <span className="italic text-primary">Works</span></h2>
            <p className="text-muted-foreground">From discovery to download in just a few minutes — zero friction, zero stress.</p>
          </motion.div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {/* connecting dotted line (desktop) */}
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px border-t-2 border-dashed border-primary/30" />

            {[
              { step: "01", title: "Browse & Choose", desc: "Explore our curated collection of premium digital assets across every category.", icon: Search },
              { step: "02", title: "Pay & Verify", desc: "Complete checkout with any payment method. We verify within hours, around the clock.", icon: Shield },
              { step: "03", title: "Download & Build", desc: "Access your files instantly from your dashboard with lifetime updates included.", icon: Download },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                {...fadeUp}
                transition={{ delay: i * 0.12 }}
                className="relative group"
              >
                <div className="relative rounded-2xl border border-border bg-card p-7 text-center hover:-translate-y-1 hover:shadow-xl hover:border-primary/40 transition-all duration-300">
                  {/* Step badge */}
                  <div className="relative mx-auto mb-5 w-20 h-20">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-secondary opacity-20 blur-md group-hover:opacity-40 transition-opacity" />
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground flex items-center justify-center shadow-lg">
                      <item.icon className="h-8 w-8" />
                    </div>
                    <span className="absolute -top-1 -right-1 h-7 w-7 rounded-full bg-card border-2 border-primary text-primary text-[11px] font-extrabold flex items-center justify-center">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding relative overflow-hidden">
        <div className="container relative">
          <motion.div {...fadeUp} className="text-center mb-14 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-2">
              <Heart className="h-3 w-3 fill-primary" /> Loved worldwide
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold mb-3">
              What Our <span className="italic text-primary">Customers</span> Say
            </h2>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <span className="text-sm font-semibold">4.9/5</span>
              <span className="text-sm text-muted-foreground">from 2,500+ reviews</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((t, i) => {
              const initials = t.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
              return (
                <motion.div
                  key={t.name}
                  {...fadeUp}
                  transition={{ delay: i * 0.08 }}
                  className="group relative p-7 rounded-2xl border border-border bg-card hover:-translate-y-1 hover:shadow-xl hover:border-primary/30 transition-all duration-300 overflow-hidden"
                >
                  {/* big quote mark */}
                  <span className="absolute top-3 right-4 text-7xl font-display font-extrabold text-primary/10 leading-none select-none">"</span>

                  <div className="flex gap-0.5 mb-4 relative">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/80 mb-6 leading-relaxed relative">"{t.text}"</p>
                  <div className="flex items-center gap-3 relative pt-4 border-t border-border">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-md">
                      {initials}
                    </div>
                    <div>
                      <p className="font-display font-bold text-sm leading-tight">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                    <BadgeCheck className="h-4 w-4 text-primary ml-auto" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="section-padding bg-muted/30">
        <div className="container">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground">Choose a plan that works for you</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div key={plan.name} {...fadeUp} transition={{ delay: i * 0.1 }}
                className={`p-7 rounded-xl border bg-card flex flex-col ${plan.featured ? "border-primary shadow-lg" : "border-border"}`}
              >
                {plan.featured && (
                  <span className="text-xs font-bold text-primary mb-3 uppercase tracking-wider">Most Popular</span>
                )}
                <h3 className="font-display font-bold text-xl">{plan.name}</h3>
                <p className="text-3xl font-bold mt-2 mb-1">PKR {plan.price.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">{plan.period}</span></p>
                <p className="text-sm text-muted-foreground mb-6">{plan.shortDesc}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.slice(0, 5).map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Button asChild variant={plan.featured ? "default" : "outline"} className="w-full">
                  <Link to="/pricing">Get Started</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding">
        <div className="container max-w-3xl">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Everything you need to know</p>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-display font-semibold text-sm">{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${activeFaq === i ? "rotate-180" : ""}`} />
                </button>
                {activeFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — Ready to get started + Newsletter */}
      <section className="section-padding">
        <div className="container">
          <motion.div
            {...fadeUp}
            className="relative max-w-6xl mx-auto rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-primary to-secondary text-primary-foreground shadow-2xl"
          >
            {/* decorative blobs */}
            <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-secondary/40 blur-3xl" />
            {/* dot grid */}
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                backgroundImage: "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />

            <div className="relative grid md:grid-cols-2 gap-10 p-8 md:p-14 items-center">
              {/* Left: heading + CTAs */}
              <div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 mb-4">
                  <Sparkles className="h-3 w-3" /> Join 2,500+ creators
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-extrabold leading-tight mb-4">
                  Ready to <span className="italic">build</span> something amazing?
                </h2>
                <p className="text-primary-foreground/90 mb-7 max-w-md">
                  Get instant access to premium templates, tools and digital assets. New drops every week.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild size="lg" variant="secondary" className="text-base px-7 font-semibold shadow-lg">
                    <Link to="/shop">Browse Shop <ArrowRight className="h-4 w-4 ml-2" /></Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="text-base px-7 font-semibold border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
                  >
                    <Link to="/auth">Create Account</Link>
                  </Button>
                </div>
              </div>

              {/* Right: newsletter card */}
              <div className="relative">
                <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6 md:p-7 shadow-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <BadgeCheck className="h-5 w-5" />
                    <h3 className="font-display font-bold text-lg">Get 10% off your first order</h3>
                  </div>
                  <p className="text-sm text-primary-foreground/85 mb-5">
                    Subscribe to our newsletter for fresh drops, deals and free assets — straight to your inbox.
                  </p>
                  <form
                    onSubmit={(e) => { e.preventDefault(); }}
                    className="flex flex-col sm:flex-row gap-2"
                  >
                    <input
                      type="email"
                      required
                      placeholder="you@email.com"
                      className="flex-1 h-11 rounded-md px-4 text-sm bg-white/95 text-foreground placeholder:text-muted-foreground border border-white/40 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                    <Button
                      type="submit"
                      size="lg"
                      variant="secondary"
                      className="h-11 px-5 font-semibold whitespace-nowrap shadow-md"
                    >
                      Subscribe
                    </Button>
                  </form>
                  <div className="flex items-center gap-4 mt-4 text-[11px] text-primary-foreground/80">
                    <span className="inline-flex items-center gap-1"><Lock className="h-3 w-3" /> No spam, ever</span>
                    <span className="inline-flex items-center gap-1"><Zap className="h-3 w-3" /> Unsubscribe anytime</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
