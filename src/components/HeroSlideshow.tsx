import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Play, Star, Zap, Shield, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
}

const MARQUEE_TAGS = [
  "WordPress", "React", "UI Kits", "Mobile Apps", "Dashboards",
  "Landing Pages", "Plugins", "Tailwind", "Figma", "Icons", "SaaS",
];

export default function HeroSlideshow() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    supabase
      .from("banners")
      .select("id,title,subtitle,image_url,link_url")
      .eq("is_active", true)
      .eq("position", "hero")
      .order("display_order")
      .then(({ data }) => data && setBanners(data as Banner[]));
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const id = setInterval(() => setSlide((s) => (s + 1) % banners.length), 4500);
    return () => clearInterval(id);
  }, [banners.length]);

  const current = banners[slide];

  return (
    <section className="relative overflow-hidden pt-24 md:pt-28 pb-0 bg-background">
      {/* Subtle grid bg */}
      <div
        className="absolute inset-0 opacity-[0.04] -z-10"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="absolute -top-32 right-1/4 w-[500px] h-[500px] bg-primary/15 rounded-full blur-3xl -z-10" />
      <div className="absolute -bottom-40 -left-20 w-[420px] h-[420px] bg-secondary/10 rounded-full blur-3xl -z-10" />

      <div className="container">
        {/* Top eyebrow strip */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-10 text-xs text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="font-mono uppercase tracking-widest">New drops every week</span>
          </div>
          <div className="hidden md:flex items-center gap-5">
            <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 fill-primary text-primary" /> 4.9 rated</span>
            <span className="flex items-center gap-1.5"><Download className="h-3.5 w-3.5 text-primary" /> 15k+ downloads</span>
            <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-primary" /> Verified vault</span>
          </div>
        </motion.div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* LEFT — editorial headline */}
          <div className="lg:col-span-7">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-display font-black tracking-tight leading-[0.95] text-[3rem] sm:text-[4rem] md:text-[5.5rem] lg:text-[6.2rem]"
            >
              Build
              <br />
              <span className="inline-flex items-center">
                <span className="text-primary italic font-display">faster</span>
                <span className="mx-3 inline-block h-3 w-3 rounded-full bg-primary/30 align-middle" />
              </span>
              <br />
              ship<span className="text-muted-foreground/50">.</span>{" "}
              <span className="relative inline-block">
                smarter
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="absolute -bottom-1 left-0 right-0 h-2 bg-primary/30 origin-left -z-10"
                />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-7 max-w-lg text-base md:text-lg text-muted-foreground leading-relaxed"
            >
              A curated vault of premium themes, plugins, UI kits and source files —
              hand-picked for designers, developers and indie founders.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Button asChild size="lg" className="rounded-full px-7 h-12 text-sm shadow-lg shadow-primary/20">
                <Link to="/shop">
                  Explore the vault <ArrowUpRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="rounded-full px-5 h-12 text-sm group">
                <Link to="/pricing">
                  <span className="h-8 w-8 rounded-full bg-foreground text-background flex items-center justify-center mr-2 group-hover:bg-primary transition-colors">
                    <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                  </span>
                  See pricing
                </Link>
              </Button>
            </motion.div>

            {/* Tiny stat row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-12 flex items-center gap-8 border-t border-border pt-6 max-w-md"
            >
              {[
                { v: "1k+", l: "Assets" },
                { v: "500+", l: "Creators" },
                { v: "24/7", l: "Support" },
              ].map((s) => (
                <div key={s.l}>
                  <p className="font-display font-extrabold text-2xl">{s.v}</p>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT — dark feature card */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, rotate: 1 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative rounded-[28px] overflow-hidden bg-foreground text-background p-1.5 shadow-2xl shadow-foreground/20"
            >
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-background/30" />
                <span className="h-2.5 w-2.5 rounded-full bg-background/30" />
                <span className="h-2.5 w-2.5 rounded-full bg-background/30" />
                <span className="ml-3 text-[10px] font-mono uppercase tracking-widest text-background/50">
                  signifyvault / preview
                </span>
              </div>

              {/* Banner image preview */}
              <div className="relative aspect-[4/5] sm:aspect-[5/6] rounded-[22px] overflow-hidden bg-gradient-to-br from-primary/30 via-primary/10 to-secondary/20">
                <AnimatePresence mode="wait">
                  {current?.image_url ? (
                    <motion.img
                      key={current.id}
                      src={current.image_url}
                      alt={current.title}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.7 }}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <motion.div
                      key="ph"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex items-center justify-center text-background/40"
                    >
                      <Zap className="h-20 w-20" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Overlay caption */}
                <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-foreground/90 to-transparent">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-background/60 mb-1">
                    Now featured
                  </p>
                  <h3 className="font-display font-bold text-lg leading-tight text-background line-clamp-1">
                    {current?.title || "Premium Asset Showcase"}
                  </h3>
                  {current?.link_url && (
                    <Link
                      to={current.link_url}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      View asset <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>

                {/* Slide indicator */}
                {banners.length > 1 && (
                  <div className="absolute top-3 right-3 flex gap-1">
                    {banners.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setSlide(i)}
                        className={`h-1 rounded-full transition-all ${
                          i === slide ? "w-5 bg-background" : "w-1 bg-background/40"
                        }`}
                        aria-label={`Slide ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Floating chip — top */}
            <motion.div
              initial={{ opacity: 0, x: 20, y: -10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.7 }}
              className="hidden md:flex absolute -top-4 -left-6 items-center gap-2.5 bg-card border border-border rounded-2xl px-3.5 py-2.5 shadow-xl"
            >
              <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center">
                <Star className="h-4 w-4 text-primary fill-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Avg rating</p>
                <p className="font-display font-extrabold text-sm">4.9 / 5.0</p>
              </div>
            </motion.div>

            {/* Floating chip — bottom */}
            <motion.div
              initial={{ opacity: 0, x: -10, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.85 }}
              className="hidden md:flex absolute -bottom-5 -right-4 items-center gap-2.5 bg-primary text-primary-foreground rounded-2xl px-3.5 py-2.5 shadow-xl"
            >
              <div className="h-9 w-9 rounded-xl bg-primary-foreground/15 flex items-center justify-center">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest opacity-80">Instant access</p>
                <p className="font-display font-extrabold text-sm">After approval</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Marquee strip */}
      <div className="mt-16 border-y border-border bg-muted/30 py-4 overflow-hidden">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex gap-10 whitespace-nowrap"
        >
          {[...MARQUEE_TAGS, ...MARQUEE_TAGS].map((t, i) => (
            <span
              key={`${t}-${i}`}
              className="flex items-center gap-3 text-sm font-display font-semibold text-muted-foreground"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {t}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
