import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AccountOrders() {
  const { user } = useAuth();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["user-orders", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*, products(title, image, slug))")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    completed: "bg-emerald-500/20 text-emerald-400",
    cancelled: "bg-destructive/20 text-destructive",
  };

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">My Orders</h1>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : orders.length === 0 ? (
        <div className="glass-strong rounded-2xl p-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order.id} className="glass-strong rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm font-medium">Order #{order.id.slice(0, 8)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[order.status] || ""}`}>
                    {order.status}
                  </span>
                  <span className="font-bold">${order.total}</span>
                </div>
              </div>
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 py-2 border-t border-border/30">
                  {item.products?.image && (
                    <img src={item.products.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  )}
                  <span className="text-sm flex-1">{item.products?.title || "Product"}</span>
                  <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                  <span className="text-sm font-medium">${item.price}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
