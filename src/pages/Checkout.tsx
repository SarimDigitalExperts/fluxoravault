import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Upload, Check, Loader2, Building2, Smartphone, QrCode, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentMethod {
  id: string; name: string; type: string; icon?: string;
  account_title?: string; account_number?: string; bank_name?: string;
  phone_number?: string; qr_image_url?: string; instructions?: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  bank_transfer: <Building2 className="h-5 w-5" />,
  easypaisa: <Smartphone className="h-5 w-5" />,
  sadapay: <CreditCard className="h-5 w-5" />,
  qr_payment: <QrCode className="h-5 w-5" />,
};

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    supabase.from("payment_methods").select("*").eq("is_active", true).order("display_order").then(({ data }) => {
      if (data) setPaymentMethods(data as PaymentMethod[]);
    });
  }, []);

  useEffect(() => { if (user?.email) setEmail(user.email); }, [user]);

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      setProofFile(file); setProofPreview(URL.createObjectURL(file));
    } else { toast.error("Please upload a JPG or PNG image"); }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    if (!user) { toast.error("Please sign in to apply a coupon"); return; }
    const { data } = await supabase.from("coupons").select("*").eq("code", couponCode.toUpperCase()).eq("is_active", true).maybeSingle();
    if (!data) { toast.error("Invalid or expired coupon"); return; }
    const coupon = data as any;
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) { toast.error("Coupon expired"); return; }
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) { toast.error("Coupon usage limit reached"); return; }
    if (coupon.min_order_amount && total < Number(coupon.min_order_amount)) { toast.error(`Minimum order: PKR ${Number(coupon.min_order_amount).toLocaleString()}`); return; }

    // First-order only
    if (coupon.first_order_only) {
      const { count } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq("user_id", user.id);
      if ((count || 0) > 0) { toast.error("This coupon is for first-time orders only"); return; }
    }

    // Per-user limit
    if (coupon.per_user_limit) {
      const { count } = await supabase.from("coupon_redemptions").select("*", { count: "exact", head: true })
        .eq("coupon_id", coupon.id).eq("user_id", user.id);
      if ((count || 0) >= coupon.per_user_limit) { toast.error(`You've already used this coupon ${coupon.per_user_limit} time(s)`); return; }
    }

    // Category restriction
    if (coupon.category_slug) {
      const matches = items.some(it => (it.product as any).categorySlug === coupon.category_slug);
      if (!matches) { toast.error(`This coupon only applies to "${coupon.category_slug}" products`); return; }
    }

    const base = coupon.category_slug
      ? items.filter(it => (it.product as any).categorySlug === coupon.category_slug)
          .reduce((s, it) => s + it.product.price * it.quantity, 0)
      : total;

    const disc = coupon.discount_type === "percentage" ? (base * Number(coupon.discount_value)) / 100 : Number(coupon.discount_value);
    setDiscount(Math.min(disc, total));
    setCouponApplied(true);
    setAppliedCoupon(coupon);
    toast.success(`Coupon applied! -PKR ${Math.min(disc, total).toLocaleString()}${coupon.stackable ? " (stackable)" : ""}`);
  };

  const finalTotal = total - discount;
  const canSubmit = name.trim() && email.trim() && phone.trim() && selectedMethod && proofFile && agreedTerms && items.length > 0 && !submitting;

  const handlePlaceOrder = async () => {
    if (!canSubmit || !user) { toast.error("Please log in and fill all fields"); return; }
    setSubmitting(true);
    try {
      let proofUrl = "";
      if (proofFile) {
        const ext = proofFile.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("payment-proofs").upload(path, proofFile);
        if (uploadErr) throw uploadErr;
        proofUrl = path;
      }
      const { data: order, error: orderErr } = await supabase.from("orders").insert({
        user_id: user.id, total: finalTotal, status: "pending_verification",
        payment_method: selectedMethod!.name, customer_name: name, customer_email: email,
        customer_phone: phone, customer_note: note || null, payment_proof_url: proofUrl,
        coupon_code: couponApplied ? couponCode.toUpperCase() : null, discount_amount: discount,
        payment_method_id: selectedMethod!.id,
      }).select().single();
      if (orderErr) throw orderErr;
      for (const item of items) {
        await supabase.from("order_items").insert({ order_id: order.id, product_id: item.product.id, quantity: item.quantity, price: item.product.price });
      }
      // Record coupon redemption for per-user limit tracking
      if (appliedCoupon) {
        await supabase.from("coupon_redemptions").insert({
          coupon_id: appliedCoupon.id, user_id: user.id, order_id: order.id,
        });
      }
      clearCart(); setOrderPlaced(true);
    } catch (err: any) { toast.error(err.message || "Failed to place order"); }
    finally { setSubmitting(false); }
  };

  if (!user) return (
    <div className="container pt-24 pb-16 text-center max-w-lg">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-display font-bold mb-4">Secure Checkout</h1>
        <p className="text-muted-foreground mb-6">Please sign in to continue with your purchase.</p>
        <Button asChild><Link to="/auth">Sign In</Link></Button>
      </motion.div>
    </div>
  );

  if (orderPlaced) return (
    <div className="container pt-24 pb-16 text-center max-w-lg">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-display font-bold mb-4">Order Submitted!</h1>
        <p className="text-muted-foreground mb-2">Your order will be verified manually.</p>
        <p className="text-sm text-primary mb-8">Orders are typically processed within 1–6 hours.</p>
        <div className="flex gap-3 justify-center">
          <Button asChild variant="outline"><Link to="/account/orders">View Orders</Link></Button>
          <Button asChild><Link to="/shop">Continue Shopping</Link></Button>
        </div>
      </motion.div>
    </div>
  );

  if (items.length === 0) return (
    <div className="container pt-24 pb-16 text-center max-w-lg">
      <h1 className="text-3xl font-display font-bold mb-4">Your cart is empty</h1>
      <Button asChild variant="outline"><Link to="/shop">Browse Shop</Link></Button>
    </div>
  );

  return (
    <div className="container pt-24 pb-16 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/cart" className="text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="h-5 w-5" /></Link>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-display font-bold">Secure Checkout</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-border">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Customer Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Full Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="mt-1" /></div>
                <div><Label>Email *</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@email.com" className="mt-1" /></div>
              </div>
              <div><Label>Phone Number *</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 300 1234567" className="mt-1" /></div>
              <div><Label>Order Note (optional)</Label><Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any special instructions..." rows={3} className="mt-1" /></div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Payment Method</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {paymentMethods.map((pm) => (
                  <button key={pm.id} onClick={() => setSelectedMethod(pm)}
                    className={`p-4 rounded-xl border text-center transition-all ${selectedMethod?.id === pm.id ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}>
                    <div className="flex justify-center mb-2">{typeIcons[pm.type] || <CreditCard className="h-5 w-5" />}</div>
                    <span className="text-xs font-medium">{pm.name}</span>
                  </button>
                ))}
              </div>
              {selectedMethod && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg p-5 space-y-2 mt-4 bg-muted/50 border border-border">
                  <h3 className="font-semibold text-sm text-primary">{selectedMethod.name} Details</h3>
                  {selectedMethod.account_title && <p className="text-sm"><span className="text-muted-foreground">Account Title:</span> {selectedMethod.account_title}</p>}
                  {selectedMethod.account_number && <p className="text-sm"><span className="text-muted-foreground">Account Number:</span> {selectedMethod.account_number}</p>}
                  {selectedMethod.bank_name && <p className="text-sm"><span className="text-muted-foreground">Bank:</span> {selectedMethod.bank_name}</p>}
                  {selectedMethod.phone_number && <p className="text-sm"><span className="text-muted-foreground">Phone:</span> {selectedMethod.phone_number}</p>}
                  {selectedMethod.qr_image_url && <img src={selectedMethod.qr_image_url} alt="QR Code" className="w-40 h-40 rounded-lg bg-background p-2 mx-auto" />}
                  {selectedMethod.instructions && <p className="text-xs text-muted-foreground italic mt-2">{selectedMethod.instructions}</p>}
                </motion.div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Upload Payment Screenshot *</h2>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 cursor-pointer hover:border-primary/50 transition-colors">
                {proofPreview ? <img src={proofPreview} alt="Proof" className="max-h-40 rounded-lg" /> : (
                  <><Upload className="h-8 w-8 text-muted-foreground mb-2" /><span className="text-sm text-muted-foreground">Click to upload JPG or PNG</span></>
                )}
                <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleProofChange} />
              </label>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox id="terms" checked={agreedTerms} onCheckedChange={(v) => setAgreedTerms(!!v)} />
              <Label htmlFor="terms" className="text-sm">I agree to the <Link to="/terms" className="text-primary hover:underline">Terms & Conditions</Link></Label>
            </div>
            <p className="text-xs text-muted-foreground">Orders are processed within 1–6 hours after verification.</p>
            <Button onClick={handlePlaceOrder} disabled={!canSubmit} size="lg" className="w-full">
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : "Place Order"}
            </Button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-4">
            <Card className="border-border">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-lg font-semibold">Order Summary</h2>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span className="truncate mr-2">{item.product.title} × {item.quantity}</span>
                      <span className="font-medium shrink-0">PKR {(item.product.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-3 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>PKR {total.toLocaleString()}</span></div>
                  {discount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Discount</span><span>-PKR {discount.toLocaleString()}</span></div>}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-border"><span>Total</span><span className="text-primary">PKR {finalTotal.toLocaleString()}</span></div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <Input placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} disabled={couponApplied} />
                  <Button onClick={applyCoupon} disabled={couponApplied} variant="outline" size="sm">{couponApplied ? "Applied" : "Apply"}</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
