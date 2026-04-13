import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Package, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminAnalytics() {
  const [data, setData] = useState({
    ordersByStatus: {} as Record<string, number>,
    revenueByMonth: [] as { month: string; revenue: number }[],
    topProducts: [] as { title: string; count: number }[],
    totalRevenue: 0,
    avgOrderValue: 0,
  });

  useEffect(() => {
    const fetch = async () => {
      const { data: orders } = await supabase.from("orders").select("*");
      const { data: items } = await supabase.from("order_items").select("*, products(title)");

      const allOrders = orders || [];
      const allItems = items || [];

      const ordersByStatus: Record<string, number> = {};
      let totalRevenue = 0;
      const revenueByMonth: Record<string, number> = {};

      allOrders.forEach((o) => {
        ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
        totalRevenue += Number(o.total);
        const month = new Date(o.created_at).toLocaleDateString("en", { month: "short", year: "2-digit" });
        revenueByMonth[month] = (revenueByMonth[month] || 0) + Number(o.total);
      });

      const productCounts: Record<string, number> = {};
      allItems.forEach((item: any) => {
        const title = item.products?.title || "Unknown";
        productCounts[title] = (productCounts[title] || 0) + item.quantity;
      });

      const topProducts = Object.entries(productCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([title, count]) => ({ title, count }));

      setData({
        ordersByStatus,
        revenueByMonth: Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue })),
        topProducts,
        totalRevenue,
        avgOrderValue: allOrders.length > 0 ? totalRevenue / allOrders.length : 0,
      });
    };
    fetch();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-green-400 opacity-60" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">${data.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-primary opacity-60" />
                <div>
                  <p className="text-xs text-muted-foreground">Avg. Order Value</p>
                  <p className="text-2xl font-bold">${data.avgOrderValue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Orders by Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(data.ordersByStatus).length === 0 ? (
            <p className="text-muted-foreground text-sm">No orders data yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(data.ordersByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-sm capitalize w-24">{status}</span>
                  <div className="flex-1 bg-muted/30 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full flex items-center pl-2"
                      style={{ width: `${Math.max(10, (count / Object.values(data.ordersByStatus).reduce((a, b) => a + b, 0)) * 100)}%` }}
                    >
                      <span className="text-xs font-bold text-primary-foreground">{count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-secondary" />
            Top Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.topProducts.length === 0 ? (
            <p className="text-muted-foreground text-sm">No product data yet.</p>
          ) : (
            <div className="space-y-3">
              {data.topProducts.map((p, i) => (
                <div key={p.title} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-5">#{i + 1}</span>
                    <span className="text-sm font-medium">{p.title}</span>
                  </div>
                  <span className="text-sm text-primary font-bold">{p.count} sold</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
