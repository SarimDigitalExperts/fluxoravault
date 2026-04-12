import { motion } from "framer-motion";

export default function Terms() {
  return (
    <div className="container pt-24 pb-16 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-display font-bold mb-8">Terms & Conditions</h1>
        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
          <p>Last updated: April 2026</p>
          <h2 className="text-foreground font-display">1. Acceptance of Terms</h2>
          <p>By accessing and using Orbit Assets, you agree to be bound by these terms and conditions.</p>
          <h2 className="text-foreground font-display">2. Digital Products</h2>
          <p>All digital products are delivered electronically. Once purchased, you receive a license to use the assets as specified in each product's license terms.</p>
          <h2 className="text-foreground font-display">3. Refund Policy</h2>
          <p>Due to the digital nature of our products, we offer refunds within 14 days of purchase if the product is defective or significantly different from its description.</p>
          <h2 className="text-foreground font-display">4. Intellectual Property</h2>
          <p>All assets remain the intellectual property of their respective creators. Your purchase grants you a license to use, not ownership of the IP.</p>
          <h2 className="text-foreground font-display">5. Prohibited Use</h2>
          <p>You may not redistribute, resell, or share purchased assets. Each license is for a single user unless otherwise stated.</p>
        </div>
      </motion.div>
    </div>
  );
}
