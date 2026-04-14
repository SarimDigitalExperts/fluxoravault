import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/data/products";
import { motion } from "framer-motion";
import {
  ArrowRight, Download, Shield, Zap, Star, Users, Package, Check,
  ChevronDown, Layers, Award, Clock, Globe, Headphones, Lock,
  TrendingUp, Sparkles, Heart,
} from "lucide-react";

const fadeUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

interface DBProduct {
  id: string;
  title: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category: string;
  category_slug: string;
  image: string | null;
  tags: string[] | null;
  rating: number | null;
  reviews_count: number | null;
  slug: string;
}

interface DBCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
}

function toProduct(p: DBProduct): Product {
  return {
    id: p.id,
    title: p.title,
    description: p.description || "",
    price: p.price,
    originalPrice: p.original_price || undefined,
    category: p.category,
    categorySlug: p.category_slug,
    image: p.image || "/placeholder.svg",
    tags: p.tags || [],
    rating: p.rating || 0,
    reviews: p.reviews_count || 0,
    slug: p.slug,
  };
}

const iconMap: Record<string, any> = {
  Layers, Package, Zap, Star, Globe, Shield, Award, Download, Sparkles, Heart,
};

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

  const featured = products.filter(p => p.tags.includes("Featured")).slice(0, 4);
  const trending = products.filter(p => p.tags.includes("Hot")).slice(0, 4);
  const latest = products.slice(0, 8);

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
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="section-padding pt-28 md:pt-36">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div {...fadeUp}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" /> Premium Digital Assets
              </span>
            </motion.div>
            <motion.h1 {...fadeUp} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-display font-extrabold leading-tight mb-6">
              Smart Digital Apps &{" "}
              <span className="text-primary">Softwares</span>
            </motion.h1>
            <motion.p {...fadeUp} transition={{ delay: 0.2 }} className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Discover premium templates, UI kits, icons, fonts, illustrations and digital tools crafted for creators and developers.
            </motion.p>
            <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8">
                <Link to="/shop">Browse Shop <ArrowRight className="h-4 w-4 ml-2" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-8">
                <Link to="/pricing">View Plans</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12">
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
      <section className="section-padding bg-muted/30">
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

      {/* Categories */}
      {categories.length > 0 && (
        <section className="section-padding">
          <div className="container">
            <motion.div {...fadeUp} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">Browse by Category</h2>
              <p className="text-muted-foreground">Find exactly what you need</p>
            </motion.div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat, i) => {
                const Icon = iconMap[cat.icon || ""] || Layers;
                return (
                  <motion.div key={cat.id} {...fadeUp} transition={{ delay: i * 0.05 }}>
                    <Link
                      to={`/shop?category=${cat.slug}`}
                      className="flex flex-col items-center p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all text-center"
                    >
                      <Icon className="h-8 w-8 text-primary mb-3" />
                      <span className="font-display font-semibold text-sm">{cat.name}</span>
                      {cat.description && <span className="text-xs text-muted-foreground mt-1">{cat.description}</span>}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="section-padding bg-muted/30">
          <div className="container">
            <motion.div {...fadeUp} className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-display font-bold">Featured Products</h2>
                <p className="text-muted-foreground text-sm mt-1">Hand-picked premium assets</p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/shop">View All <ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Trending Products */}
      {trending.length > 0 && (
        <section className="section-padding">
          <div className="container">
            <motion.div {...fadeUp} className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-display font-bold">Trending Now</h2>
                <p className="text-muted-foreground text-sm mt-1">Most popular this week</p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/shop">View All <ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trending.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Latest Products */}
      {latest.length > 0 && (
        <section className="section-padding bg-muted/30">
          <div className="container">
            <motion.div {...fadeUp} className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-display font-bold">Latest Additions</h2>
                <p className="text-muted-foreground text-sm mt-1">Fresh assets just added</p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/shop">View All <ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {latest.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="section-padding">
        <div className="container">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground">Get started in 3 simple steps</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "01", title: "Browse & Choose", desc: "Explore our curated collection of premium digital assets" },
              { step: "02", title: "Pay & Verify", desc: "Complete payment using any available method. We verify within hours" },
              { step: "03", title: "Download & Build", desc: "Access your files instantly from your account dashboard" },
            ].map((item, i) => (
              <motion.div key={item.step} {...fadeUp} transition={{ delay: i * 0.1 }} className="text-center p-6">
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-muted/30">
        <div className="container">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">What Our Customers Say</h2>
            <p className="text-muted-foreground">Trusted by thousands of creators worldwide</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} {...fadeUp} transition={{ delay: i * 0.1 }} className="p-6 rounded-xl border border-border bg-card">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 italic">"{t.text}"</p>
                <div>
                  <p className="font-display font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="section-padding">
        <div className="container">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground">Choose a plan that works for you</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: "Starter", price: "$9", desc: "5 downloads/month", features: ["Free assets", "Basic formats", "Email support"] },
              { name: "Pro", price: "$29", desc: "50 downloads/month", features: ["All assets", "Premium formats", "Priority support", "Commercial license"], popular: true },
              { name: "Enterprise", price: "$79", desc: "Unlimited downloads", features: ["Everything in Pro", "Source files", "API access", "Team tools"] },
            ].map((plan, i) => (
              <motion.div key={plan.name} {...fadeUp} transition={{ delay: i * 0.1 }}
                className={`p-7 rounded-xl border bg-card flex flex-col ${plan.popular ? "border-primary shadow-lg" : "border-border"}`}
              >
                {plan.popular && (
                  <span className="text-xs font-bold text-primary mb-3 uppercase tracking-wider">Most Popular</span>
                )}
                <h3 className="font-display font-bold text-xl">{plan.name}</h3>
                <p className="text-3xl font-bold mt-2 mb-1">{plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                <p className="text-sm text-muted-foreground mb-6">{plan.desc}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Button asChild variant={plan.popular ? "default" : "outline"} className="w-full">
                  <Link to="/pricing">Get Started</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-muted/30">
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

      {/* CTA */}
      <section className="section-padding">
        <div className="container">
          <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center bg-primary rounded-2xl p-12 text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
              Join thousands of creators using Signify Vault to build amazing projects.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-base px-8">
                <Link to="/shop">Browse Shop <ArrowRight className="h-4 w-4 ml-2" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/auth">Create Account</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
