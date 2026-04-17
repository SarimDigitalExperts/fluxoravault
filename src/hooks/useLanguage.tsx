import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Lang = "en" | "ur";

const translations: Record<Lang, Record<string, string>> = {
  en: {
    home: "Home", shop: "Shop", pricing: "Pricing", blog: "Blog", about: "About", contact: "Contact",
    sign_in: "Sign In", my_account: "My Account", admin_panel: "Admin Panel", sign_out: "Sign Out",
    browse_products: "Browse Products", view_pricing: "View Pricing",
    hero_title: "All Your Digital Assets in One Vault",
    hero_subtitle: "Premium apps, tools, and resources for creators, freelancers, and professionals.",
    secure_payments: "Secure Payments", instant_access: "Instant Access After Approval", verified_products: "Verified Products",
    assets: "Assets", users: "Users", sales: "Sales",
    cart: "Cart", wishlist: "Wishlist", search: "Search",
  },
  ur: {
    home: "ہوم", shop: "شاپ", pricing: "قیمت", blog: "بلاگ", about: "تعارف", contact: "رابطہ",
    sign_in: "سائن ان", my_account: "میرا اکاؤنٹ", admin_panel: "ایڈمن پینل", sign_out: "سائن آؤٹ",
    browse_products: "پراڈکٹس دیکھیں", view_pricing: "قیمتیں دیکھیں",
    hero_title: "آپ کے تمام ڈیجیٹل اثاثے ایک والٹ میں",
    hero_subtitle: "تخلیق کاروں، فری لانسرز اور پیشہ ور افراد کے لیے پریمیم ایپس، ٹولز اور وسائل۔",
    secure_payments: "محفوظ ادائیگیاں", instant_access: "منظوری کے بعد فوری رسائی", verified_products: "تصدیق شدہ مصنوعات",
    assets: "اثاثے", users: "صارفین", sales: "فروخت",
    cart: "کارٹ", wishlist: "وش لسٹ", search: "تلاش",
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
