import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, DollarSign, Clock, TrendingUp, Users, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  totalUsers: number;
  activeSubs: number;
  recentOrders: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0, totalOrders: 0, totalRevenue: 0, pendingOrders: 0, totalUsers: 0, activeSubs: 0, recentOrders: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [productsRes, ordersRes, profilesRes, subsRes] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
      ]);
      const orders = ordersRes.data || [];
      const totalRevenue = orders.filter(o => o.status === "completed").reduce((sum, o) => sum + Number(o.total), 0);
      const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "pending_verification").length;
      setStats({
        totalProducts: productsRes.count || 0,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
        totalUsers: profilesRes.count || 0,
        activeSubs: subsRes.count || 0,
        recentOrders: orders.slice(0, 5),
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Total Revenue", value: `PKR ${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-600 bg-green-50" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, color: "text-secondary bg-secondary/10" },
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-primary bg-primary/10" },
    { label: "Active Subs", value: stats.activeSubs, icon: Crown, color: "text-purple-600 bg-purple-50" },
    { label: "Products", value: stats.totalProducts, icon: Package, color: "text-primary bg-primary/10" },
    { label: "Pending Orders", value: stats.pendingOrders, icon: Clock, color: "text-amber-600 bg-amber-50" },
  ];

  const quickActions = [
    { label: "Add Product", to: "/admin/products", icon: Package },
    { label: "View Orders", to: "/admin/orders", icon: ShoppingCart },
    { label: "Payments", to: "/admin/payment-methods", icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border hover:shadow-sm transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{c.label}</p>
                    <p className="text-2xl font-bold mt-1">{c.value}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${c.color}`}><c.icon className="h-5 w-5" /></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        {quickActions.map(a => (
          <Button key={a.label} variant="outline" asChild size="sm">
            <Link to={a.to} className="gap-2"><a.icon className="h-4 w-4" /> {a.label}</Link>
          </Button>
        ))}
      </div>

      {/* Recent Orders */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> Recent Orders
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/orders" className="gap-1">View All <ArrowRight className="h-3 w-3" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          {stats.recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div>
                    <p className="text-sm font-medium">Order #{o.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">PKR {Number(o.total).toLocaleString()}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      o.status === "completed" ? "bg-green-50 text-green-700" :
                      o.status === "pending" || o.status === "pending_verification" ? "bg-amber-50 text-amber-700" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
