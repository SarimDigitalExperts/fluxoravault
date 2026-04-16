import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Crown, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const planLimits: Record<string, string> = {
  starter: "5 downloads/month",
  pro: "50 downloads/month",
  enterprise: "Unlimited downloads",
};

export default function AccountSubscriptions() {
  const { user } = useAuth();

  const { data: subscriptions = [] } = useQuery({
    queryKey: ["user-subscriptions", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("subscriptions").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const active = subscriptions.find(s => s.status === "active");
  const pending = subscriptions.find(s => s.status === "pending");

  const statusColor: Record<string, string> = {
    active: "bg-green-50 text-green-700 border-green-200",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    expired: "bg-red-50 text-red-700 border-red-200",
    cancelled: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-2">Subscriptions</h1>
      <p className="text-sm text-muted-foreground mb-6">Manage your subscription plan</p>

      {pending && !active && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 mb-6 flex items-start gap-3">
          <Clock className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800">Plan Pending Approval</p>
            <p className="text-sm text-yellow-700">Your <span className="capitalize font-semibold">{pending.plan}</span> plan subscription is awaiting payment verification.</p>
          </div>
        </div>
      )}

      {active ? (
        <div className="rounded-xl border border-border p-6 bg-card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10"><Crown className="h-5 w-5 text-primary" /></div>
            <div>
              <h3 className="font-display font-bold capitalize">{active.plan} Plan</h3>
              <Badge variant="outline" className={statusColor.active}>Active</Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Start Date</p>
              <p className="font-medium">{new Date(active.starts_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Expiry Date</p>
              <p className="font-medium">{active.expires_at ? new Date(active.expires_at).toLocaleDateString() : "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Download Limit</p>
              <p className="font-medium">{planLimits[active.plan] || "—"}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button asChild variant="outline" size="sm"><Link to="/pricing">Change Plan</Link></Button>
          </div>
        </div>
      ) : !pending ? (
        <div className="rounded-xl border border-border p-8 text-center bg-muted/10 mb-6">
          <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium mb-1">No Active Plan</p>
          <p className="text-sm text-muted-foreground mb-4">Subscribe to unlock premium downloads and features.</p>
          <Button asChild><Link to="/pricing">View Plans</Link></Button>
        </div>
      ) : null}

      {/* History */}
      {subscriptions.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-3">Subscription History</h3>
          <div className="space-y-2">
            {subscriptions.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                <div>
                  <p className="text-sm font-medium capitalize">{s.plan} Plan</p>
                  <p className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</p>
                </div>
                <Badge variant="outline" className={statusColor[s.status] || statusColor.cancelled}>{s.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
