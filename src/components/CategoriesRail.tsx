import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import CategoryIcon from "@/components/CategoryIcon";
import { useRef } from "react";

interface DBCategory { id: string; name: string; slug: string; icon: string | null; description: string | null; }

interface Props {
  categories: DBCategory[];
  countFor: (slug: string) => number;
}

/**
 * Horizontal scroll rail of category chips with brand icons.
 * Snap-scrolls smoothly with arrow controls.
 */
export default function CategoriesRail({ categories, countFor }: Props) {
  const railRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  if (categories.length === 0) return null;

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between flex-wrap gap-4 mb-8"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-2">
              <Sparkles className="h-3 w-3" /> Browse by category
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold leading-tight">
              Find your <span className="italic text-primary">perfect</span> asset.
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Scroll left"
              className="h-9 w-9 rounded-md border border-border bg-card flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label="Scroll right"
              className="h-9 w-9 rounded-md border border-border bg-card flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <Link
              to="/shop"
              className="ml-1 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>

        {/* Scroll rail */}
        <div className="relative -mx-4">
          {/* edge fades */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-background to-transparent z-10" />
          <div
            ref={railRef}
            className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <Link
              to="/shop"
              className="snap-start shrink-0 flex items-center gap-3 rounded-md border border-primary/30 bg-primary/5 hover:bg-primary/10 px-4 py-3 transition-colors"
            >
              <div className="h-10 w-10 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-display font-bold leading-tight">All Products</p>
                <p className="text-[10px] text-muted-foreground">Everything in one place</p>
              </div>
            </Link>

            {categories.map((cat) => {
              const count = countFor(cat.slug);
              return (
                <Link
                  key={cat.id}
                  to={`/shop?category=${cat.slug}`}
                  className="group snap-start shrink-0 flex items-center gap-3 rounded-md border border-border bg-card hover:border-primary/50 hover:shadow-md px-4 py-3 transition-all"
                >
                  <CategoryIcon
                    slug={cat.slug}
                    iconName={cat.icon}
                    size={40}
                    className="group-hover:scale-105 transition-transform"
                  />
                  <div className="text-left whitespace-nowrap">
                    <p className="text-sm font-display font-bold leading-tight">{cat.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {count.toLocaleString()} items
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}