import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="container pt-24 pb-16">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold mb-4">Get in Touch</h1>
          <p className="text-muted-foreground">Have questions? We'd love to hear from you.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-6">
            {[
              { icon: Mail, title: "Email", value: "hello@orbitassets.com" },
              { icon: MapPin, title: "Location", value: "Global — Remote First" },
              { icon: MessageSquare, title: "Support", value: "24/7 Live Chat" },
            ].map((item) => (
              <div key={item.title} className="glass rounded-lg p-5 flex items-start gap-4">
                <item.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="md:col-span-2 glass rounded-lg p-8 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="bg-muted/50 border-border" />
              <Input type="email" placeholder="Your Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="bg-muted/50 border-border" />
            </div>
            <Textarea placeholder="Your Message" rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required className="bg-muted/50 border-border" />
            <Button type="submit" variant="glow" size="lg" className="w-full">Send Message</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
