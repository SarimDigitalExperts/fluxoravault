import { Link } from "react-router-dom";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import type { Product } from "@/data/products";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const wishlisted = isInWishlist(product.id);
  const sales = (product.reviews || 0) * 25 + 100; // derived display number

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-card rounded-2xl border border-border overflow-hidden hover:-translate-y-0.5 hover:border-primary/40 transition-all duration-300"
    >
      {/* Image inside padded frame with inner border */}
      <div className="p-3">
        <Link
          to={`/product/${product.slug}`}
          className="block relative overflow-hidden aspect-square rounded-xl border border-border bg-muted/30"
        >
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {product.tags.length > 0 && (
            <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
              {product.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary text-primary-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              wishlisted ? removeFromWishlist(product.id) : addToWishlist(product);
            }}
            aria-label="Wishlist"
            className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-card/95 backdrop-blur shadow-sm flex items-center justify-center text-foreground hover:text-primary transition-colors"
          >
            <Heart className={`h-4 w-4 ${wishlisted ? "fill-primary text-primary" : ""}`} />
          </button>
        </Link>
      </div>

      {/* Title */}
      <div className="px-4">
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-display font-bold text-base leading-snug line-clamp-2 hover:text-primary transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Author + price row */}
        <div className="flex items-center justify-between mt-2.5 pb-3">
          <p className="text-xs text-muted-foreground">
            by <span className="text-foreground font-medium">{product.category}</span>
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-extrabold text-lg">
              PKR {product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Footer: sales / rating / live demo */}
      <div className="px-4 py-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">{sales.toLocaleString()} Sales</p>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.round(product.rating || 0)
                    ? "fill-primary text-primary"
                    : "text-muted-foreground/30"
                }`}
              />
            ))}
            <span className="text-[11px] text-muted-foreground ml-0.5">({product.reviews})</span>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => addToCart(product)}
          className="rounded-full text-xs h-8 px-4"
        >
          <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Add to Cart
        </Button>
      </div>
    </motion.div>
  );
}
