import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { motion } from "framer-motion";

export default function Cart() {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="container pt-24 pb-16 text-center">
        <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-display font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Discover our premium digital assets</p>
        <Button asChild><Link to="/shop">Browse Shop</Link></Button>
      </div>
    );
  }

  return (
    <div className="container pt-24 pb-16">
      <h1 className="text-3xl font-display font-bold mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <motion.div key={item.product.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="rounded-xl border border-border bg-card p-4 flex gap-4">
              <img src={item.product.image} alt={item.product.title} className="w-20 h-20 rounded-md object-cover" />
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.product.slug}`} className="font-display font-semibold text-sm hover:text-primary transition-colors">{item.product.title}</Link>
                <p className="text-xs text-muted-foreground">{item.product.category}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="h-6 w-6 rounded border border-border flex items-center justify-center hover:border-primary transition-colors"><Minus className="h-3 w-3" /></button>
                    <span className="text-sm w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="h-6 w-6 rounded border border-border flex items-center justify-center hover:border-primary transition-colors"><Plus className="h-3 w-3" /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.product.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="text-right"><span className="font-display font-bold">PKR {(item.product.price * item.quantity).toLocaleString()}</span></div>
            </motion.div>
          ))}
          <button onClick={clearCart} className="text-xs text-muted-foreground hover:text-destructive transition-colors">Clear Cart</button>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 h-fit sticky top-24">
          <h3 className="font-display font-semibold mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>PKR {total.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-primary">-PKR 0</span></div>
          </div>
          <div className="border-t border-border pt-4 mb-6">
            <div className="flex justify-between font-display font-bold text-lg"><span>Total</span><span>PKR {total.toLocaleString()}</span></div>
          </div>
          <Button asChild className="w-full" size="lg"><Link to="/checkout">Checkout <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        </div>
      </div>
    </div>
  );
}
