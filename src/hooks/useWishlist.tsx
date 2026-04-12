import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Product } from "@/data/products";

interface WishlistContextType {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>(() => {
    const saved = localStorage.getItem("orbit-wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("orbit-wishlist", JSON.stringify(items));
  }, [items]);

  const addToWishlist = (product: Product) => {
    setItems((prev) => prev.some((p) => p.id === product.id) ? prev : [...prev, product]);
  };

  const removeFromWishlist = (productId: string) => {
    setItems((prev) => prev.filter((p) => p.id !== productId));
  };

  const isInWishlist = (productId: string) => items.some((p) => p.id === productId);

  return (
    <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
