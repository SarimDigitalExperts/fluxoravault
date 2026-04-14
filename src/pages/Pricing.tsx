import { Check, Zap, Crown, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter", price: 9, period: "/month",
    description: "Perfect for beginners exploring digital assets",
    icon: Zap, featured: false,
    features: ["5 downloads per month", "Access to free assets", "Basic file formats", "Email support", "Personal use license"],
  },
  {
    name: "Pro", price: 29, period: "/month",
    description: "Ideal for professionals and freelancers",
    icon: Crown, featured: true,
    features: ["50 downloads per month", "Access to all assets", "Premium file formats", "Priority support", "Commercial license", "Early access to new drops", "Custom requests"],
  },
  {
    name: "Enterprise", price: 79, period: "/month",
    description: "For teams and agencies needing unlimited access",
    icon: Rocket, featured: false,
    features: ["Unlimited downloads", "Access to all assets", "All file formats + source files", "Dedicated account manager", "Extended commercial license", "Team collaboration tools", "API access", "Custom branding options"],
  },
];

export default function Pricing() {
  return (
    <div className="container pt-24 pb-20">
      <div className="text-center mb-14">
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-display font-bold mb-4">
          Choose Your <span className="text-primary">Plan</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-muted-foreground max-w-lg mx-auto">
          Unlock premium digital assets with a plan that fits your workflow. Cancel anytime.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "rounded-2xl p-7 flex flex-col relative bg-card border",
              plan.featured ? "border-primary shadow-lg" : "border-border"
            )}
          >
            {plan.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                Most Popular
              </span>
            )}

            <div className={cn("p-3 rounded-xl w-fit mb-4", plan.featured ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
              <plan.icon className="h-6 w-6" />
            </div>

            <h2 className="text-xl font-display font-bold">{plan.name}</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-5">{plan.description}</p>

            <div className="mb-6">
              <span className="text-4xl font-bold">${plan.price}</span>
              <span className="text-muted-foreground text-sm">{plan.period}</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className={cn("h-4 w-4 mt-0.5 shrink-0", plan.featured ? "text-primary" : "text-muted-foreground")} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Button asChild variant={plan.featured ? "default" : "outline"} className="w-full">
              <Link to="/auth">Get Started</Link>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
