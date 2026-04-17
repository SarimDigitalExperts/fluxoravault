import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Shield, Zap, BadgeCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
}

const ROTATING_HEADLINES = [
  "All Your Digital Assets in One Vault",
  "Premium Tools for Modern Creators",
  "Build Faster. Ship Smarter.",
];

export default function HeroSlideshow() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [slide, setSlide] = useState(0);
  const [headline, setHeadline] = useState(0);

  useEffect(() => {
    supabase
      .from("banners")
      .select("id,title,subtitle,image_url,link_url")
      .eq("is_active", true)
      .eq("position", "hero")
      .order("display_order")
      .then(({ data }) => data && setBanners(data as Banner[]));
  }, []);

  // Rotate slideshow every 5s
  useEffect(() => {
    if (banners.length < 2) return;
    const id = setInterval(() => setSlide((s) => (s + 1) % banners.length), 5000);
    return () => clearInterval(id);
  }, [banners.length]);

  // Rotate headline every 3.5s
  useEffect(() => {
    const id = setInterval(() => setHeadline((h) => (h + 1) % ROTATING_HEADLINES.length), 3500);
    return () => clearInterval(id);
  }, []);

  const current = banners[slide];

  return (
    <section className="relative overflow-hidden pt-28 md:pt-32 pb-16 md:pb-20 bg-gradient-to-br from-primary/5 via-background to-background">
      <div className="absolute top-1/3 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />

      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* LEFT */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-5"
            >
              <Sparkles className="h-3.5 w-3.5" /> Premium Digital Marketplace
            </motion.span>

            {/* Animated rotating headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold leading-[1.1] mb-5 tracking-tight min-h-[3.5em] md:min-h-[3.2em]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={headline}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="block"
                >
                  {ROTATING_HEADLINES[headline].split(" ").map((word, i) => (
                    <motion.span
                      key={`${headline}-${i}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className={`inline-block mr-2 ${
                        word.toLowerCase().includes("vault") ||
                        word.toLowerCase().includes("smarter") ||
                        word.toLowerCase().includes("creators")
                          ? "text-primary"
                          : ""
                      }`}
                    >
                      {word}
                    </motion.span>
                  ))}
                </motion.span>
              </AnimatePresence>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground mb-7 max-w-xl leading-relaxed"
            >
              Premium apps, tools, and resources for creators, freelancers, and professionals.
            </motion.p>

            {/* Animated buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-3 mb-8"
            >
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button asChild size="lg" className="rounded-full px-7 shadow-md hover:shadow-lg">
                  <Link to="/shop">
                    Browse Products <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button asChild size="lg" variant="outline" className="rounded-full px-7">
                  <Link to="/pricing">View Pricing</Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-x-5 gap-y-2 mb-8"
            >
              {[
                { icon: Shield, label: "Secure Payments" },
                { icon: Zap, label: "Instant Access After Approval" },
                { icon: BadgeCheck, label: "Verified Products" },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{b.label}</span>
                </div>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-3 gap-4 max-w-md"
            >
              {[
                { value: "1000+", label: "Assets" },
                { value: "500+", label: "Users" },
                { value: "100+", label: "Sales" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl md:text-3xl font-display font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT — Banner Slideshow */}
          <div className="relative hidden lg:block">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-primary/10 bg-gradient-to-br from-primary/10 to-primary/5">
              <AnimatePresence mode="wait">
                {current ? (
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.7 }}
                    className="absolute inset-0"
                  >
                    {current.image_url && (
                      <img
                        src={current.image_url}
                        alt={current.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="eager"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-2xl font-display font-bold mb-1">{current.title}</h3>
                      {current.subtitle && (
                        <p className="text-sm text-white/85 mb-3 line-clamp-2">{current.subtitle}</p>
                      )}
                      {current.link_url && (
                        <Button asChild size="sm" variant="secondary" className="rounded-full">
                          <Link to={current.link_url}>
                            Explore <ArrowRight className="h-3.5 w-3.5 ml-1" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center text-primary/40"
                  >
                    <Sparkles className="h-20 w-20" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Slide dots */}
              {banners.length > 1 && (
                <div className="absolute bottom-3 right-4 flex gap-1.5 z-10">
                  {banners.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSlide(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === slide ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                      }`}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Floating badges */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute -top-3 -right-3 bg-card border border-border rounded-xl px-3.5 py-2.5 shadow-lg flex items-center gap-2"
            >
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <BadgeCheck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold">Verified</p>
                <p className="text-[10px] text-muted-foreground">Quality assured</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="absolute -bottom-3 -left-3 bg-card border border-border rounded-xl px-3.5 py-2.5 shadow-lg flex items-center gap-2"
            >
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold">Instant Delivery</p>
                <p className="text-[10px] text-muted-foreground">After approval</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
