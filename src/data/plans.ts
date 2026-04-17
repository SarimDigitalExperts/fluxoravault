import { Zap, Crown, Rocket, type LucideIcon } from "lucide-react";

export interface Plan {
  name: string;
  planKey: string;
  price: number;
  period: string;
  description: string;
  shortDesc: string;
  icon: LucideIcon;
  featured: boolean;
  features: string[];
}

export const plans: Plan[] = [
  {
    name: "Starter",
    planKey: "starter",
    price: 999,
    period: "/month",
    description: "Perfect for beginners exploring digital assets",
    shortDesc: "5 downloads/month",
    icon: Zap,
    featured: false,
    features: [
      "5 downloads per month",
      "Access to free assets",
      "Basic file formats",
      "Email support",
      "Personal use license",
    ],
  },
  {
    name: "Pro",
    planKey: "pro",
    price: 2999,
    period: "/month",
    description: "Ideal for professionals and freelancers",
    shortDesc: "50 downloads/month",
    icon: Crown,
    featured: true,
    features: [
      "50 downloads per month",
      "Access to all assets",
      "Premium file formats",
      "Priority support",
      "Commercial license",
      "Early access to new drops",
      "Custom requests",
    ],
  },
  {
    name: "Enterprise",
    planKey: "enterprise",
    price: 7999,
    period: "/month",
    description: "For teams and agencies needing unlimited access",
    shortDesc: "Unlimited downloads",
    icon: Rocket,
    featured: false,
    features: [
      "Unlimited downloads",
      "Access to all assets",
      "All file formats + source files",
      "Dedicated account manager",
      "Extended commercial license",
      "Team collaboration tools",
      "API access",
      "Custom branding options",
    ],
  },
];
