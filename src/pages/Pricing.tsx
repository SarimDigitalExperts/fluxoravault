import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, Clock, ArrowLeft, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Pricing() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 pt-16 pb-16 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative text-center max-w-2xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
          className="h-24 w-24 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/30"
        >
          <Clock className="h-12 w-12 text-white" />
        </motion.div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4 uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" /> Coming Soon
        </div>

        <h1 className="text-4xl sm:text-6xl font-display font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Pricing Coming Soon
        </h1>

        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
          We're crafting flexible pricing plans designed to give you the best value.
          Stay tuned — something exciting is on the way.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link to="/shop">
              <ArrowLeft className="h-4 w-4" /> Browse the Shop
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link to="/contact">
              <Bell className="h-4 w-4" /> Notify Me
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
