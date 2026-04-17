import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart, Eye, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import AdminToolbar from "@/components/admin/AdminToolbar";
import { useAdminTable } from "@/hooks/useAdminTable";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");

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
        const { data: orderItems } = await supabase.from("order_items").select("*, products(delivery_type, file_url, download_link, max_downloads_per_user)").eq("order_id", id);
        if (orderItems) {
          for (const item of orderItems) {
            const p = (item as any).products;
            const deliveryType = p?.delivery_type || "file";
            await supabase.from("downloads").insert({
              user_id: order.user_id, product_id: item.product_id, order_id: id,
              download_url: deliveryType === "link" ? p?.download_link : p?.file_url,
              max_downloads: p?.max_downloads_per_user || 5,
            });
            if (deliveryType === "license_key") {
              const { data: availableKey } = await supabase.from("license_keys").select("id").eq("product_id", item.product_id).eq("is_used", false).limit(1).maybeSingle();
              if (availableKey) {
                await supabase.from("license_keys").update({ is_used: true, assigned_to: order.user_id, assigned_order_id: id }).eq("id", availableKey.id);
              }
            }
          }
        }
      }
    }
    fetchOrders();
  };

  const viewOrder = async (order: any) => {
    setSelectedOrder(order);
    const { data } = await supabase.from("order_items").select("*, products(title)").eq("order_id", order.id);
    setItems(data || []);
  };

  const getProofUrl = (path: string) => {
    if (!path) return null;
    const { data } = supabase.storage.from("payment-proofs").getPublicUrl(path);
    return data.publicUrl;
  };

  const statusColor = (s: string) => {
    if (s === "completed") return "bg-green-500/10 text-green-600";
    if (s === "pending" || s === "pending_verification") return "bg-yellow-500/10 text-yellow-600";
    if (s === "cancelled") return "bg-red-500/10 text-red-600";
    return "bg-muted text-muted-foreground";
  };

  const baseFiltered = orders.filter((o) => statusFilter === "all" || o.status === statusFilter);
  const tbl = useAdminTable<any>({
    table: "orders", rows: baseFiltered, refresh: fetchOrders,
    searchKeys: ["customer_name", "customer_email", "id", "status", "payment_method"],
    exportColumns: ["id","customer_name","customer_email","customer_phone","total","status","payment_method","coupon_code","discount_amount","created_at"],
  });

  return (
    <>
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Orders ({orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AdminToolbar
            searchQuery={tbl.search} onSearchChange={tbl.setSearch}
            searchPlaceholder="Search orders, customers, emails..."
            selectedCount={tbl.selected.size} onBulkDelete={tbl.bulkDelete}
            onExport={tbl.handleExport}
            rightSlot={
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending_verification">Pending Verification</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            }
          />
          {loading ? <p className="text-muted-foreground text-sm">Loading...</p> : tbl.filtered.length === 0 ? (
            <p className="text-muted-foreground text-sm">No orders found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"><Checkbox checked={tbl.allSelected} onCheckedChange={tbl.toggleAll} /></TableHead>
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
                  {tbl.filtered.map((o) => (
                    <TableRow key={o.id} data-state={tbl.selected.has(o.id) ? "selected" : undefined}>
                      <TableCell><Checkbox checked={tbl.selected.has(o.id)} onCheckedChange={() => tbl.toggleOne(o.id)} /></TableCell>
                      <TableCell className="font-mono text-xs">#{o.id.slice(0, 8)}</TableCell>
                      <TableCell>
                        <div className="text-sm">{o.customer_name || "—"}</div>
                        <div className="text-xs text-muted-foreground">{o.customer_email || ""}</div>
                      </TableCell>
                      <TableCell className="text-sm">{new Date(o.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-sm font-medium">PKR {Number(o.total).toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(o.status)}`}>{o.status}</span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{o.payment_method || "—"}</TableCell>
                      <TableCell className="text-right flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => viewOrder(o)}><Eye className="h-4 w-4" /></Button>
                        <Select value={o.status} onValueChange={(val) => updateStatus(o.id, val)}>
                          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
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

      <Dialog open={!!selectedOrder} onOpenChange={(v) => { if (!v) setSelectedOrder(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Order #{selectedOrder?.id.slice(0, 8)}</DialogTitle></DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Customer:</span> {selectedOrder.customer_name}</div>
                <div><span className="text-muted-foreground">Email:</span> {selectedOrder.customer_email}</div>
                <div><span className="text-muted-foreground">Phone:</span> {selectedOrder.customer_phone || "—"}</div>
                <div><span className="text-muted-foreground">Payment:</span> {selectedOrder.payment_method}</div>
                {selectedOrder.coupon_code && <div><span className="text-muted-foreground">Coupon:</span> {selectedOrder.coupon_code}</div>}
                {Number(selectedOrder.discount_amount) > 0 && <div><span className="text-muted-foreground">Discount:</span> -PKR {Number(selectedOrder.discount_amount).toLocaleString()}</div>}
              </div>
              {selectedOrder.customer_note && <div className="bg-muted p-3 rounded-lg text-sm"><span className="text-muted-foreground">Note:</span> {selectedOrder.customer_note}</div>}
              <div>
                <h4 className="text-sm font-medium mb-2">Items</h4>
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm py-1">
                    <span>{(item.products as any)?.title || item.product_id.slice(0, 8)} × {item.quantity}</span>
                    <span>PKR {Number(item.price).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-sm pt-2 border-t border-border mt-2">
                  <span>Total</span>
                  <span className="text-primary">PKR {Number(selectedOrder.total).toLocaleString()}</span>
                </div>
              </div>
              {selectedOrder.payment_proof_url && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Payment Proof</h4>
                  <img src={getProofUrl(selectedOrder.payment_proof_url) || ""} alt="Payment proof" className="max-h-48 rounded-lg border border-border" />
                </div>
              )}
              <div className="flex gap-2">
                <Button size="sm" onClick={() => { updateStatus(selectedOrder.id, "completed"); setSelectedOrder(null); }} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => { updateStatus(selectedOrder.id, "cancelled"); setSelectedOrder(null); }} className="flex-1">
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
