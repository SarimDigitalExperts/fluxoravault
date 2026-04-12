import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import ProductCard from "@/components/ProductCard";

export default function Wishlist() {
  const { items } = useWishlist();
  const { addToCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="container pt-24 pb-16 text-center">
        <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-display font-bold mb-2">Your wishlist is empty</h1>
        <p className="text-muted-foreground mb-6">Save your favorite products for later</p>
        <Button asChild variant="glow">
          <Link to="/shop">Browse Shop</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container pt-24 pb-16">
      <h1 className="text-3xl font-display font-bold mb-2">Wishlist</h1>
      <p className="text-muted-foreground mb-8">{items.length} saved item{items.length > 1 ? "s" : ""}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
