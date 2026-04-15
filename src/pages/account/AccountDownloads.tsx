import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Download, Lock, FileDown, Clock, XCircle, CheckCircle, Key, QrCode, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function AccountDownloads() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch orders with items and product info
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["user-orders-downloads", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, status, created_at, order_items(id, product_id, products(id, title, image, category, delivery_type, file_url, download_link, qr_image_url, qr_target_url))")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch license keys assigned to user
  const { data: licenseKeys = [] } = useQuery({
    queryKey: ["user-license-keys", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("license_keys")
        .select("*, products:product_id(title)")
        .eq("assigned_to", user!.id);
      return data || [];
    },
    enabled: !!user,
  });

  const handleFileDownload = async (fileUrl: string) => {
    const { data, error } = await supabase.storage.from("product-files").createSignedUrl(fileUrl, 300);
    if (error || !data?.signedUrl) {
      toast({ title: "Download unavailable", description: "Could not generate download link.", variant: "destructive" });
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
    completed: { icon: CheckCircle, color: "text-green-600 bg-green-50 border-green-200", label: "Approved" },
    pending: { icon: Clock, color: "text-yellow-600 bg-yellow-50 border-yellow-200", label: "Pending Approval" },
    pending_verification: { icon: Clock, color: "text-yellow-600 bg-yellow-50 border-yellow-200", label: "Pending Verification" },
    cancelled: { icon: XCircle, color: "text-red-600 bg-red-50 border-red-200", label: "Rejected" },
    processing: { icon: Clock, color: "text-blue-600 bg-blue-50 border-blue-200", label: "Processing" },
  };

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-2">Downloads</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Downloads are available after your order is approved by admin.
      </p>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-border p-12 text-center bg-muted/20">
          <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium mb-1">No downloads yet</p>
          <p className="text-sm text-muted-foreground">Purchase a product to unlock downloads</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => {
            const cfg = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = cfg.icon;
            const isApproved = order.status === "completed";

            return (
              <div key={order.id} className="rounded-2xl border border-border overflow-hidden">
                {/* Order Header */}
                <div className="flex items-center justify-between px-5 py-3 bg-muted/30 border-b border-border">
                  <span className="text-xs text-muted-foreground">Order #{order.id.slice(0, 8)}</span>
                  <Badge variant="outline" className={cfg.color}>
                    <StatusIcon className="h-3 w-3 mr-1" /> {cfg.label}
                  </Badge>
                </div>

                {/* Items */}
                <div className="divide-y divide-border">
                  {(order.order_items || []).map((item: any) => {
                    const p = item.products;
                    if (!p) return null;
                    const deliveryType = p.delivery_type || "file";
                    const lk = licenseKeys.find((k: any) => k.product_id === p.id);

                    return (
                      <div key={item.id} className="p-5 flex items-center gap-4">
                        {p.image && <img src={p.image} alt="" className="w-14 h-14 rounded-xl object-cover border border-border" />}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{p.title}</p>
                          <p className="text-xs text-muted-foreground">{p.category}</p>
                        </div>

                        {!isApproved ? (
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {order.status === "cancelled" ? "Your order was not approved. Contact support." : "Your order is under review. Downloads will be available after approval."}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {deliveryType === "file" && p.file_url && (
                              <Button size="sm" onClick={() => handleFileDownload(p.file_url)}>
                                <FileDown className="h-4 w-4 mr-1" /> Download
                              </Button>
                            )}
                            {deliveryType === "link" && p.download_link && (
                              <Button size="sm" onClick={() => window.open(p.download_link, "_blank")}>
                                <ExternalLink className="h-4 w-4 mr-1" /> Open Link
                              </Button>
                            )}
                            {deliveryType === "license_key" && lk && (
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground flex items-center gap-1"><Key className="h-3 w-3" /> License Key</p>
                                <code className="text-xs font-mono bg-muted px-2 py-1 rounded mt-1 block">{lk.key_value}</code>
                              </div>
                            )}
                            {deliveryType === "qr_code" && (p.qr_image_url || p.qr_target_url) && (
                              <div className="text-right flex items-center gap-2">
                                {p.qr_image_url && <img src={p.qr_image_url} alt="QR" className="h-16 w-16 rounded border" />}
                                {p.qr_target_url && (
                                  <Button size="sm" variant="outline" onClick={() => window.open(p.qr_target_url, "_blank")}>
                                    <QrCode className="h-4 w-4 mr-1" /> Open
                                  </Button>
                                )}
                              </div>
                            )}
                            {deliveryType === "file" && !p.file_url && (
                              <p className="text-xs text-muted-foreground">Download not ready yet</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
