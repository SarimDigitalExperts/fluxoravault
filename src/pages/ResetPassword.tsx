import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Lock, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase places recovery info in URL hash. The SDK auto-handles it
    // and fires PASSWORD_RECOVERY. We just confirm a session exists.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (password !== confirm) { toast.error("Passwords do not match"); return; }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Your password has been reset successfully");
    setTimeout(() => navigate("/auth"), 800);
  };

  return (
    <div className="container pt-24 pb-16 flex justify-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4">
            <KeyRound className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold">Reset Your Password</h1>
          <p className="text-muted-foreground text-sm mt-1">Enter a new password for your account</p>
        </div>
        {!ready ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            This link is invalid or has expired. Request a new reset link from the sign-in page.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="password" placeholder="New password" value={password}
                onChange={(e) => setPassword(e.target.value)} required minLength={6} className="pl-10" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="password" placeholder="Confirm new password" value={confirm}
                onChange={(e) => setConfirm(e.target.value)} required minLength={6} className="pl-10" />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Updating..." : "Update Password"}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
