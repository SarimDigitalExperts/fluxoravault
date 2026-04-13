import { useState, useEffect } from "react";
import { X, Gift, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export default function PromoPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("promo-dismissed");
    if (dismissed) return;
    const timer = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem("promo-dismissed", "1");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(dismiss, 2500);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={dismiss} />
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="relative w-full max-w-md glass-strong rounded-2xl p-8 border border-primary/20 overflow-hidden"
          >
            {/* Decorative glows */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-[80px]" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/20 rounded-full blur-[80px]" />

            <button
              onClick={dismiss}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4">
                <Gift className="h-8 w-8 text-primary-foreground" />
              </div>

              {!submitted ? (
                <>
                  <h3 className="text-xl font-display font-bold mb-2">
                    Get <span className="gradient-text">50% OFF</span> Your First Order
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Subscribe and use code <strong className="text-primary">ORBIT50</strong> at checkout
                  </p>

                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-muted/50 border-border/50"
                    />
                    <Button type="submit" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </form>

                  <div className="mt-4">
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" asChild>
                      <Link to="/shop" onClick={dismiss}>
                        <Sparkles className="h-3 w-3 mr-1" /> Browse Shop
                      </Link>
                    </Button>
                  </div>
                </>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <h3 className="text-xl font-display font-bold mb-2 gradient-text">You're In!</h3>
                  <p className="text-sm text-muted-foreground">
                    Check your inbox for your discount code.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
