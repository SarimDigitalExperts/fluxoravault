import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Sparkles, Search, Star, Download, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SiShopify, SiWordpress, SiCanva, SiFigma, SiNodedotjs, SiReact,
  SiTailwindcss, SiAdobephotoshop,
} from "react-icons/si";

const ROTATING_WORDS = ["Themes", "Plugins", "UI Kits", "Mockups", "Icons"];

const BRANDS: { name: string; Icon: any; color: string; query: string }[] = [
  { name: "Shopify", Icon: SiShopify, color: "#95BF47", query: "Shopify" },
  { name: "WordPress", Icon: SiWordpress, color: "#21759B", query: "WordPress" },
  { name: "Canva", Icon: SiCanva, color: "#00C4CC", query: "Canva" },
  { name: "Figma", Icon: SiFigma, color: "#F24E1E", query: "Figma" },
  { name: "Node.js", Icon: SiNodedotjs, color: "#339933", query: "Node" },
  { name: "React", Icon: SiReact, color: "#61DAFB", query: "React" },
  { name: "Tailwind", Icon: SiTailwindcss, color: "#06B6D4", query: "Tailwind" },
  { name: "Photoshop", Icon: SiAdobephotoshop, color: "#31A8FF", query: "Photoshop" },
];

export default function HeroSlideshow() {
  const [wordIdx, setWordIdx] = useState(0);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const id = setInterval(() => setWordIdx((w) => (w + 1) % ROTATING_WORDS.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden pt-24 md:pt-28 pb-16 md:pb-24 bg-background">
      {/* Background gradients + dotted pattern */}
      <div
        className="absolute inset-0 opacity-[0.05] -z-10"
        style={{
          backgroundImage: "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className="absolute -top-40 -left-32 w-[520px] h-[520px] bg-primary/20 rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/3 -right-40 w-[560px] h-[560px] bg-secondary/15 rounded-full blur-3xl -z-10" />

      <div className="container relative">
        {/* Eyebrow pill */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <Link
            to="/shop"
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-card/70 backdrop-blur px-4 py-1.5 text-xs font-medium shadow-sm hover:border-primary/50 transition-colors"
          >
            <span className="inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="h-3 w-3" /> New
            </span>
            <span className="text-muted-foreground">22k+ premium assets just landed</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </motion.div>

        {/* Headline — centered editorial */}
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display font-black tracking-tight leading-[0.95] text-[2.75rem] sm:text-[4rem] md:text-[5.25rem]"
          >
            The vault for
            <br />
            <span className="inline-flex items-baseline gap-3 justify-center">
              <span className="relative inline-block min-w-[5ch]">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={ROTATING_WORDS[wordIdx]}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -30, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-primary italic inline-block"
                  >
                    {ROTATING_WORDS[wordIdx]}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="text-muted-foreground/40">.</span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            Premium design files, source code & ready-to-ship templates —
            curated weekly for builders who move fast.
          </motion.p>

          {/* Search bar */}
          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = `/shop?search=${encodeURIComponent(query)}`;
            }}
            className="mt-8 flex items-center gap-2 max-w-xl mx-auto bg-card border border-border rounded-2xl p-2 shadow-lg shadow-foreground/5 focus-within:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-2 flex-1 px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search themes, plugins, UI kits…"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground/70"
              />
            </div>
            <Button type="submit" size="default" className="rounded-xl px-5">
              Search
            </Button>
          </motion.form>

          {/* Quick chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-2.5"
          >
            <span className="w-full text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80 mb-1">
              Built for your favorite tools
            </span>
            {BRANDS.map((b) => (
              <Link
                key={b.name}
                to={`/shop?search=${encodeURIComponent(b.query)}`}
                title={b.name}
                className="group flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all"
              >
                <b.Icon className="h-4 w-4 transition-transform group-hover:scale-110" style={{ color: b.color }} />
                <span className="text-xs font-medium text-foreground/80 group-hover:text-foreground">{b.name}</span>
              </Link>
            ))}
          </motion.div>
        </div>

        {/* Bottom trust row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="mt-12 md:mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-xs text-muted-foreground"
        >
          <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Verified vault</span>
          <span className="flex items-center gap-2"><Star className="h-4 w-4 text-primary fill-primary" /> 4.9 average rating</span>
          <span className="flex items-center gap-2"><Download className="h-4 w-4 text-primary" /> Instant after approval</span>
          <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> New drops weekly</span>
        </motion.div>
      </div>
    </section>
  );
}
