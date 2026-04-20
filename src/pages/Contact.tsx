import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MapPin, MessageSquare, Phone, Clock, Send, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const CONTACT_EMAIL = "signifyvault@digitalsigns.site";
const CONTACT_PHONE = "+447907269967";
const WA_LINK = "https://wa.me/447907269967";

export default function Contact() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    topic: "general",
    subject: "",
    message: "",
    consent: false,
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.consent) { toast.error("Please accept the privacy notice"); return; }
    setSending(true);
    const meta = `Topic: ${form.topic}${form.phone ? `\nPhone: ${form.phone}` : ""}${form.company ? `\nCompany: ${form.company}` : ""}\n\n${form.message}`;
    const { error } = await supabase.from("contact_messages").insert({
      name: form.name,
      email: form.email,
      subject: form.subject || form.topic,
      message: meta,
      user_id: user?.id ?? null,
    });
    setSending(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", phone: "", company: "", topic: "general", subject: "", message: "", consent: false });
  };

  return (
    <div className="bg-muted/20">
      {/* Hero */}
      <section className="container pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-3">
            <MessageSquare className="h-3 w-3" /> Get in touch
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold mb-4 leading-tight">
            Let's <span className="italic text-primary">talk</span>.
          </h1>
          <p className="text-muted-foreground">
            Questions, partnerships, or feedback — our team typically replies within a few hours.
          </p>
        </motion.div>
      </section>

      <section className="container pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: contact info cards */}
          <div className="space-y-4 lg:col-span-1">
            {[
              { icon: Mail, title: "Email us", value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}`, hint: "Replies within hours" },
              { icon: Phone, title: "Call us", value: CONTACT_PHONE, href: `tel:${CONTACT_PHONE.replace(/\s/g, "")}`, hint: "Mon–Sat" },
              { icon: MessageSquare, title: "WhatsApp", value: CONTACT_PHONE, href: WA_LINK, hint: "Fastest support" },
              { icon: MapPin, title: "Location", value: "Global — Remote First", hint: "We work worldwide" },
              { icon: Clock, title: "Hours", value: "9:00 – 21:00 PKT", hint: "Mon to Sat" },
            ].map((item) => {
              const inner = (
                <div className="rounded-2xl border border-border bg-card p-5 flex items-start gap-4 hover:border-primary/40 hover:shadow-sm transition-all h-full">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{item.title}</p>
                    <p className="text-sm font-medium mt-0.5 truncate">{item.value}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{item.hint}</p>
                  </div>
                </div>
              );
              return item.href ? (
                <a key={item.title} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">{inner}</a>
              ) : (
                <div key={item.title}>{inner}</div>
              );
            })}
          </div>

          {/* Right: form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm space-y-5">
            <div>
              <h2 className="text-xl font-display font-bold">Send us a message</h2>
              <p className="text-sm text-muted-foreground">Fill in the form and we'll be in touch shortly.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">Full name *</Label>
                <Input id="name" placeholder="Jane Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">Email *</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs">Phone (optional)</Label>
                <Input id="phone" type="tel" placeholder="+44 7907 269967" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company" className="text-xs">Company (optional)</Label>
                <Input id="company" placeholder="Acme Inc." value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Topic *</Label>
                <Select value={form.topic} onValueChange={(v) => setForm({ ...form, topic: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Inquiry</SelectItem>
                    <SelectItem value="sales">Sales / Pricing</SelectItem>
                    <SelectItem value="support">Order / Support</SelectItem>
                    <SelectItem value="custom">Custom Project</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="bug">Report a Bug</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="subject" className="text-xs">Subject</Label>
                <Input id="subject" placeholder="Short summary" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message" className="text-xs">Message *</Label>
              <Textarea id="message" placeholder="How can we help?" rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
            </div>

            <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
              />
              <span>I agree to be contacted regarding this message and have read the <a href="/privacy" className="text-primary underline">privacy policy</a>.</span>
            </label>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <Button type="submit" size="lg" className="flex-1" disabled={sending}>
                {sending ? "Sending..." : (<><Send className="h-4 w-4 mr-2" /> Send Message</>)}
              </Button>
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card hover:bg-muted px-5 h-11 text-sm font-medium transition-colors"
              >
                <MessageSquare className="h-4 w-4 text-[#25D366]" /> Chat on WhatsApp
              </a>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-2 border-t border-border">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Your information is encrypted & never shared.
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
