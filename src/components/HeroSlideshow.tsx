import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Sparkles, Search, Star, Download, ShieldCheck, Zap, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SiShopify, SiWordpress, SiCanva, SiFigma, SiNodedotjs, SiReact,
  SiTailwindcss, SiFramer, SiNotion, SiAdobe, SiWebflow, SiNextdotjs,
} from "react-icons/si";

const ROTATING = [
  { word: "Themes", color: "hsl(var(--primary))" },
  { word: "Plugins", color: "hsl(var(--secondary))" },
  { word: "UI Kits", color: "hsl(var(--primary))" },
  { word: "Mockups", color: "hsl(var(--secondary))" },
  { word: "Icons", color: "hsl(var(--primary))" },
];

const MARQUEE_BRANDS = [
  { Icon: SiShopify, color: "#95BF47", name: "Shopify" },
  { Icon: SiWordpress, color: "#21759B", name: "WordPress" },
  { Icon: SiCanva, color: "#00C4CC", name: "Canva" },
  { Icon: SiFigma, color: "#F24E1E", name: "Figma" },
  { Icon: SiNodedotjs, color: "#339933", name: "Node" },
  { Icon: SiReact, color: "#61DAFB", name: "React" },
  { Icon: SiTailwindcss, color: "#06B6D4", name: "Tailwind" },
  { Icon: SiFramer, color: "#0055FF", name: "Framer" },
  { Icon: SiNotion, color: "#000000", name: "Notion" },
  { Icon: SiAdobe, color: "#FF0000", name: "Adobe" },
  { Icon: SiNextdotjs, color: "#000000", name: "Next.js" },
  { Icon: SiWebflow, color: "#146EF5", name: "Webflow" },
];

const STATS = [
  { value: "22K+", label: "Premium assets" },
  { value: "180K", label: "Happy creators" },
  { value: "4.9★", label: "Avg. rating" },
];

// Floating preview thumbnails
const FLOATING = [
  { src: "https://images.unsplash.com/photo-1545665277-5937489579f2?w=400&q=80", title: "Aurora UI Kit", price: "PKR 2,499" },
  { src: "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=400&q=80", title: "Pulse Dashboard", price: "PKR 3,200" },
  { src: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=400&q=80", title: "Nova Mockups", price: "PKR 1,800" },
];

export default function HeroSlideshow() {
  const [idx, setIdx] = useState(0);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const id = setInterval(() => setIdx((w) => (w + 1) % ROTATING.length), 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden bg-background">
      {/* Layered background */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />
      <div className="absolute -top-32 -left-40 w-[620px] h-[620px] bg-primary/15 rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/2 -right-40 w-[640px] h-[640px] bg-secondary/15 rounded-full blur-3xl -z-10" />

      <div className="container relative pt-24 md:pt-28 pb-12 md:pb-20">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* LEFT: Content */}
          <div className="lg:col-span-7 relative z-10">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 backdrop-blur pl-1 pr-4 py-1 text-xs font-medium shadow-sm"
            >
              <span className="inline-flex items-center gap-1 rounded-full bg-foreground text-background px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                <Zap className="h-3 w-3 fill-current" /> Live
              </span>
              <span className="text-muted-foreground">22,000+ premium drops · updated weekly</span>
            </motion.div>

            {/* Editorial headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-6 font-display font-black tracking-[-0.03em] leading-[0.92] text-[3rem] sm:text-[4.25rem] lg:text-[5.75rem]"
            >
              Build faster
              <br />
              with elite
              <br />
              <span className="relative inline-flex items-baseline">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={ROTATING[idx].word}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.6, 0.05, 0.01, 0.9] }}
                    className="italic font-extrabold"
                    style={{ color: ROTATING[idx].color }}
                  >
                    {ROTATING[idx].word}
                  </motion.span>
                </AnimatePresence>
                <span className="text-foreground">.</span>
                {/* Underline accent */}
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="absolute -bottom-2 left-0 right-4 h-2 origin-left bg-gradient-to-r from-primary via-secondary to-primary rounded-full opacity-60"
                />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-7 text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed"
            >
              The vault where indie makers, agencies & studios source premium templates,
              source code, and design assets — curated, never bloated.
            </motion.p>

            {/* Search + CTA row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xl"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  window.location.href = `/shop?search=${encodeURIComponent(query)}`;
                }}
                className="flex-1 flex items-center bg-card border-2 border-border rounded-2xl pl-4 pr-2 py-2 shadow-lg shadow-foreground/5 focus-within:border-primary transition-colors"
              >
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search 22k+ assets…"
                  className="flex-1 bg-transparent outline-none text-sm px-3 placeholder:text-muted-foreground/70"
                />
                <Button type="submit" size="sm" className="rounded-xl">
                  Search
                </Button>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="mt-5 flex flex-wrap items-center gap-3"
            >
              <Button asChild size="lg" className="rounded-xl group">
                <Link to="/shop">
                  Explore the vault
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost-border" className="rounded-xl group">
                <Link to="/pricing">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Play className="h-3 w-3 fill-current" />
                  </span>
                  See pricing
                </Link>
              </Button>
            </motion.div>

            {/* Inline stats */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-10 grid grid-cols-3 gap-4 max-w-md border-t border-border pt-6"
            >
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="font-display text-2xl md:text-3xl font-black tracking-tight">{s.value}</div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT: Visual stack */}
          <div className="lg:col-span-5 relative h-[440px] sm:h-[520px] lg:h-[600px] hidden md:block">
            {/* Backdrop card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: -3 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="absolute inset-x-6 top-6 bottom-12 rounded-[2rem] bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/5 border border-border"
            />

            {/* Floating product cards */}
            {FLOATING.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 30, rotate: 0 }}
                animate={{
                  opacity: 1,
                  y: [0, -8, 0],
                  rotate: [-6 + i * 6, -4 + i * 6, -6 + i * 6],
                }}
                transition={{
                  opacity: { duration: 0.6, delay: 0.3 + i * 0.15 },
                  y: { duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 },
                  rotate: { duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 },
                }}
                className="absolute bg-card border border-border rounded-2xl shadow-2xl shadow-foreground/10 overflow-hidden w-56"
                style={{
                  top: `${10 + i * 28}%`,
                  left: i % 2 === 0 ? `${5 + i * 4}%` : "auto",
                  right: i % 2 === 1 ? `${5 + i * 2}%` : "auto",
                  zIndex: 10 + i,
                }}
              >
                <img src={p.src} alt={p.title} className="w-full h-32 object-cover" loading="lazy" />
                <div className="p-3">
                  <div className="flex items-center gap-1 text-[10px] text-secondary font-bold uppercase tracking-wider">
                    <Star className="h-3 w-3 fill-current" /> Featured
                  </div>
                  <div className="mt-1 font-display font-bold text-sm truncate">{p.title}</div>
                  <div className="mt-0.5 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{p.price}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary">
                      <Download className="h-3 w-3" /> Instant
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, type: "spring" }}
              className="absolute bottom-4 left-2 z-30 flex items-center gap-2.5 rounded-2xl bg-foreground text-background px-4 py-3 shadow-xl"
            >
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div>
                <div className="text-xs font-bold leading-tight">Verified vault</div>
                <div className="text-[10px] opacity-70 leading-tight">License included</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Brand marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-14 md:mt-20"
        >
          <div className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/80 mb-5">
            Built for your favorite tools
          </div>
          <div
            className="relative overflow-hidden"
            style={{
              maskImage: "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
              WebkitMaskImage: "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
            }}
          >
            <div className="flex gap-3 animate-marquee whitespace-nowrap">
              {[...MARQUEE_BRANDS, ...MARQUEE_BRANDS].map((b, i) => (
                <Link
                  key={i}
                  to={`/shop?search=${encodeURIComponent(b.name)}`}
                  className="group flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all shrink-0"
                >
                  <b.Icon className="h-4 w-4 transition-transform group-hover:scale-110" style={{ color: b.color }} />
                  <span className="text-xs font-semibold text-foreground/80">{b.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
        .animate-marquee:hover { animation-play-state: paused; }
      `}</style>
    </section>
  );
}
