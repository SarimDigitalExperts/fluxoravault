import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import type { Product } from "@/data/products";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      <Link to={`/product/${product.slug}`} className="block relative overflow-hidden aspect-[4/3]">
        <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {product.tags.length > 0 && (
          <div className="absolute top-3 left-3 flex gap-1.5">
            {product.tags.map((tag) => (
              <span key={tag} className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link to={`/product/${product.slug}`}>
            <h3 className="font-display font-semibold text-sm leading-tight hover:text-primary transition-colors">{product.title}</h3>
          </Link>
          <button
            onClick={() => wishlisted ? removeFromWishlist(product.id) : addToWishlist(product)}
            className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
          >
            <Heart className={`h-4 w-4 ${wishlisted ? "fill-primary text-primary" : ""}`} />
          </button>
        </div>

        <p className="text-xs text-muted-foreground mb-3">{product.category}</p>

        <div className="flex items-center gap-1 mb-3">
          <Star className="h-3 w-3 fill-primary text-primary" />
          <span className="text-xs font-medium">{product.rating}</span>
          <span className="text-xs text-muted-foreground">({product.reviews})</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-lg">${product.price}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">${product.originalPrice}</span>
            )}
          </div>
          <Button size="sm" onClick={() => addToCart(product)} className="h-8 text-xs">
            <ShoppingCart className="h-3 w-3 mr-1" /> Add
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
