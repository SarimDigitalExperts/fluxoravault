import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart, Eye, Download, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Order updated to ${status}`);

    if (status === "completed") {
      const order = orders.find((o) => o.id === id);
      if (order) {
        const { data: orderItems } = await supabase.from("order_items").select("*").eq("order_id", id);
        if (orderItems) {
          for (const item of orderItems) {
            await supabase.from("downloads").insert({
              user_id: order.user_id,
              product_id: item.product_id,
              order_id: id,
              download_url: null,
              max_downloads: 5,
            });
          }
        }
      }
    }

    fetchOrders();
  };

  const viewOrder = async (order: any) => {
    setSelected(order);
    const { data } = await supabase.from("order_items").select("*, products(title)").eq("order_id", order.id);
    setItems(data || []);
  };

  const getProofUrl = (path: string) => {
    if (!path) return null;
    const { data } = supabase.storage.from("payment-proofs").getPublicUrl(path);
    return data.publicUrl;
  };

  const statusColor = (s: string) => {
    if (s === "completed") return "bg-green-500/10 text-green-400";
    if (s === "pending" || s === "pending_verification") return "bg-yellow-500/10 text-yellow-400";
    if (s === "cancelled") return "bg-red-500/10 text-red-400";
    return "bg-muted text-muted-foreground";
  };

  return (
    <>
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Orders ({orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : orders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs">#{o.id.slice(0, 8)}</TableCell>
                      <TableCell>
                        <div className="text-sm">{o.customer_name || "—"}</div>
                        <div className="text-xs text-muted-foreground">{o.customer_email || ""}</div>
                      </TableCell>
                      <TableCell className="text-sm">{new Date(o.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-sm font-medium">${Number(o.total).toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(o.status)}`}>{o.status}</span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{o.payment_method || "—"}</TableCell>
                      <TableCell className="text-right flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => viewOrder(o)}><Eye className="h-4 w-4" /></Button>
                        <Select value={o.status} onValueChange={(val) => updateStatus(o.id, val)}>
                          <SelectTrigger className="w-36 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending_verification">Pending Verification</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(v) => { if (!v) setSelected(null); }}>
        <DialogContent className="glass max-w-lg">
          <DialogHeader><DialogTitle>Order #{selected?.id.slice(0, 8)}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Customer:</span> {selected.customer_name}</div>
                <div><span className="text-muted-foreground">Email:</span> {selected.customer_email}</div>
                <div><span className="text-muted-foreground">Phone:</span> {selected.customer_phone || "—"}</div>
                <div><span className="text-muted-foreground">Payment:</span> {selected.payment_method}</div>
                {selected.coupon_code && <div><span className="text-muted-foreground">Coupon:</span> {selected.coupon_code}</div>}
                {Number(selected.discount_amount) > 0 && <div><span className="text-muted-foreground">Discount:</span> -${Number(selected.discount_amount).toFixed(2)}</div>}
              </div>
              {selected.customer_note && <div className="glass-strong p-3 rounded-lg text-sm"><span className="text-muted-foreground">Note:</span> {selected.customer_note}</div>}

              <div>
                <h4 className="text-sm font-medium mb-2">Items</h4>
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm py-1">
                    <span>{(item.products as any)?.title || item.product_id.slice(0, 8)} × {item.quantity}</span>
                    <span>${Number(item.price).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-sm pt-2 border-t border-border/30 mt-2">
                  <span>Total</span>
                  <span className="text-primary">${Number(selected.total).toFixed(2)}</span>
                </div>
              </div>

              {selected.payment_proof_url && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Payment Proof</h4>
                  <img src={getProofUrl(selected.payment_proof_url) || ""} alt="Payment proof" className="max-h-48 rounded-lg border border-border/30" />
                </div>
              )}

              <div className="flex gap-2">
                <Button size="sm" onClick={() => { updateStatus(selected.id, "completed"); setSelected(null); }} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => { updateStatus(selected.id, "cancelled"); setSelected(null); }} className="flex-1">
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
