import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-20 bg-muted/30">
      <div className="container py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <img src="/logo.png" alt="Signify Vault" className="h-8 mb-3" />
          <p className="text-sm text-muted-foreground mt-3">Smart digital apps & softwares. Premium templates, tools, and resources for creators.</p>
        </div>
        <div>
          <h4 className="font-display font-semibold text-sm mb-3">Quick Links</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
            <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold text-sm mb-3">Legal</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms & Conditions</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold text-sm mb-3">Connect</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Instagram</a>
            <a href="#" className="hover:text-foreground transition-colors">Facebook</a>
            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
          </div>
        </div>
      </div>
      <div className="border-t border-border py-6">
        <p className="text-center text-xs text-muted-foreground">© 2026 Signify Vault. All rights reserved.</p>
      </div>
    </footer>
  );
}
