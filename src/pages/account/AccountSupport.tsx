import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { HelpCircle, Send, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const faqs = [
  { q: "How do I download my purchased product?", a: "After your payment is verified by admin, downloads will appear in your Downloads section. You can download up to 5 times per purchase." },
  { q: "How long does payment verification take?", a: "Orders are typically verified within 1-6 hours during business hours." },
  { q: "What if my order is rejected?", a: "If your order is rejected, please contact support with your payment details for assistance." },
  { q: "Can I upgrade my subscription plan?", a: "Yes! Go to the Pricing page and select a new plan. Your old plan will be replaced after admin approval." },
  { q: "Do I get refunds?", a: "Since we sell digital products, refunds are handled on a case-by-case basis. Contact support within 24 hours." },
];

export default function AccountSupport() {
  const { user } = useAuth();
  const [form, setForm] = useState({ subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async () => {
    if (!form.subject.trim() || !form.message.trim()) { toast.error("Please fill all fields"); return; }
    setSending(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: user?.user_metadata?.display_name || "User",
      email: user?.email || "",
      subject: form.subject,
      message: form.message,
      user_id: user?.id,
    });
    if (error) toast.error("Failed to send message");
    else { toast.success("Message sent! We'll get back to you soon."); setForm({ subject: "", message: "" }); }
    setSending(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-2">Support & Help</h1>
      <p className="text-sm text-muted-foreground mb-8">Get help with your orders, downloads, or account</p>

      {/* Contact Form */}
      <div className="rounded-xl border border-border p-6 mb-8 bg-card">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Send className="h-4 w-4 text-primary" /> Contact Support</h3>
        <div className="space-y-4">
          <div><Label className="text-xs">Subject</Label><Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="What do you need help with?" /></div>
          <div><Label className="text-xs">Message</Label><Textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={4} placeholder="Describe your issue..." /></div>
          <Button onClick={handleSubmit} disabled={sending}>{sending ? "Sending..." : "Send Message"}</Button>
        </div>
        <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
          <p>📧 support@signifyvault.com</p>
          <p>💬 WhatsApp available</p>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h3 className="font-semibold mb-4 flex items-center gap-2"><HelpCircle className="h-4 w-4 text-primary" /> Frequently Asked Questions</h3>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border border-border overflow-hidden bg-card">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
                <span className="text-sm font-medium">{faq.q}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              {openFaq === i && <div className="px-4 pb-4"><p className="text-sm text-muted-foreground">{faq.a}</p></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
