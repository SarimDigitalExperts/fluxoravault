import { motion } from "framer-motion";
import { Rocket, Users, Globe, Shield } from "lucide-react";

export default function About() {
  return (
    <div className="container pt-24 pb-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
          About <span className="text-primary">Fluxora Mart</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          We're on a mission to empower creators with the best digital tools, apps, and software resources. From stunning templates to comprehensive courses — everything in one place.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {[
          { icon: Rocket, title: "Built for Speed", desc: "Instant downloads, no waiting. Get your assets and start building immediately." },
          { icon: Users, title: "Creator Community", desc: "Join thousands of designers and developers who trust Fluxora Mart." },
          { icon: Globe, title: "Global Reach", desc: "Assets used by creators in over 120 countries worldwide." },
          { icon: Shield, title: "Quality Guaranteed", desc: "Every asset is reviewed for quality before being listed on our marketplace." },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border border-border bg-card p-8"
          >
            <item.icon className="h-10 w-10 text-primary mb-4" />
            <h3 className="font-display font-semibold text-xl mb-2">{item.title}</h3>
            <p className="text-muted-foreground">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
