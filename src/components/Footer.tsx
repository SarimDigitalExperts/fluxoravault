import { Link } from "react-router-dom";
import {
  Mail, Phone, MapPin, ArrowRight, Instagram, Facebook, Twitter,
  Youtube, Linkedin, Shield, Download, Zap, CreditCard,
} from "lucide-react";

const socials = [
  { name: "Instagram", icon: Instagram, href: "#" },
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "YouTube", icon: Youtube, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
];

const trustBadges = [
  { icon: Download, label: "Instant Delivery" },
  { icon: Shield, label: "Secure Payments" },
  { icon: Zap, label: "Lifetime Access" },
  { icon: CreditCard, label: "Multiple Methods" },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-gradient-to-b from-muted/20 via-muted/40 to-muted/60 relative overflow-hidden">
      {/* decorative blob */}
      <div className="pointer-events-none absolute -top-32 left-1/3 h-72 w-[40rem] rounded-full bg-primary/5 blur-3xl" />

      {/* Trust badges strip */}
      <div className="relative border-b border-border/60">
        <div className="container py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {trustBadges.map((b) => (
            <div key={b.label} className="flex items-center gap-3 justify-center md:justify-start">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <b.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-display font-semibold">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div className="relative container py-14 grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Brand column */}
        <div className="md:col-span-4">
          <Link to="/" className="inline-flex items-center">
            <img src="/logo.png" alt="Signify Vault" className="h-9" />
          </Link>
          <p className="text-sm text-muted-foreground mt-4 leading-relaxed max-w-sm">
            Premium digital apps, software, templates and tools — handpicked for creators, freelancers and growing teams.
          </p>

          {/* Contact rows */}
          <div className="mt-6 space-y-2.5">
            <a
              href="mailto:signifyvault@digitalsigns.site"
              className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail className="h-4 w-4 shrink-0" />
              signifyvault@digitalsigns.site
            </a>
            <a
              href="https://wa.me/447907269967"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Phone className="h-4 w-4 shrink-0" />
              +44 7907 269967
            </a>
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              Worldwide · Online store
            </div>
          </div>

          {/* Social */}
          <div className="flex items-center gap-2 mt-6">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                aria-label={s.name}
                className="h-9 w-9 rounded-md border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-primary-foreground hover:bg-primary hover:border-primary transition-colors"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="md:col-span-2">
          <h4 className="font-display font-bold text-sm mb-4 uppercase tracking-wider">Shop</h4>
          <div className="flex flex-col gap-2.5 text-sm text-muted-foreground">
            <Link to="/shop" className="hover:text-primary transition-colors">All Products</Link>
            <Link to="/shop?sort=latest" className="hover:text-primary transition-colors">New Arrivals</Link>
            <Link to="/shop?sort=trending" className="hover:text-primary transition-colors">Trending</Link>
            <Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
            <Link to="/wishlist" className="hover:text-primary transition-colors">Wishlist</Link>
          </div>
        </div>

        {/* Company */}
        <div className="md:col-span-2">
          <h4 className="font-display font-bold text-sm mb-4 uppercase tracking-wider">Company</h4>
          <div className="flex flex-col gap-2.5 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-primary transition-colors">About Us</Link>
            <Link to="/blogs" className="hover:text-primary transition-colors">Blog</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          </div>
        </div>

        {/* Newsletter */}
        <div className="md:col-span-4">
          <h4 className="font-display font-bold text-sm mb-4 uppercase tracking-wider">Stay in the loop</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Weekly drops, exclusive deals and free assets — delivered to your inbox.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="relative flex items-center"
          >
            <Mail className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="w-full h-11 pl-9 pr-28 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
            />
            <button
              type="submit"
              className="absolute right-1 h-9 px-3 rounded-md bg-primary text-primary-foreground text-xs font-semibold inline-flex items-center gap-1 hover:opacity-90 transition-opacity"
            >
              Subscribe <ArrowRight className="h-3 w-3" />
            </button>
          </form>
          <p className="text-[11px] text-muted-foreground mt-2">By subscribing you agree to our Privacy Policy.</p>

          {/* Payment methods — grouped */}
          <div className="mt-6">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">We accept</p>
            <div className="space-y-3">
              {[
                {
                  group: "E-Wallets",
                  items: [
                    { name: "Easypaisa", src: "https://logos-world.net/wp-content/uploads/2022/12/Easypaisa-Logo.png", bg: "bg-white" },
                    { name: "JazzCash", src: "https://seeklogo.com/images/J/jazzcash-logo-7BBE0E055F-seeklogo.com.png", bg: "bg-white" },
                    { name: "SadaPay", src: "https://seeklogo.com/images/S/sadapay-logo-A8AC0E2C9F-seeklogo.com.png", bg: "bg-white" },
                    { name: "NayaPay", src: "https://seeklogo.com/images/N/nayapay-logo-3DC4FA8DE1-seeklogo.com.png", bg: "bg-white" },
                  ],
                },
                {
                  group: "Bank Transfer",
                  items: [
                    { name: "Meezan Bank", src: "https://seeklogo.com/images/M/meezan-bank-logo-8B0F1B0EFE-seeklogo.com.png", bg: "bg-white" },
                    { name: "Bank Alfalah", src: "https://seeklogo.com/images/B/bank-alfalah-logo-7CB0BBC8A1-seeklogo.com.png", bg: "bg-white" },
                    { name: "HBL", src: "https://seeklogo.com/images/H/hbl-habib-bank-limited-logo-1F0843A7AB-seeklogo.com.png", bg: "bg-white" },
                  ],
                },
                {
                  group: "Cards",
                  items: [
                    { name: "Visa", src: "https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons@main/flat/visa.svg", bg: "bg-white" },
                    { name: "Mastercard", src: "https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons@main/flat/mastercard.svg", bg: "bg-white" },
                    { name: "PayPak", src: "https://seeklogo.com/images/P/paypak-logo-F6A2D2F3E2-seeklogo.com.png", bg: "bg-white" },
                  ],
                },
                {
                  group: "QR Payments",
                  items: [
                    { name: "Raast", src: "https://seeklogo.com/images/R/raast-logo-2F0E5F8E6F-seeklogo.com.png", bg: "bg-white" },
                  ],
                },
              ].map((row) => (
                <div key={row.group}>
                  <p className="text-[10px] font-semibold text-muted-foreground/80 mb-1.5">{row.group}</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {row.items.map((m) => (
                      <div
                        key={m.name}
                        title={m.name}
                        className={`h-9 w-14 rounded-md ${m.bg} border border-border flex items-center justify-center p-1 shadow-sm`}
                      >
                        <img
                          src={m.src}
                          alt={m.name}
                          loading="lazy"
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            const t = e.currentTarget as HTMLImageElement;
                            t.style.display = "none";
                            const parent = t.parentElement;
                            if (parent && !parent.querySelector("span")) {
                              const s = document.createElement("span");
                              s.textContent = m.name;
                              s.className = "text-[9px] font-bold text-foreground text-center leading-tight";
                              parent.appendChild(s);
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-border bg-muted/40">
        <div className="container py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} <span className="font-semibold text-foreground">Signify Vault</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <span className="opacity-40">•</span>
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <span className="opacity-40">•</span>
            <Link to="/contact" className="hover:text-primary transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
