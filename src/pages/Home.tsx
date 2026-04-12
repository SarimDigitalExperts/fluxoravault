import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";
import {
  ArrowRight, Zap, Shield, Download, Star, Users, Award, TrendingUp,
  Clock, CheckCircle, Layers, Code, Palette, Rocket, Globe, Heart,
  MessageCircle, Play, Headphones, BookOpen, Gift, Percent, Timer,
  Crown, Lock, RefreshCw, BarChart3, Flame, Eye, ThumbsUp, Mail,
  Smartphone, Monitor, Tablet, MousePointer, ShoppingCart, FileText,
  Box, GraduationCap, Image, Type, Sparkles, Package, Cpu, Wifi,
  CloudDownload, Megaphone, BadgeCheck, CircleDollarSign, LifeBuoy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import LucideIcon from "@/components/LucideIcon";
import { products, categories } from "@/data/products";
import { motion } from "framer-motion";
import { useState } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const stagger = (i: number) => ({ transition: { delay: i * 0.08 } });

export default function Home() {
  const featured = products.slice(0, 4);
  const trending = products.filter((p) => p.tags.includes("Trending"));
  const bestSellers = products.filter((p) => p.tags.includes("Best Seller"));
  const premium = products.filter((p) => p.tags.includes("Premium"));
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const iconMap: Record<string, any> = {
    Palette, FileText, Sparkles, Type, Image, Box, Smartphone, GraduationCap,
  };

  return (
    <div className="relative">
      {/* 1. Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />

        <div className="container relative z-10">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }} className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-4">
              <Rocket className="h-4 w-4" /> Premium Digital Assets
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-[1.08] mb-6">
              Launch Your <br />
              <span className="gradient-text">Creative Orbit</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Discover premium templates, UI kits, icons, fonts, and digital tools. Everything you need to build faster, ship better.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" variant="glow" className="text-base px-8">
                <Link to="/shop">Browse Shop <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="ghost-border" className="text-base px-8">
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
            <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-primary" /> Instant Download</span>
              <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-primary" /> Secure Payment</span>
              <span className="flex items-center gap-1.5"><RefreshCw className="h-4 w-4 text-primary" /> Free Updates</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Stats Bar */}
      <section className="container -mt-8 relative z-20">
        <motion.div {...fadeUp} className="glass-strong rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Package, value: "500+", label: "Digital Products" },
            { icon: Users, value: "12K+", label: "Happy Customers" },
            { icon: Download, value: "50K+", label: "Downloads" },
            { icon: Star, value: "4.9", label: "Average Rating" },
          ].map((s, i) => (
            <motion.div key={s.label} {...stagger(i)} className="flex items-center gap-3 justify-center">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <s.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-display font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 3. Features */}
      <section className="container section-padding">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Zap, title: "Instant Download", desc: "Get your files immediately after purchase" },
            { icon: Shield, title: "Secure Payments", desc: "Safe checkout with multiple payment options" },
            { icon: Download, title: "Lifetime Access", desc: "Download assets anytime, forever" },
          ].map((f, i) => (
            <motion.div key={f.title} {...fadeUp} {...stagger(i)} className="glass rounded-xl p-6 text-center hover-lift">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <f.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Browse Categories */}
      <section className="container section-padding">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold">Browse Categories</h2>
            <p className="text-muted-foreground mt-2">Find exactly what you need</p>
          </div>
          <Link to="/shop" className="text-sm text-primary hover:underline flex items-center gap-1">View All <ArrowRight className="h-3 w-3" /></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat, i) => {
            const CatIcon = iconMap[cat.icon] || Sparkles;
            return (
              <motion.div key={cat.slug} {...fadeUp} {...stagger(i)}>
                <Link
                  to={`/shop?category=${cat.slug}`}
                  className="glass rounded-xl p-6 flex flex-col items-center gap-3 hover:border-primary/30 transition-all group hover-lift"
                >
                  <div className="h-14 w-14 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                    <CatIcon className="h-7 w-7 text-primary" />
                  </div>
                  <span className="font-display font-semibold text-sm">{cat.name}</span>
                  <span className="text-xs text-muted-foreground">{cat.count} items</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 5. Featured Products */}
      <section className="container section-padding">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold">Featured Products</h2>
            <p className="text-muted-foreground mt-2">Hand-picked by our team</p>
          </div>
          <Link to="/shop" className="text-sm text-primary hover:underline flex items-center gap-1">View All <ArrowRight className="h-3 w-3" /></Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* 6. Trending Now */}
      {trending.length > 0 && (
        <section className="container section-padding">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-10 flex items-center gap-3">
            <Flame className="h-8 w-8 text-primary" /> Trending Now
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trending.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* 7. Why Choose Us */}
      <section className="container section-padding">
        <motion.div {...fadeUp} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold">Why Choose <span className="gradient-text">Orbit Assets</span></h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">We're not just another marketplace. Here's what makes us different.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Award, title: "Curated Quality", desc: "Every product is reviewed by our team before publishing" },
            { icon: RefreshCw, title: "Free Updates", desc: "Get free lifetime updates on all purchased products" },
            { icon: Headphones, title: "24/7 Support", desc: "Our team is always here to help you with any issues" },
            { icon: Lock, title: "Secure Files", desc: "All downloads are encrypted and virus-free" },
            { icon: Globe, title: "Global Access", desc: "Download from anywhere in the world, anytime" },
            { icon: CircleDollarSign, title: "Best Prices", desc: "Competitive pricing with regular discounts and deals" },
          ].map((item, i) => (
            <motion.div key={item.title} {...fadeUp} {...stagger(i)} className="glass rounded-xl p-6 hover-lift">
              <item.icon className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-display font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 8. Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="container section-padding">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-10 flex items-center gap-3">
            <Crown className="h-8 w-8 text-primary" /> Best Sellers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* 9. How It Works */}
      <section className="container section-padding">
        <motion.div {...fadeUp} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold">How It Works</h2>
          <p className="text-muted-foreground mt-3">Get started in just 3 simple steps</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: MousePointer, step: "01", title: "Browse & Choose", desc: "Explore our library of premium digital assets and find what you need." },
            { icon: ShoppingCart, step: "02", title: "Add to Cart", desc: "Select your items and proceed to our secure checkout." },
            { icon: CloudDownload, step: "03", title: "Download Instantly", desc: "Get your files immediately after payment. It's that simple." },
          ].map((s, i) => (
            <motion.div key={s.step} {...fadeUp} {...stagger(i)} className="relative text-center">
              <div className="text-7xl font-display font-bold text-primary/10 absolute -top-4 left-1/2 -translate-x-1/2">{s.step}</div>
              <div className="relative z-10 pt-8">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <s.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 10. Premium Banner */}
      <section className="container section-padding">
        <motion.div {...fadeUp} className="relative glass rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-secondary/20" />
          <div className="relative z-10 p-10 md:p-16 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                <Crown className="h-4 w-4" /> Premium Collection
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Unlock Premium Assets</h2>
              <p className="text-muted-foreground mb-6">Get access to our exclusive premium collection with the highest quality digital assets.</p>
              <Button asChild size="lg" variant="glow" className="text-base px-8">
                <Link to="/shop">Explore Premium <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              {[
                { val: "200+", label: "Premium Items" },
                { val: "50%", label: "Avg Savings" },
                { val: "4.9", label: "Rating" },
                { val: "Free", label: "Updates" },
              ].map((s) => (
                <div key={s.label} className="glass rounded-lg p-4">
                  <div className="text-xl font-display font-bold text-primary">{s.val}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* 11. Testimonials */}
      <section className="container section-padding">
        <motion.div {...fadeUp} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold">What Our Customers Say</h2>
          <p className="text-muted-foreground mt-3">Trusted by thousands of creators worldwide</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Sarah M.", role: "UI Designer", text: "The UI kits saved me weeks of work. Absolutely stunning quality and easy to customize.", rating: 5 },
            { name: "James K.", role: "Developer", text: "Best React templates I've found. Clean code, great documentation, and amazing support.", rating: 5 },
            { name: "Aisha R.", role: "Freelancer", text: "I've purchased from many marketplaces, but Orbit Assets consistently delivers the best quality.", rating: 5 },
          ].map((t, i) => (
            <motion.div key={t.name} {...fadeUp} {...stagger(i)} className="glass rounded-xl p-6 hover-lift">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-display font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 12. Product Tabs (New / Hot / Popular) */}
      <section className="container section-padding">
        <motion.div {...fadeUp} className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-display font-bold">Explore Our Collection</h2>
        </motion.div>
        <div className="flex justify-center gap-4 mb-8">
          {["All Products", "New Arrivals", "Hot Deals"].map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeTab === i ? "bg-primary text-primary-foreground" : "glass hover:border-primary/30"}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(activeTab === 0 ? products : activeTab === 1 ? products.filter(p => p.tags.includes("New")) : products.filter(p => p.tags.includes("Hot"))).slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
          {(activeTab === 1 && products.filter(p => p.tags.includes("New")).length === 0) && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>New arrivals coming soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* 13. Flash Sale Banner */}
      <section className="container section-padding">
        <motion.div {...fadeUp} className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 to-destructive/20 border border-primary/20">
          <div className="absolute inset-0 bg-background/40" />
          <div className="relative z-10 p-10 md:p-14 text-center">
            <div className="inline-flex items-center gap-2 text-primary font-semibold mb-4">
              <Timer className="h-5 w-5" /> Flash Sale
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Up to <span className="gradient-text">70% OFF</span></h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">Limited time offer on selected premium products. Don't miss out!</p>
            <div className="flex justify-center gap-4 mb-8">
              {[
                { val: "02", label: "Days" },
                { val: "14", label: "Hours" },
                { val: "36", label: "Min" },
                { val: "52", label: "Sec" },
              ].map((t) => (
                <div key={t.label} className="glass rounded-lg p-3 w-16">
                  <div className="text-2xl font-display font-bold text-primary">{t.val}</div>
                  <div className="text-[10px] text-muted-foreground uppercase">{t.label}</div>
                </div>
              ))}
            </div>
            <Button asChild size="lg" variant="glow" className="text-base px-10">
              <Link to="/shop">Shop the Sale</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* 14. Tools & Technology */}
      <section className="container section-padding">
        <motion.div {...fadeUp} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold">Built for Modern Workflows</h2>
          <p className="text-muted-foreground mt-3">Compatible with all your favorite tools</p>
        </motion.div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {[
            { icon: Code, name: "React" },
            { icon: Layers, name: "Figma" },
            { icon: Palette, name: "Sketch" },
            { icon: Globe, name: "Webflow" },
            { icon: Cpu, name: "Next.js" },
            { icon: FileText, name: "Tailwind" },
          ].map((t, i) => (
            <motion.div key={t.name} {...fadeUp} {...stagger(i)} className="glass rounded-xl p-5 text-center hover-lift">
              <t.icon className="h-8 w-8 text-secondary mx-auto mb-2" />
              <span className="text-xs font-medium">{t.name}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 15. Multi-Platform Support */}
      <section className="container section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Works on Every Platform</h2>
            <p className="text-muted-foreground mb-6">Our assets are designed to work seamlessly across all devices and platforms.</p>
            <div className="space-y-4">
              {[
                { icon: Monitor, title: "Desktop", desc: "Optimized for high-resolution displays" },
                { icon: Tablet, title: "Tablet", desc: "Responsive layouts for tablets" },
                { icon: Smartphone, title: "Mobile", desc: "Mobile-first design approach" },
              ].map((p) => (
                <div key={p.title} className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                    <p.icon className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-sm">{p.title}</h4>
                    <p className="text-xs text-muted-foreground">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div {...fadeUp} className="glass rounded-2xl p-8 text-center">
            <div className="flex justify-center gap-8 items-end">
              <div className="flex flex-col items-center gap-2">
                <Monitor className="h-16 w-16 text-primary opacity-80" />
                <span className="text-xs text-muted-foreground">Desktop</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Tablet className="h-12 w-12 text-secondary opacity-80" />
                <span className="text-xs text-muted-foreground">Tablet</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Smartphone className="h-10 w-10 text-primary opacity-80" />
                <span className="text-xs text-muted-foreground">Mobile</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 16. Premium Products */}
      {premium.length > 0 && (
        <section className="container section-padding">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-10 flex items-center gap-3">
            <Award className="h-8 w-8 text-primary" /> Premium Collection
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {premium.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* 17. Newsletter */}
      <section className="container section-padding">
        <motion.div {...fadeUp} className="glass rounded-2xl p-10 md:p-14 text-center">
          <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">Stay in the Loop</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">Subscribe to get notified about new products, updates, and exclusive deals.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            <Button variant="glow" className="px-6">
              Subscribe <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">No spam. Unsubscribe anytime.</p>
        </motion.div>
      </section>

      {/* 18. Brand Trust Bar */}
      <section className="container section-padding">
        <motion.div {...fadeUp} className="text-center mb-8">
          <p className="text-sm text-muted-foreground uppercase tracking-widest">Trusted by teams at</p>
        </motion.div>
        <div className="flex flex-wrap justify-center gap-10 opacity-40">
          {["Startup Co", "Design Lab", "Tech Corp", "Creative Inc", "Digital Agency"].map((brand) => (
            <span key={brand} className="text-lg font-display font-bold">{brand}</span>
          ))}
        </div>
      </section>

      {/* 19. Feature Comparison */}
      <section className="container section-padding">
        <motion.div {...fadeUp} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold">Free vs Premium</h2>
          <p className="text-muted-foreground mt-3">See what you get with our premium plans</p>
        </motion.div>
        <motion.div {...fadeUp} className="glass rounded-2xl overflow-hidden max-w-2xl mx-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-display">Feature</th>
                <th className="p-4 font-display">Free</th>
                <th className="p-4 font-display text-primary">Premium</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "Basic Assets", free: true, premium: true },
                { feature: "Commercial License", free: false, premium: true },
                { feature: "Source Files", free: false, premium: true },
                { feature: "Priority Support", free: false, premium: true },
                { feature: "Free Updates", free: false, premium: true },
                { feature: "Early Access", free: false, premium: true },
              ].map((row) => (
                <tr key={row.feature} className="border-b border-border/50">
                  <td className="p-4 text-muted-foreground">{row.feature}</td>
                  <td className="p-4 text-center">{row.free ? <CheckCircle className="h-5 w-5 text-primary mx-auto" /> : <span className="text-muted-foreground">—</span>}</td>
                  <td className="p-4 text-center"><CheckCircle className="h-5 w-5 text-primary mx-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </section>

      {/* 20. Video Showcase */}
      <section className="container section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">See It In Action</h2>
            <p className="text-muted-foreground mb-6">Watch how our products can supercharge your creative workflow.</p>
            <ul className="space-y-3">
              {["Quick setup & integration", "Fully customizable components", "Regular updates & new content", "Dedicated support channel"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div {...fadeUp} className="glass rounded-2xl aspect-video flex items-center justify-center cursor-pointer group hover:border-primary/30 transition-all">
            <div className="h-16 w-16 rounded-full bg-primary/20 group-hover:bg-primary/30 flex items-center justify-center transition-colors">
              <Play className="h-8 w-8 text-primary ml-1" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 21. Pricing Tiers */}
      <section className="container section-padding">
        <motion.div {...fadeUp} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold">Simple Pricing</h2>
          <p className="text-muted-foreground mt-3">Choose the plan that works for you</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { name: "Starter", price: "Free", features: ["5 free assets", "Personal use", "Basic support"], highlight: false },
            { name: "Pro", price: "$29/mo", features: ["Unlimited downloads", "Commercial license", "Priority support", "Source files"], highlight: true },
            { name: "Team", price: "$79/mo", features: ["Everything in Pro", "Up to 10 members", "Custom licensing", "Dedicated manager"], highlight: false },
          ].map((plan, i) => (
            <motion.div key={plan.name} {...fadeUp} {...stagger(i)} className={`rounded-2xl p-8 hover-lift ${plan.highlight ? "bg-gradient-to-b from-primary/10 to-secondary/5 border-2 border-primary/30" : "glass"}`}>
              {plan.highlight && <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary mb-3"><Flame className="h-3 w-3" /> Most Popular</span>}
              <h3 className="font-display font-bold text-xl mb-1">{plan.name}</h3>
              <div className="text-3xl font-display font-bold mb-6">{plan.price}</div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Button variant={plan.highlight ? "glow" : "ghost-border"} className="w-full">
                Get Started
              </Button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 22. Social Proof Counter */}
      <section className="container section-padding">
        <motion.div {...fadeUp} className="glass-strong rounded-2xl p-10 md:p-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Eye, value: "2M+", label: "Page Views" },
              { icon: ThumbsUp, value: "98%", label: "Satisfaction" },
              { icon: MessageCircle, value: "5K+", label: "Reviews" },
              { icon: Globe, value: "120+", label: "Countries" },
            ].map((s, i) => (
              <motion.div key={s.label} {...stagger(i)}>
                <s.icon className="h-8 w-8 text-secondary mx-auto mb-3" />
                <div className="text-3xl font-display font-bold">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 23. Recent Blog Posts */}
      <section className="container section-padding">
        <motion.div {...fadeUp} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold">From Our Blog</h2>
          <p className="text-muted-foreground mt-3">Tips, tutorials, and industry insights</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "10 Must-Have UI Kits for 2026", date: "Apr 5, 2026", read: "5 min read", cat: "Design" },
            { title: "How to Choose the Right Font", date: "Mar 28, 2026", read: "3 min read", cat: "Typography" },
            { title: "Building Faster with Templates", date: "Mar 15, 2026", read: "7 min read", cat: "Development" },
          ].map((post, i) => (
            <motion.div key={post.title} {...fadeUp} {...stagger(i)} className="glass rounded-xl overflow-hidden hover-lift group">
              <div className="aspect-video bg-muted/50 flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-muted-foreground/30" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">{post.cat}</span>
                  <span className="text-xs text-muted-foreground">{post.read}</span>
                </div>
                <h3 className="font-display font-semibold text-sm group-hover:text-primary transition-colors">{post.title}</h3>
                <p className="text-xs text-muted-foreground mt-2">{post.date}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 24. Affiliate / Partner */}
      <section className="container section-padding">
        <motion.div {...fadeUp} className="glass rounded-2xl p-10 md:p-14 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Become an Affiliate</h2>
            <p className="text-muted-foreground mb-6">Earn up to 30% commission on every sale you refer. Join our partner program today.</p>
            <div className="flex gap-6 mb-6">
              {[
                { val: "30%", label: "Commission" },
                { val: "30", label: "Day Cookie" },
                { val: "$0", label: "Joining Fee" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-xl font-display font-bold text-primary">{s.val}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
            <Button variant="glow">Join Now <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
          <div className="h-40 w-40 rounded-full bg-primary/10 flex items-center justify-center">
            <Gift className="h-20 w-20 text-primary opacity-60" />
          </div>
        </motion.div>
      </section>

      {/* 25. Guarantee */}
      <section className="container section-padding">
        <motion.div {...fadeUp} className="text-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <BadgeCheck className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">100% Satisfaction Guarantee</h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">Not happy with your purchase? We offer a 30-day money-back guarantee on all products. No questions asked.</p>
          <Button asChild variant="ghost-border" className="px-8">
            <Link to="/about">Learn More</Link>
          </Button>
        </motion.div>
      </section>

      {/* 26. FAQ */}
      <section className="container section-padding">
        <motion.div {...fadeUp} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold">Frequently Asked Questions</h2>
        </motion.div>
        <div className="max-w-2xl mx-auto space-y-3">
          {[
            { q: "What file formats do you offer?", a: "We provide files in multiple formats including Figma, Sketch, SVG, PNG, PSD, and more depending on the product." },
            { q: "Can I use assets for commercial projects?", a: "Yes! All purchases include a commercial license. You can use our assets in unlimited personal and commercial projects." },
            { q: "Do you offer refunds?", a: "We offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund." },
            { q: "How do I download my purchases?", a: "After payment, you'll get instant access to download your files from your account dashboard." },
            { q: "Do you provide updates?", a: "Yes! All products come with free lifetime updates. You'll be notified when new versions are available." },
          ].map((faq, i) => (
            <motion.div key={i} {...fadeUp} className="glass rounded-xl overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full p-5 text-left flex items-center justify-between"
              >
                <span className="font-display font-semibold text-sm">{faq.q}</span>
                <ArrowRight className={`h-4 w-4 text-primary shrink-0 transition-transform ${activeFaq === i ? "rotate-90" : ""}`} />
              </button>
              {activeFaq === i && (
                <div className="px-5 pb-5 text-sm text-muted-foreground">{faq.a}</div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* 27. Coupon Banner */}
      <section className="container section-padding">
        <motion.div {...fadeUp} className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-secondary/20 to-primary/20 border border-secondary/20">
          <div className="absolute inset-0 bg-background/50" />
          <div className="relative z-10 p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Percent className="h-12 w-12 text-secondary" />
              <div>
                <h3 className="text-2xl font-display font-bold">Save 20% Today</h3>
                <p className="text-sm text-muted-foreground">Use code <strong className="text-secondary">ORBIT20</strong> at checkout</p>
              </div>
            </div>
            <Button asChild variant="glow-blue" className="px-8">
              <Link to="/shop">Shop Now</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* 28. Community Section */}
      <section className="container section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Join Our Community</h2>
            <p className="text-muted-foreground mb-6">Connect with thousands of creators, share your work, get feedback, and stay inspired.</p>
            <div className="space-y-4">
              {[
                { icon: Users, title: "12K+ Members", desc: "Active community of designers & developers" },
                { icon: MessageCircle, title: "Weekly Events", desc: "Design critiques, AMAs, and workshops" },
                { icon: Gift, title: "Exclusive Freebies", desc: "Free assets only for community members" },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-3">
                  <f.icon className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-display font-semibold text-sm">{f.title}</div>
                    <div className="text-xs text-muted-foreground">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost-border" className="mt-6 px-6">Join Community <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </motion.div>
          <motion.div {...fadeUp} className="grid grid-cols-2 gap-4">
            {[
              { icon: Megaphone, label: "Announcements" },
              { icon: BookOpen, label: "Tutorials" },
              { icon: LifeBuoy, label: "Help Desk" },
              { icon: Wifi, label: "Live Chat" },
            ].map((c) => (
              <div key={c.label} className="glass rounded-xl p-6 text-center hover-lift">
                <c.icon className="h-8 w-8 text-secondary mx-auto mb-2" />
                <span className="text-xs font-medium">{c.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 29. Latest Additions Marquee */}
      <section className="section-padding overflow-hidden">
        <motion.div {...fadeUp} className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-display font-bold">Just Added</h2>
        </motion.div>
        <div className="flex gap-6 animate-[scroll_20s_linear_infinite]" style={{ width: "max-content" }}>
          {[...products, ...products].map((p, i) => (
            <Link key={`${p.id}-${i}`} to={`/product/${p.slug}`} className="glass rounded-xl p-4 w-64 shrink-0 hover:border-primary/30 transition-all">
              <img src={p.image} alt={p.title} className="w-full aspect-video object-cover rounded-lg mb-3" />
              <h4 className="font-display font-semibold text-sm truncate">{p.title}</h4>
              <p className="text-xs text-muted-foreground">${p.price}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 30. All Categories Grid Large */}
      <section className="container section-padding">
        <motion.div {...fadeUp} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold">Everything You Need</h2>
          <p className="text-muted-foreground mt-3">A complete library of digital creative assets</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat, i) => {
            const CatIcon = iconMap[cat.icon] || Sparkles;
            return (
              <motion.div key={cat.slug} {...fadeUp} {...stagger(i)}>
                <Link to={`/shop?category=${cat.slug}`} className="glass rounded-xl p-8 flex flex-col items-center gap-4 hover:border-primary/30 transition-all group hover-lift">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 group-hover:from-primary/20 group-hover:to-secondary/20 flex items-center justify-center transition-colors">
                    <CatIcon className="h-10 w-10 text-primary" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-display font-semibold">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{cat.count} products</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 31. Download Stats */}
      <section className="container section-padding">
        <motion.div {...fadeUp} className="glass rounded-2xl p-10 md:p-14 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              <span className="gradient-text">50,000+</span> Downloads & Counting
            </h2>
            <p className="text-muted-foreground mb-6">Join the growing community of creators who trust Orbit Assets for their design needs.</p>
            <div className="flex gap-8">
              {[
                { icon: BarChart3, val: "99.9%", label: "Uptime" },
                { icon: Clock, val: "<2s", label: "Download Speed" },
                { icon: Shield, val: "SSL", label: "Encrypted" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <s.icon className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-display font-bold text-sm">{s.val}</div>
                    <div className="text-[10px] text-muted-foreground">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-8xl font-display font-bold text-primary/10">
            <Download className="h-32 w-32" />
          </div>
        </motion.div>
      </section>

      {/* 32. Customer Logos */}
      <section className="container section-padding">
        <motion.div {...fadeUp} className="text-center mb-8">
          <h2 className="text-2xl font-display font-bold mb-2">Loved by Creators Worldwide</h2>
          <p className="text-muted-foreground text-sm">From freelancers to Fortune 500 companies</p>
        </motion.div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
          {["Pixel Studio", "Nova Design", "Cloud Works", "Apex Dev", "Lunar Inc", "Stellar Labs"].map((name, i) => (
            <motion.div key={name} {...fadeUp} {...stagger(i)} className="glass rounded-lg p-4 flex items-center justify-center">
              <span className="font-display font-semibold text-xs text-muted-foreground">{name}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 33. Final CTA */}
      <section className="container section-padding">
        <motion.div {...fadeUp} className="relative glass rounded-2xl p-12 md:p-20 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10" />
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-secondary/10 rounded-full blur-[80px]" />
          <div className="relative z-10">
            <Rocket className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Ready to Create Something Amazing?</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">Join thousands of creators using Orbit Assets to build stunning digital products.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" variant="glow" className="text-base px-10">
                <Link to="/shop">Start Shopping <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="ghost-border" className="text-base px-10">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
