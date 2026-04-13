import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useWishlist } from "@/hooks/useWishlist";
import ProductCard from "@/components/ProductCard";

export default function AccountWishlist() {
  const { items } = useWishlist();

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">My Wishlist</h1>

      {items.length === 0 ? (
        <div className="glass-strong rounded-2xl p-12 text-center">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium mb-1">No saved items</p>
          <p className="text-sm text-muted-foreground mb-4">Browse the shop and save products you love</p>
          <Button asChild variant="glow">
            <Link to="/shop">Browse Shop</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
