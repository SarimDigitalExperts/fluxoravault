import { useEffect, useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
}

const ROTATING_HIGHLIGHT = ["Curated", "Premium", "Trusted", "Modern"];

export default function HeroSlideshow() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [slide, setSlide] = useState(0);
  const [highlight, setHighlight] = useState(0);
  const [query, setQuery] = useState("");

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
    const id = setInterval(() => setSlide((s) => (s + 1) % banners.length), 5000);
    return () => clearInterval(id);
  }, [banners.length]);

  useEffect(() => {
    const id = setInterval(() => setHighlight((h) => (h + 1) % ROTATING_HIGHLIGHT.length), 2500);
    return () => clearInterval(id);
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(query.trim() ? `/shop?q=${encodeURIComponent(query.trim())}` : "/shop");
  };

  const current = banners[slide];
  const nextBanner = banners[(slide + 1) % Math.max(banners.length, 1)];

  return (
    <section className="relative overflow-hidden pt-28 md:pt-32 pb-16 md:pb-24 bg-gradient-to-br from-primary/5 via-background to-background">
      <div className="absolute top-1/3 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />

      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* LEFT */}
          <div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-extrabold leading-[1.05] tracking-tight mb-6">
              2M+{" "}
              <AnimatePresence mode="wait">
                <motion.span
                  key={highlight}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.4 }}
                  className="inline-block text-primary"
                >
                  {ROTATING_HIGHLIGHT[highlight]}
                </motion.span>
              </AnimatePresence>
              <br />
              Digital Products
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-base md:text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed"
            >
              Explore the best premium themes and plugins available for sale.
              Our unique collection is hand-curated by experts. Find and buy the
              perfect premium theme today.
            </motion.p>

            {/* Search bar */}
            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="relative max-w-lg mb-7"
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search theme, plugins & more..."
                className="w-full h-14 pl-6 pr-16 rounded-full border border-border bg-card shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </Button>
            </motion.form>

            {/* Brand chips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-2.5"
            >
              {["Wp", "La", "Js", "Py", "Sk", "Fi", "Bs", "Fl", "Re"].map((s, i) => (
                <div
                  key={s}
                  className="h-10 w-10 rounded-full bg-card border border-border shadow-sm flex items-center justify-center text-[11px] font-bold text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {s}
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT — Composition */}
          <div className="relative hidden lg:block min-h-[460px]">
            {/* Decorative dots */}
            <div className="absolute top-10 -left-4 grid grid-cols-6 gap-1.5 opacity-40">
              {Array.from({ length: 24 }).map((_, i) => (
                <span key={i} className="h-1 w-1 rounded-full bg-primary" />
              ))}
            </div>

            {/* Big main banner */}
            <div className="relative ml-auto w-[78%] aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-border bg-gradient-to-br from-primary/10 to-primary/5">
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
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-primary/40">
                    <Sparkles className="h-20 w-20" />
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Floating "Themes & Plugins" stat card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="absolute top-6 right-0 bg-card border border-border rounded-2xl shadow-xl px-5 py-4 text-center"
            >
              <p className="text-2xl font-display font-extrabold text-foreground">22k</p>
              <p className="text-[11px] text-muted-foreground font-medium leading-tight mt-0.5">
                Themes<br />& Plugins
              </p>
            </motion.div>

            {/* Floating "Customers" pill (primary) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55 }}
              className="absolute top-1/2 -translate-y-1/2 -left-2 bg-primary text-primary-foreground rounded-2xl shadow-xl px-5 py-4 text-center"
            >
              <p className="text-2xl font-display font-extrabold">50k</p>
              <p className="text-[11px] opacity-90 font-medium">Customers</p>
            </motion.div>

            {/* Bottom small banner card */}
            {nextBanner && nextBanner.image_url && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="absolute -bottom-2 right-6 w-40 aspect-square rounded-2xl overflow-hidden shadow-xl border border-border bg-card"
              >
                {nextBanner.link_url ? (
                  <Link to={nextBanner.link_url}>
                    <img src={nextBanner.image_url} alt={nextBanner.title} className="w-full h-full object-cover" />
                  </Link>
                ) : (
                  <img src={nextBanner.image_url} alt={nextBanner.title} className="w-full h-full object-cover" />
                )}
              </motion.div>
            )}

            {/* Slide dots */}
            {banners.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlide(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === slide ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/70"
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
