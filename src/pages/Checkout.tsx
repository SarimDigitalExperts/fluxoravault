import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Upload, Check, Loader2, Building2, Smartphone, QrCode, CreditCard, User, Mail, Phone, MessageSquare, Lock, Tag, Receipt, Sparkles, ImagePlus, X, Clock } from "lucide-react";
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
        await supabase.from("order_items").insert({
          order_id: order.id,
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.variation?.price ?? item.product.price,
          variation_id: item.variation?.id || null,
          variation_label: item.variation?.label || null,
          duration_type: item.variation?.duration_type || null,
          duration_days: item.variation?.duration_days || null,
        });
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
    <div className="min-h-[80vh] flex items-center justify-center px-4 pt-24 pb-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
          <Lock className="h-9 w-9 text-white" />
        </div>
        <h1 className="text-3xl font-display font-bold mb-3">Sign in to continue</h1>
        <p className="text-muted-foreground mb-8">Securely complete your purchase by signing in to your account.</p>
        <Button asChild size="lg" className="px-8"><Link to="/auth">Sign In to Checkout</Link></Button>
      </motion.div>
    </div>
  );

  if (orderPlaced) return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 pt-24 pb-16">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-lg">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring" }}
          className="h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/30">
          <Check className="h-10 w-10 text-white" strokeWidth={3} />
        </motion.div>
        <h1 className="text-4xl font-display font-bold mb-3">Order Submitted!</h1>
        <p className="text-muted-foreground mb-2">Thanks for your purchase. We're verifying your payment now.</p>
        <div className="inline-flex items-center gap-2 text-sm text-primary bg-primary/10 px-4 py-2 rounded-full mb-8 mt-2">
          <Clock className="h-4 w-4" /> Typically processed within 1–6 hours
        </div>
        <div className="flex gap-3 justify-center">
          <Button asChild variant="outline" size="lg"><Link to="/account/orders">View Orders</Link></Button>
          <Button asChild size="lg"><Link to="/shop">Continue Shopping</Link></Button>
        </div>
      </motion.div>
    </div>
  );

  if (items.length === 0) return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 pt-24 pb-16">
      <div className="text-center max-w-md">
        <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
          <Receipt className="h-9 w-9 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-display font-bold mb-3">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">Looks like you haven't added anything yet.</p>
        <Button asChild size="lg"><Link to="/shop">Browse Shop</Link></Button>
      </div>
    </div>
  );

  const SectionHeader = ({ step, icon: Icon, title, subtitle }: { step: number; icon: any; title: string; subtitle?: string }) => (
    <div className="flex items-start gap-3 mb-5">
      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Step {step}</span>
        </div>
        <h2 className="text-lg font-display font-bold leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 via-background to-background">
      {/* Hero header */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="container relative pt-24 pb-8 max-w-6xl">
          <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to cart
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
                <Shield className="h-3.5 w-3.5" /> 256-bit Secure Checkout
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold">Complete your order</h1>
              <p className="text-muted-foreground mt-1">Review your details and submit for instant verification.</p>
            </div>
            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-2"><div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">1</div><span className="font-medium">Details</span></div>
              <div className="h-px w-6 bg-border" />
              <div className="flex items-center gap-2"><div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">2</div><span className="font-medium">Payment</span></div>
              <div className="h-px w-6 bg-border" />
              <div className="flex items-center gap-2"><div className="h-7 w-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-xs">3</div><span className="text-muted-foreground">Confirm</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="container pt-8 pb-16 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT — Form */}
          <div className="lg:col-span-3 space-y-5">
            {/* Customer Details */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <CardContent className="p-6">
                  <SectionHeader step={1} icon={User} title="Customer details" subtitle="Where should we send the receipt?" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">FULL NAME *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="pl-9 h-11" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">EMAIL *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@email.com" className="pl-9 h-11" />
                      </div>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-semibold text-muted-foreground">PHONE NUMBER *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 300 1234567" className="pl-9 h-11" />
                      </div>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><MessageSquare className="h-3 w-3" /> ORDER NOTE (OPTIONAL)</Label>
                      <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any special instructions for your order..." rows={3} className="resize-none" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Method */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <SectionHeader step={2} icon={CreditCard} title="Choose payment method" subtitle="Select how you'd like to pay" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {paymentMethods.map((pm) => {
                      const active = selectedMethod?.id === pm.id;
                      return (
                        <button key={pm.id} onClick={() => setSelectedMethod(pm)}
                          className={`relative p-4 rounded-xl border-2 text-center transition-all group ${active ? "border-primary bg-primary/5 shadow-md shadow-primary/10" : "border-border hover:border-primary/40 hover:bg-muted/40"}`}>
                          {active && (
                            <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                              <Check className="h-3 w-3" strokeWidth={3} />
                            </div>
                          )}
                          <div className={`flex justify-center mb-2 transition-colors ${active ? "text-primary" : "text-foreground/70 group-hover:text-primary"}`}>
                            {typeIcons[pm.type] || <CreditCard className="h-5 w-5" />}
                          </div>
                          <span className="text-xs font-semibold block">{pm.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  {selectedMethod && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      className="rounded-xl p-5 mt-4 bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 space-y-2 overflow-hidden">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <h3 className="font-bold text-sm">{selectedMethod.name} — Payment Details</h3>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2 text-sm">
                        {selectedMethod.account_title && <div className="bg-background/60 rounded-lg p-2.5"><div className="text-[10px] uppercase font-semibold text-muted-foreground">Account Title</div><div className="font-medium">{selectedMethod.account_title}</div></div>}
                        {selectedMethod.account_number && <div className="bg-background/60 rounded-lg p-2.5"><div className="text-[10px] uppercase font-semibold text-muted-foreground">Account Number</div><div className="font-mono font-medium">{selectedMethod.account_number}</div></div>}
                        {selectedMethod.bank_name && <div className="bg-background/60 rounded-lg p-2.5"><div className="text-[10px] uppercase font-semibold text-muted-foreground">Bank</div><div className="font-medium">{selectedMethod.bank_name}</div></div>}
                        {selectedMethod.phone_number && <div className="bg-background/60 rounded-lg p-2.5"><div className="text-[10px] uppercase font-semibold text-muted-foreground">Phone</div><div className="font-mono font-medium">{selectedMethod.phone_number}</div></div>}
                      </div>
                      {selectedMethod.qr_image_url && <img src={selectedMethod.qr_image_url} alt="QR Code" className="w-40 h-40 rounded-lg bg-background p-2 mx-auto border border-border" />}
                      {selectedMethod.instructions && <p className="text-xs text-muted-foreground italic mt-2 px-1">💡 {selectedMethod.instructions}</p>}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Proof */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <SectionHeader step={3} icon={ImagePlus} title="Upload payment screenshot" subtitle="JPG or PNG, clear and readable" />
                  <label className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all ${proofPreview ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"}`}>
                    {proofPreview ? (
                      <>
                        <img src={proofPreview} alt="Proof" className="max-h-48 rounded-lg shadow-md" />
                        <button type="button" onClick={(e) => { e.preventDefault(); setProofFile(null); setProofPreview(null); }}
                          className="absolute top-3 right-3 h-7 w-7 rounded-full bg-background border border-border flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors">
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-xs text-muted-foreground mt-3">Click to replace</span>
                      </>
                    ) : (
                      <>
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                          <Upload className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-sm font-medium">Click to upload payment proof</span>
                        <span className="text-xs text-muted-foreground mt-1">PNG or JPG (max 5MB)</span>
                      </>
                    )}
                    <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleProofChange} />
                  </label>
                </CardContent>
              </Card>
            </motion.div>

            {/* Terms + Submit */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card className="border-border/60 shadow-sm bg-gradient-to-br from-card to-muted/20">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox id="terms" checked={agreedTerms} onCheckedChange={(v) => setAgreedTerms(!!v)} className="mt-0.5" />
                    <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                      I agree to the <Link to="/terms" className="text-primary hover:underline font-semibold">Terms & Conditions</Link> and confirm that the payment proof is accurate.
                    </Label>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                    <Clock className="h-4 w-4 text-primary shrink-0" />
                    <span>Orders are verified manually and processed within <strong className="text-foreground">1–6 hours</strong>.</span>
                  </div>
                  <Button onClick={handlePlaceOrder} disabled={!canSubmit} size="lg" className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20">
                    {submitting ? (
                      <><Loader2 className="h-5 w-5 animate-spin" /> Processing your order...</>
                    ) : (
                      <><Lock className="h-4 w-4" /> Place Secure Order — PKR {finalTotal.toLocaleString()}</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* RIGHT — Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">
              <Card className="border-border/60 shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-secondary px-6 py-4">
                  <div className="flex items-center justify-between text-primary-foreground">
                    <div className="flex items-center gap-2">
                      <Receipt className="h-5 w-5" />
                      <h2 className="text-base font-bold">Order Summary</h2>
                    </div>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">{items.length} item{items.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1 -mr-1">
                    {items.map((item) => (
                      <div key={`${item.product.id}-${item.variation?.id || "_"}`} className="flex gap-3 pb-3 border-b border-border/50 last:border-0 last:pb-0">
                        {item.product.image && (
                          <div className="h-14 w-14 rounded-lg bg-muted overflow-hidden shrink-0 border border-border/50">
                            <img src={item.product.image} alt={item.product.title} className="h-full w-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{item.product.title}</div>
                          {item.variation && <div className="text-xs text-muted-foreground">{item.variation.label}</div>}
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-muted-foreground">Qty {item.quantity}</span>
                            <span className="text-sm font-bold text-primary">PKR {((item.variation?.price ?? item.product.price) * item.quantity).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coupon */}
                  <div className="pt-3 border-t border-border/50">
                    <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-2"><Tag className="h-3 w-3" /> COUPON CODE</Label>
                    <div className="flex gap-2">
                      <Input placeholder="Enter code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} disabled={couponApplied} className="h-10" />
                      <Button onClick={applyCoupon} disabled={couponApplied} variant={couponApplied ? "secondary" : "outline"} size="sm" className="h-10 px-4">
                        {couponApplied ? <><Check className="h-4 w-4" /> Applied</> : "Apply"}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-border/50">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">PKR {total.toLocaleString()}</span></div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600 font-medium flex items-center gap-1"><Tag className="h-3 w-3" /> Discount</span>
                        <span className="text-green-600 font-semibold">−PKR {discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-baseline pt-3 border-t border-border/50">
                      <span className="text-base font-bold">Total</span>
                      <div className="text-right">
                        <div className="text-2xl font-display font-bold text-primary">PKR {finalTotal.toLocaleString()}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Incl. all charges</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trust badges */}
              <Card className="border-border/60">
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="space-y-1"><Shield className="h-5 w-5 text-primary mx-auto" /><div className="text-[10px] font-semibold">Secure Checkout</div></div>
                    <div className="space-y-1"><Clock className="h-5 w-5 text-primary mx-auto" /><div className="text-[10px] font-semibold">1–6h Delivery</div></div>
                    <div className="space-y-1"><Check className="h-5 w-5 text-primary mx-auto" /><div className="text-[10px] font-semibold">Manual Review</div></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
