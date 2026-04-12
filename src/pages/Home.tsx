import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";
import { ArrowRight, Zap, Shield, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/data/products";
import { motion } from "framer-motion";

export default function Home() {
  const featured = products.slice(0, 4);
  const trending = products.filter((p) => p.tags.includes("Trending"));

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-[128px]" />

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-4">Premium Digital Assets</span>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-[1.1] mb-6">
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
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Zap, title: "Instant Download", desc: "Get your files immediately after purchase" },
            { icon: Shield, title: "Secure Payments", desc: "Safe checkout with multiple payment options" },
            { icon: Download, title: "Lifetime Access", desc: "Download assets anytime, forever" },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-lg p-6 text-center"
            >
              <f.icon className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-display font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-display font-bold">Browse Categories</h2>
          <Link to="/shop" className="text-sm text-primary hover:underline">View All →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/shop?category=${cat.slug}`}
                className="glass rounded-lg p-5 flex flex-col items-center gap-2 hover:border-primary/30 transition-all group"
              >
                <span className="text-3xl">{cat.icon}</span>
                <span className="font-display font-semibold text-sm">{cat.name}</span>
                <span className="text-xs text-muted-foreground">{cat.count} items</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-display font-bold">Featured Products</h2>
          <Link to="/shop" className="text-sm text-primary hover:underline">View All →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Trending */}
      {trending.length > 0 && (
        <section className="container py-16">
          <h2 className="text-3xl font-display font-bold mb-8">🔥 Trending Now</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trending.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container py-16">
        <div className="relative glass rounded-2xl p-12 md:p-16 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Ready to Create Something Amazing?</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">Join thousands of creators using Orbit Assets to build stunning digital products.</p>
            <Button asChild size="lg" variant="glow" className="text-base px-10">
              <Link to="/shop">Start Shopping</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
