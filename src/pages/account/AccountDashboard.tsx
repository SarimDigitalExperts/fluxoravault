import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Package, Download, Heart, Crown, ShoppingCart, ArrowRight } from "lucide-react";
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
      <h1 className="text-2xl font-display font-bold mb-1">Welcome back!</h1>
      <p className="text-muted-foreground text-sm mb-8">{user?.user_metadata?.display_name || user?.email}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Link to={s.to} className="rounded-xl border border-border p-5 flex flex-col items-center text-center hover:border-primary/30 transition-all bg-card group">
              <div className={`p-3 rounded-xl ${s.color} mb-2`}><s.icon className="h-5 w-5" /></div>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-8">
        <Button variant="outline" size="sm" asChild><Link to="/shop" className="gap-2"><ShoppingCart className="h-4 w-4" /> Browse Products</Link></Button>
        <Button variant="outline" size="sm" asChild><Link to="/pricing" className="gap-2"><Crown className="h-4 w-4" /> Upgrade Plan</Link></Button>
        <Button variant="outline" size="sm" asChild><Link to="/account/downloads" className="gap-2"><Download className="h-4 w-4" /> View Downloads</Link></Button>
      </div>

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
