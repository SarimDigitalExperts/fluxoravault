import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import CategoryIcon from "@/components/CategoryIcon";

interface DBCategory { id: string; name: string; slug: string; icon: string | null; description: string | null; }

interface Props {
  categories: DBCategory[];
  countFor: (slug: string) => number;
}

/**
 * Bold gradient category cards — brand-illustration style.
 * Each card uses a unique gradient + brand icon, with hover lift & glow.
 */
export default function CategoriesRail({ categories, countFor }: Props) {
  if (categories.length === 0) return null;

  return (
    <section className="section-padding relative overflow-hidden bg-muted/20">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between flex-wrap gap-4 mb-10"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-2">
              <Sparkles className="h-3 w-3" /> Browse by category
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold leading-tight">
              Find your <span className="italic text-primary">perfect</span> asset
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              Explore curated collections across every creative discipline.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all"
          >
            View all categories <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {/* Bold gradient grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
          {/* Feature card: All products */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-2 row-span-1"
          >
            <Link
              to="/shop"
              className="group relative flex h-full min-h-[180px] items-end overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-secondary p-6 text-primary-foreground shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
              <div className="absolute right-4 top-4 h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="relative">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Explore all</p>
                <h3 className="font-display text-2xl md:text-3xl font-extrabold mt-1 leading-tight">
                  All Products
                </h3>
                <p className="text-sm opacity-90 mt-1">Everything, in one place</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold opacity-95 group-hover:gap-2 transition-all">
                  Shop now <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          </motion.div>

          {categories.map((cat, i) => {
            const count = countFor(cat.slug);
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.04, 0.4) }}
              >
                <Link
                  to={`/shop?category=${cat.slug}`}
                  className="group relative flex h-full min-h-[180px] flex-col items-start justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
                >
                  {/* soft gradient wash on hover */}
                  <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

                  <CategoryIcon
                    slug={cat.slug}
                    iconName={cat.icon}
                    size={56}
                    className="group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300"
                  />

                  <div className="relative w-full mt-4">
                    <h3 className="font-display font-bold text-base leading-tight truncate group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground">
                        {count.toLocaleString()} {count === 1 ? "item" : "items"}
                      </p>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary transition-all" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}