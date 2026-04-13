import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function AccountBilling() {
  const { user } = useAuth();

  const { data: subscription } = useQuery({
    queryKey: ["user-subscription", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user!.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const planName = subscription?.plan || "Free";

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">Billing & Subscription</h1>

      <div className="glass-strong rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Current Plan</p>
            <p className="text-xl font-bold capitalize">{planName}</p>
          </div>
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Zap className="h-6 w-6" />
          </div>
        </div>
        {subscription?.expires_at && (
          <p className="text-xs text-muted-foreground">
            Renews on {new Date(subscription.expires_at).toLocaleDateString()}
          </p>
        )}
        <Button asChild className="mt-4" variant="glow-blue">
          <Link to="/pricing">
            {planName === "Free" || !subscription ? "Upgrade Plan" : "Change Plan"}
          </Link>
        </Button>
      </div>

      <div className="glass-strong rounded-2xl p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5" /> Payment Methods
        </h2>
        <p className="text-sm text-muted-foreground">
          Payment integration coming soon. You'll be able to manage your cards and billing info here.
        </p>
      </div>
    </div>
  );
}
