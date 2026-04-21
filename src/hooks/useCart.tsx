import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Product } from "@/data/products";

export interface CartVariation {
  id: string;
  label: string;
  price: number;
  original_price?: number | null;
  duration_type: string; // onetime | monthly | yearly | weekly | custom
  duration_days?: number | null;
}

interface CartItem {
  product: Product;
  quantity: number;
  variation?: CartVariation;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, variation?: CartVariation) => void;
  removeFromCart: (productId: string, variationId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variationId?: string) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("orbit-cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("orbit-cart", JSON.stringify(items));
  }, [items]);

  const keyOf = (i: CartItem) => `${i.product.id}::${i.variation?.id || "_"}`;

  const addToCart = (product: Product, variation?: CartVariation) => {
    setItems((prev) => {
      const targetKey = `${product.id}::${variation?.id || "_"}`;
      const existing = prev.find((i) => keyOf(i) === targetKey);
      if (existing) return prev.map((i) => keyOf(i) === targetKey ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1, variation }];
    });
  };

  const removeFromCart = (productId: string, variationId?: string) => {
    setItems((prev) => prev.filter((i) => !(i.product.id === productId && (i.variation?.id || undefined) === variationId)));
  };

  const updateQuantity = (productId: string, quantity: number, variationId?: string) => {
    if (quantity <= 0) return removeFromCart(productId, variationId);
    setItems((prev) => prev.map((i) => (i.product.id === productId && (i.variation?.id || undefined) === variationId) ? { ...i, quantity } : i));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + (i.variation?.price ?? i.product.price) * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
