import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Lang = "en" | "ur";

const translations: Record<Lang, Record<string, string>> = {
  en: {
    // Nav
    home: "Home", shop: "Shop", pricing: "Pricing", blog: "Blog", about: "About", contact: "Contact",
    sign_in: "Sign In", sign_up: "Sign Up", my_account: "My Account", admin_panel: "Admin Panel", sign_out: "Sign Out",
    cart: "Cart", wishlist: "Wishlist", search: "Search",
    // Hero
    browse_products: "Browse Products", view_pricing: "View Pricing",
    hero_title: "All Your Digital Assets in One Vault",
    hero_subtitle: "Premium apps, tools, and resources for creators, freelancers, and professionals.",
    secure_payments: "Secure Payments", instant_access: "Instant Access After Approval", verified_products: "Verified Products",
    assets: "Assets", users: "Users", sales: "Sales",
    premium_marketplace: "Premium Digital Marketplace",
    // Footer
    quick_links: "Quick Links", legal: "Legal", connect: "Connect",
    terms_conditions: "Terms & Conditions", privacy_policy: "Privacy Policy",
    whatsapp_support: "WhatsApp Support",
    footer_tagline: "Smart digital apps & softwares. Premium templates, tools, and resources for creators.",
    rights_reserved: "All rights reserved.",
    // Sections
    why_choose: "Why Choose", browse_category: "Browse by Category", how_it_works: "How It Works",
    featured_products: "Featured Products", trending_now: "Trending Now", best_sellers: "Best Sellers",
    new_arrivals: "New Arrivals", latest_products: "Latest Products", view_all: "View All",
    // Common
    add_to_cart: "Add to Cart", buy_now: "Buy Now", checkout: "Checkout", total: "Total",
    subtotal: "Subtotal", discount: "Discount", apply: "Apply", coupon: "Coupon",
    loading: "Loading...", no_results: "No results found",
  },
  ur: {
    home: "ہوم", shop: "شاپ", pricing: "قیمت", blog: "بلاگ", about: "تعارف", contact: "رابطہ",
    sign_in: "سائن ان", sign_up: "سائن اپ", my_account: "میرا اکاؤنٹ", admin_panel: "ایڈمن پینل", sign_out: "سائن آؤٹ",
    cart: "کارٹ", wishlist: "وش لسٹ", search: "تلاش",
    browse_products: "پراڈکٹس دیکھیں", view_pricing: "قیمتیں دیکھیں",
    hero_title: "آپ کے تمام ڈیجیٹل اثاثے ایک والٹ میں",
    hero_subtitle: "تخلیق کاروں، فری لانسرز اور پیشہ ور افراد کے لیے پریمیم ایپس، ٹولز اور وسائل۔",
    secure_payments: "محفوظ ادائیگیاں", instant_access: "منظوری کے بعد فوری رسائی", verified_products: "تصدیق شدہ مصنوعات",
    assets: "اثاثے", users: "صارفین", sales: "فروخت",
    premium_marketplace: "پریمیم ڈیجیٹل مارکیٹ پلیس",
    quick_links: "فوری لنکس", legal: "قانونی", connect: "رابطہ کریں",
    terms_conditions: "شرائط و ضوابط", privacy_policy: "رازداری کی پالیسی",
    whatsapp_support: "واٹس ایپ سپورٹ",
    footer_tagline: "اسمارٹ ڈیجیٹل ایپس اور سافٹ ویئر۔ تخلیق کاروں کے لیے پریمیم ٹیمپلیٹس، ٹولز اور وسائل۔",
    rights_reserved: "جملہ حقوق محفوظ ہیں۔",
    why_choose: "کیوں منتخب کریں", browse_category: "زمرہ کے لحاظ سے دیکھیں", how_it_works: "یہ کیسے کام کرتا ہے",
    featured_products: "نمایاں مصنوعات", trending_now: "ٹرینڈنگ", best_sellers: "بیسٹ سیلرز",
    new_arrivals: "نئی آمد", latest_products: "تازہ ترین مصنوعات", view_all: "سب دیکھیں",
    add_to_cart: "کارٹ میں شامل کریں", buy_now: "ابھی خریدیں", checkout: "چیک آؤٹ", total: "کل",
    subtotal: "ذیلی کل", discount: "رعایت", apply: "لاگو کریں", coupon: "کوپن",
    loading: "لوڈ ہو رہا ہے...", no_results: "کوئی نتیجہ نہیں ملا",
  },
};

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({ lang: "en", setLang: () => {}, t: (k) => k });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem("lang") as Lang) || "en");

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
  }, [lang]);

  const t = (key: string) => translations[lang][key] || translations.en[key] || key;

  return <LanguageContext.Provider value={{ lang, setLang: setLangState, t }}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
