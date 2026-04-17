import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-border mt-20 bg-muted/30">
      <div className="container py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <img src="/logo.png" alt="Signify Vault" className="h-8 mb-3" />
          <p className="text-sm text-muted-foreground mt-3">{t("footer_tagline")}</p>
        </div>
        <div>
          <h4 className="font-display font-semibold text-sm mb-3">{t("quick_links")}</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/shop" className="hover:text-foreground transition-colors">{t("shop")}</Link>
            <Link to="/pricing" className="hover:text-foreground transition-colors">{t("pricing")}</Link>
            <Link to="/blog" className="hover:text-foreground transition-colors">{t("blog")}</Link>
            <Link to="/about" className="hover:text-foreground transition-colors">{t("about")}</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">{t("contact")}</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold text-sm mb-3">{t("legal")}</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/terms" className="hover:text-foreground transition-colors">{t("terms_conditions")}</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">{t("privacy_policy")}</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold text-sm mb-3">{t("connect")}</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <a href="https://wa.me/447907269967" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">{t("whatsapp_support")}</a>
            <a href="#" className="hover:text-foreground transition-colors">Instagram</a>
            <a href="#" className="hover:text-foreground transition-colors">Facebook</a>
            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
          </div>
        </div>
      </div>
      <div className="border-t border-border py-6">
        <p className="text-center text-xs text-muted-foreground">© 2026 Signify Vault. {t("rights_reserved")}</p>
      </div>
    </footer>
  );
}
