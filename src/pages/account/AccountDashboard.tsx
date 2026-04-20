import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Package, Download, Heart, Crown, ShoppingCart, ArrowRight, Bell, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function AccountDashboard() {
  const { user } = useAuth();

  const { data: ordersCount = 0 } = useQuery({
    queryKey: ["user-orders-count", user?.id],
    queryFn: async () => {
      const { count } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq("user_id", user!.id);
      return count || 0;
    },
    enabled: !!user,
  });

  const { data: downloadsCount = 0 } = useQuery({
    queryKey: ["user-downloads-count", user?.id],
    queryFn: async () => {
      const { count } = await supabase.from("downloads").select("*", { count: "exact", head: true }).eq("user_id", user!.id);
      return count || 0;
    },
    enabled: !!user,
  });

  const { data: subscription } = useQuery({
    queryKey: ["user-active-sub", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("subscriptions").select("*").eq("user_id", user!.id).eq("status", "active").maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: recentOrders = [] } = useQuery({
    queryKey: ["user-recent-orders", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("id, status, total, created_at").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(3);
      return data || [];
    },
    enabled: !!user,
  });

  // Product update notifications: products purchased by user, with version updated AFTER their last order
  const { data: updateNotices = [] } = useQuery({
    queryKey: ["product-updates", user?.id],
    queryFn: async () => {
      const { data: orders } = await supabase.from("orders").select("id, created_at").eq("user_id", user!.id).eq("status", "completed");
      if (!orders || orders.length === 0) return [];
      const orderIds = orders.map(o => o.id);
      const { data: items } = await supabase.from("order_items").select("product_id, order_id").in("order_id", orderIds);
      if (!items || items.length === 0) return [];
      const orderDateMap = new Map(orders.map(o => [o.id, new Date(o.created_at).getTime()]));
      const productEarliest = new Map<string, number>();
      items.forEach(it => {
        const t = orderDateMap.get(it.order_id) ?? 0;
        const existing = productEarliest.get(it.product_id) ?? Infinity;
        if (t < existing) productEarliest.set(it.product_id, t);
      });
      const productIds = Array.from(productEarliest.keys());
      const { data: products } = await supabase
        .from("products")
        .select("id, title, slug, version, version_notes, version_updated_at")
        .in("id", productIds)
        .not("version_updated_at", "is", null);
      return (products || [])
        .filter(p => p.version_updated_at && new Date(p.version_updated_at).getTime() > (productEarliest.get(p.id) ?? 0))
        .slice(0, 5);
    },
    enabled: !!user,
  });

  const stats = [
    { label: "Total Purchases", value: ordersCount, icon: Package, to: "/account/orders", color: "text-primary bg-primary/10" },
    { label: "Downloads", value: downloadsCount, icon: Download, to: "/account/downloads", color: "text-secondary bg-secondary/10" },
    { label: "Active Plan", value: subscription?.plan ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1) : "Free", icon: Crown, to: "/account/subscriptions", color: "text-purple-600 bg-purple-50" },
    { label: "Wishlist", value: "—", icon: Heart, to: "/account/wishlist", color: "text-pink-500 bg-pink-50" },
  ];

  const statusColor: Record<string, string> = {
    completed: "bg-green-50 text-green-700", pending: "bg-yellow-50 text-yellow-700",
    pending_verification: "bg-yellow-50 text-yellow-700", cancelled: "bg-red-50 text-red-700",
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-xl font-display font-bold">Dashboard</h2>
        <p className="text-muted-foreground text-sm">A quick overview of your activity.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Link to={s.to} className="rounded-2xl border border-border p-4 flex flex-col gap-2 hover:border-primary hover:shadow-md transition-all bg-card group h-full">
              <div className={`p-2 rounded-xl ${s.color} w-fit`}><s.icon className="h-4 w-4" /></div>
              <div className="min-w-0">
                <p className="text-base sm:text-lg font-display font-extrabold leading-tight break-words">{s.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Button size="sm" asChild><Link to="/shop" className="gap-2"><ShoppingCart className="h-4 w-4" /> Browse Products</Link></Button>
        <Button variant="outline" size="sm" asChild><Link to="/pricing" className="gap-2"><Crown className="h-4 w-4" /> Upgrade Plan</Link></Button>
        <Button variant="outline" size="sm" asChild><Link to="/account/downloads" className="gap-2"><Download className="h-4 w-4" /> View Downloads</Link></Button>
      </div>

      {/* Product Update Notifications */}
      {updateNotices.length > 0 && (
        <div className="mb-8 rounded-xl border border-primary/30 bg-primary/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Updates Available</h3>
            <Badge variant="secondary" className="text-[10px]">{updateNotices.length}</Badge>
          </div>
          <div className="space-y-2">
            {updateNotices.map((p: any) => (
              <Link key={p.id} to={`/product/${p.slug}`} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                    <p className="text-sm font-semibold truncate">{p.title}</p>
                    {p.version && <Badge variant="outline" className="text-[10px] py-0">v{p.version}</Badge>}
                  </div>
                  {p.version_notes && <p className="text-xs text-muted-foreground line-clamp-2">{p.version_notes}</p>}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Recent Orders</h3>
            <Button variant="ghost" size="sm" asChild><Link to="/account/orders" className="gap-1 text-xs">View All <ArrowRight className="h-3 w-3" /></Link></Button>
          </div>
          <div className="space-y-2">
            {recentOrders.map(o => (
              <div key={o.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
                <div>
                  <p className="text-sm font-medium">Order #{o.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <span className="text-sm font-medium">PKR {Number(o.total).toLocaleString()}</span>
                  <Badge variant="outline" className={statusColor[o.status] || "bg-muted text-muted-foreground"}>{o.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
