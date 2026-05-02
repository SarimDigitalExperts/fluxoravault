import { CreditCard } from "lucide-react";

export default function AccountBilling() {
  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">Billing</h1>
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
