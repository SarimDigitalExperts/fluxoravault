import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, Package, ShoppingCart, BarChart3, Layers, Ticket, Image, FileText, Wallet, Crown, MessageSquare, ArrowLeft, Users, Info, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminLinks = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Orders", to: "/admin/orders", icon: ShoppingCart },
  { label: "Products", to: "/admin/products", icon: Package },
  { label: "Categories", to: "/admin/categories", icon: Layers },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Subscriptions", to: "/admin/pricing-plans", icon: Crown },
  { label: "Coupons", to: "/admin/coupons", icon: Ticket },
  { label: "Payment Methods", to: "/admin/payment-methods", icon: Wallet },
  { label: "Banners", to: "/admin/banners", icon: Image },
  { label: "Blogs", to: "/admin/blogs", icon: FileText },
  { label: "Messages", to: "/admin/messages", icon: MessageSquare },
  { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
  { label: "Digital Signs", to: "/admin/digital-signs", icon: Info },
];

export default function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) return <div className="container pt-24 text-center text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 hidden md:flex flex-col border-r border-border bg-card fixed top-0 left-0 h-screen z-40">
          <div className="p-5 border-b border-border">
            <Link to="/admin" className="flex items-center gap-2">
              <img src="/logo.png" alt="Fluxora Vault" className="h-7 w-7" />
              <span className="font-display font-bold text-sm">Fluxora Vault <span className="text-xs text-muted-foreground font-normal">Admin</span></span>
            </Link>
          </div>

          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {adminLinks.map((l) => {
              const active = l.to === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(l.to);
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                    active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <l.icon className="h-4 w-4" />
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-border space-y-1">
            <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50">
              <ArrowLeft className="h-4 w-4" /> Back to Store
            </Link>
            <button onClick={signOut} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 w-full">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>

          <div className="px-4 py-3 text-[10px] text-muted-foreground/60 text-center border-t border-border">
            Made with ❤️ by Digital Signs Team
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 md:ml-64 min-h-screen">
          {/* Topbar */}
          <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between">
            <h1 className="text-lg font-display font-bold capitalize">
              {adminLinks.find(l => l.to === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(l.to))?.label || "Admin"}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </header>

          <div className="p-6">
            <Outlet />
          </div>

          <footer className="px-6 py-4 text-center text-xs text-muted-foreground/50 border-t border-border">
            This website is made with Digital Signs Team ❤️
          </footer>
        </main>
      </div>
    </div>
  );
}
