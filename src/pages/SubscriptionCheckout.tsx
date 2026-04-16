import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, Upload, ArrowLeft, Zap, Crown, Rocket, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const plans: Record<string, { name: string; monthly: number; yearly: number; icon: any; features: string[] }> = {
  starter: {
    name: "Starter", monthly: 999, yearly: 9990, icon: Zap,
    features: ["5 downloads per month", "Access to free assets", "Basic file formats", "Email support", "Personal use license"],
  },
  pro: {
    name: "Pro", monthly: 2999, yearly: 29990, icon: Crown,
    features: ["50 downloads per month", "Access to all assets", "Premium file formats", "Priority support", "Commercial license", "Early access to new drops"],
  },
  enterprise: {
    name: "Enterprise", monthly: 7999, yearly: 79990, icon: Rocket,
    features: ["Unlimited downloads", "All file formats + source files", "Dedicated account manager", "Extended commercial license", "Team tools", "API access"],
  },
};

export default function SubscriptionCheckout() {
  const { plan: planKey } = useParams<{ plan: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const plan = plans[planKey || ""] || plans.starter;
  const price = billing === "monthly" ? plan.monthly : plan.yearly;
  const savings = billing === "yearly" ? Math.round((1 - plan.yearly / (plan.monthly * 12)) * 100) : 0;

  useEffect(() => {
    if (user) {
      setForm(f => ({ ...f, name: user.user_metadata?.display_name || "", email: user.email || "" }));
    }
    supabase.from("payment_methods").select("*").eq("is_active", true).order("display_order").then(({ data }) => {
      if (data) setPaymentMethods(data);
    });
  }, [user]);

  const handleSubmit = async () => {
    if (!user) { toast.error("Please sign in first"); return; }
    if (!selectedMethod) { toast.error("Please select a payment method"); return; }
    if (!proofFile) { toast.error("Please upload payment screenshot"); return; }

    setSubmitting(true);
    try {
      let proofUrl = "";
      const fileName = `${user.id}/${Date.now()}_${proofFile.name}`;
      const { error: uploadErr } = await supabase.storage.from("payment-proofs").upload(fileName, proofFile);
      if (uploadErr) throw uploadErr;
      proofUrl = fileName;

      const { error } = await supabase.from("orders").insert({
        user_id: user.id,
        total: price,
        status: "pending_verification",
        payment_method: `Subscription: ${plan.name} (${billing})`,
        payment_method_id: selectedMethod,
        payment_proof_url: proofUrl,
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        customer_note: `Plan: ${plan.name} | Billing: ${billing} | Price: PKR ${price.toLocaleString()}`,
      });
      if (error) throw error;

      // Create pending subscription
      const { error: subErr } = await supabase.from("subscriptions").insert({
        user_id: user.id,
        plan: planKey || "starter",
        status: "pending",
        starts_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + (billing === "yearly" ? 365 : 30) * 86400000).toISOString(),
      });
      if (subErr) console.error(subErr);

      setSuccess(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return (
    <div className="container pt-24 pb-16 text-center">
      <p className="text-muted-foreground mb-4">Please sign in to subscribe</p>
      <Button asChild><Link to="/auth">Sign In</Link></Button>
    </div>
  );

  if (success) return (
    <div className="container pt-24 pb-16 max-w-lg mx-auto text-center">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-display font-bold mb-2">Thank You!</h1>
        <p className="text-muted-foreground mb-2">Your subscription request has been submitted.</p>
        <p className="text-sm text-muted-foreground mb-6">Your plan will be activated after payment verification. This usually takes 1-6 hours.</p>
        <Button asChild><Link to="/account">Go to Dashboard</Link></Button>
      </motion.div>
    </div>
  );

  const PlanIcon = plan.icon;
  const selectedPM = paymentMethods.find(m => m.id === selectedMethod);

  return (
    <div className="container pt-24 pb-16 max-w-4xl mx-auto">
      <Link to="/pricing" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Pricing
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-3 space-y-6">
          <h1 className="text-2xl font-display font-bold">Subscribe to {plan.name}</h1>

          {/* Billing Toggle */}
          <div className="flex items-center gap-3 p-1 rounded-xl bg-muted/50 border border-border w-fit">
            <button onClick={() => setBilling("monthly")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${billing === "monthly" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Monthly</button>
            <button onClick={() => setBilling("yearly")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${billing === "yearly" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>
              Yearly {savings > 0 && <Badge className="bg-green-500/10 text-green-600 border-green-200 text-[10px]">Save {savings}%</Badge>}
            </button>
          </div>

          {/* User Details */}
          <div className="rounded-xl border border-border p-5 space-y-4">
            <h3 className="font-semibold text-sm">Your Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label className="text-xs">Full Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><Label className="text-xs">Email</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div className="sm:col-span-2"><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="03XX-XXXXXXX" /></div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="rounded-xl border border-border p-5 space-y-4">
            <h3 className="font-semibold text-sm">Payment Method</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {paymentMethods.map(m => (
                <button key={m.id} onClick={() => setSelectedMethod(m.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${selectedMethod === m.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                  <p className="font-medium text-sm">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.type}</p>
                </button>
              ))}
            </div>
            {selectedPM && (
              <div className="bg-muted/30 rounded-lg p-4 text-sm space-y-1">
                {selectedPM.account_title && <p><span className="text-muted-foreground">Account:</span> {selectedPM.account_title}</p>}
                {selectedPM.account_number && <p><span className="text-muted-foreground">Number:</span> {selectedPM.account_number}</p>}
                {selectedPM.bank_name && <p><span className="text-muted-foreground">Bank:</span> {selectedPM.bank_name}</p>}
                {selectedPM.instructions && <p className="text-xs text-muted-foreground mt-2">{selectedPM.instructions}</p>}
              </div>
            )}
          </div>

          {/* Screenshot Upload */}
          <div className="rounded-xl border border-border p-5 space-y-3">
            <h3 className="font-semibold text-sm">Payment Screenshot</h3>
            <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-8 cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{proofFile ? proofFile.name : "Click to upload screenshot"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={e => setProofFile(e.target.files?.[0] || null)} />
            </label>
          </div>

          <Button className="w-full" size="lg" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Processing..." : `Subscribe Now — PKR ${price.toLocaleString()}`}
          </Button>
          <p className="text-xs text-muted-foreground text-center">Orders are verified within 1-6 hours</p>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border p-6 sticky top-24 bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10"><PlanIcon className="h-5 w-5 text-primary" /></div>
              <div>
                <h3 className="font-display font-bold">{plan.name} Plan</h3>
                <p className="text-xs text-muted-foreground capitalize">{billing} billing</p>
              </div>
            </div>
            <div className="border-t border-border pt-4 mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Price</span>
                <span>PKR {price.toLocaleString()}</span>
              </div>
              {billing === "yearly" && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>You save</span>
                  <span>PKR {(plan.monthly * 12 - plan.yearly).toLocaleString()}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between font-bold border-t border-border pt-3 mb-6">
              <span>Total</span>
              <span>PKR {price.toLocaleString()}</span>
            </div>
            <ul className="space-y-2">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
