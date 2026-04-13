import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Package, Download, Heart, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function AccountDashboard() {
  const { user } = useAuth();

  const { data: ordersCount = 0 } = useQuery({
    queryKey: ["user-orders-count", user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id);
      return count || 0;
    },
    enabled: !!user,
  });

  const { data: downloadsCount = 0 } = useQuery({
    queryKey: ["user-downloads-count", user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("downloads")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id);
      return count || 0;
    },
    enabled: !!user,
  });

  const stats = [
    { label: "Orders", value: ordersCount, icon: Package, to: "/account/orders", color: "text-primary" },
    { label: "Downloads", value: downloadsCount, icon: Download, to: "/account/downloads", color: "text-secondary" },
    { label: "Wishlist", value: "—", icon: Heart, to: "/account/wishlist", color: "text-pink-400" },
    { label: "Billing", value: "Manage", icon: CreditCard, to: "/account/billing", color: "text-emerald-400" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-1">Welcome back!</h1>
      <p className="text-muted-foreground text-sm mb-8">
        {user?.user_metadata?.display_name || user?.email}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              to={s.to}
              className="glass-strong rounded-2xl p-6 flex items-center gap-4 hover:border-primary/30 border border-transparent transition-all group"
            >
              <div className={`p-3 rounded-xl bg-muted/50 ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
