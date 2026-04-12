import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Checkout() {
  return (
    <div className="container pt-24 pb-16 text-center max-w-lg">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold mb-4">Checkout</h1>
        <p className="text-muted-foreground mb-8">
          Payment integration coming soon! Connect Lovable Cloud to enable Stripe, JazzCash, and more.
        </p>
        <Button asChild variant="ghost-border">
          <Link to="/cart">Back to Cart</Link>
        </Button>
      </motion.div>
    </div>
  );
}
