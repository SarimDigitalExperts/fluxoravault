import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, Package, ShoppingCart, BarChart3, Layers, Ticket, Image, FileText, Wallet, Crown, MessageSquare, ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const adminLinks = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Products", to: "/admin/products", icon: Package },
  { label: "Orders", to: "/admin/orders", icon: ShoppingCart },
  { label: "Categories", to: "/admin/categories", icon: Layers },
  { label: "Coupons", to: "/admin/coupons", icon: Ticket },
  { label: "Banners", to: "/admin/banners", icon: Image },
  { label: "Blogs", to: "/admin/blogs", icon: FileText },
  { label: "Payment Methods", to: "/admin/payment-methods", icon: Wallet },
  { label: "Pricing Plans", to: "/admin/pricing-plans", icon: Crown },
  { label: "Messages", to: "/admin/messages", icon: MessageSquare },
  { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
];

export default function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="container pt-24 text-center text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="container pt-20 pb-16">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <h1 className="text-2xl font-display font-bold">Admin Panel</h1>
      </div>

      <div className="flex gap-6">
        <aside className="w-56 shrink-0 hidden md:block">
          <nav className="rounded-xl border border-border bg-card p-3 space-y-1 sticky top-24">
            {adminLinks.map((l) => {
              const active = location.pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <l.icon className="h-4 w-4" />
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
