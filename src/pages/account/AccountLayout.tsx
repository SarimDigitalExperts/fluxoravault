import { Link, Outlet, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, Package, Heart, Download, CreditCard, Settings, LogOut, Shield, Crown, HelpCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { label: "Dashboard", to: "/account", icon: LayoutDashboard, end: true },
  { label: "My Orders", to: "/account/orders", icon: Package },
  { label: "Downloads", to: "/account/downloads", icon: Download },
  { label: "Wishlist", to: "/account/wishlist", icon: Heart },
  
  { label: "Billing", to: "/account/billing", icon: CreditCard },
  { label: "Support", to: "/account/support", icon: HelpCircle },
  { label: "Settings", to: "/account/settings", icon: Settings },
];

export default function AccountLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const displayName = user.user_metadata?.display_name || user.email?.split("@")[0] || "User";
  const initial = displayName.charAt(0).toUpperCase();
  const activeCrumb = sidebarLinks.find(l => l.end ? location.pathname === l.to : location.pathname.startsWith(l.to))?.label || "Account";

  return (
    <div className="bg-muted/20 min-h-screen">
      {/* Page header band */}
      <div className="border-b border-border bg-card">
        <div className="container pt-24 pb-6">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/account" className="hover:text-foreground">Account</Link>
            {activeCrumb !== "Dashboard" && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-medium">{activeCrumb}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center text-xl font-bold shadow-md">
              {initial}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-display font-extrabold truncate">Hi, {displayName} 👋</h1>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 shrink-0">
            <div className="rounded-2xl border border-border bg-card p-3 space-y-0.5 sticky top-24 shadow-sm">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-3 py-2 font-semibold">Menu</p>
              {sidebarLinks.map((link) => {
                const isActive = link.end ? location.pathname === link.to : location.pathname.startsWith(link.to);
                return (
                  <Link key={link.to} to={link.to}
                    className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all relative",
                      isActive ? "bg-primary text-primary-foreground font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}>
                    <link.icon className="h-4 w-4" />
                    <span className="flex-1">{link.label}</span>
                    {isActive && <ChevronRight className="h-3.5 w-3.5" />}
                  </Link>
                );
              })}

              {isAdmin && (
                <>
                  <div className="border-t border-border my-2" />
                  <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                    <Shield className="h-4 w-4" /> Admin Panel
                  </Link>
                </>
              )}

              <div className="border-t border-border my-2" />
              <button onClick={signOut} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 w-full transition-all">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
