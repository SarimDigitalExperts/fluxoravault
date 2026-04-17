import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Flame, Clock, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FlashProduct {
  id: string; title: string; slug: string; image: string | null;
  price: number; flash_sale_price: number | null; flash_sale_ends_at: string | null;
}

function useCountdown(target: string | null) {
  const [diff, setDiff] = useState(0);
  useEffect(() => {
    if (!target) return;
    const tick = () => setDiff(Math.max(0, new Date(target).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s, expired: diff <= 0 };
}

export default function FlashSaleSection() {
  const [products, setProducts] = useState<FlashProduct[]>([]);

  useEffect(() => {
    supabase.from("products")
      .select("id,title,slug,image,price,flash_sale_price,flash_sale_ends_at")
      .not("flash_sale_price", "is", null)
      .gt("flash_sale_ends_at", new Date().toISOString())
      .eq("is_published", true)
      .limit(4)
      .then(({ data }) => data && setProducts(data as FlashProduct[]));
  }, []);

  const earliest = products.reduce<string | null>((acc, p) =>
    !acc || (p.flash_sale_ends_at && p.flash_sale_ends_at < acc) ? p.flash_sale_ends_at : acc, null);
  const { d, h, m, s, expired } = useCountdown(earliest);

  if (products.length === 0 || expired) return null;

  return (
    <section className="section-padding bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Flame className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold">Flash Sale</h2>
              <p className="text-sm text-muted-foreground">Limited time offers — grab them before they're gone</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2 shadow-sm">
            <Clock className="h-4 w-4 text-primary" />
            <div className="flex items-center gap-1.5 text-sm font-mono font-bold">
              {d > 0 && <><span>{d}d</span><span className="text-muted-foreground">:</span></>}
              <span>{String(h).padStart(2, "0")}</span><span className="text-muted-foreground">:</span>
              <span>{String(m).padStart(2, "0")}</span><span className="text-muted-foreground">:</span>
              <span className="text-primary">{String(s).padStart(2, "0")}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((p) => {
            const discount = Math.round((1 - (p.flash_sale_price! / p.price)) * 100);
            return (
              <Link key={p.id} to={`/product/${p.slug}`} className="group relative bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={p.image || "/placeholder.svg"} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground border-0 text-[10px] font-bold">-{discount}%</Badge>
                <div className="p-3">
                  <p className="text-sm font-semibold truncate mb-1">{p.title}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold text-primary">PKR {p.flash_sale_price!.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground line-through">PKR {p.price.toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-6">
          <Button asChild variant="outline">
            <Link to="/shop">View All Deals <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
