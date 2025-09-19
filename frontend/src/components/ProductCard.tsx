import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { Star, ShoppingCart, Heart, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, loading: wishlistLoading } = useWishlist();
  const { user } = useAuth();
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlistAction, setWishlistAction] = useState<string | null>(null);

  const isWishlisted = isInWishlist(product._id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setAddingToCart(true);
    try {
      await addToCart(product._id, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistAction = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user || wishlistLoading) return;

    setWishlistAction(product._id);
    try {
      if (isWishlisted) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
    } catch (error) {
      console.error('Failed to update wishlist:', error);
    } finally {
      setWishlistAction(null);
    }
  };

  const renderRating = () => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer group">
      <Link to={`/products/${product._id}`} className="flex flex-col h-full">
        <CardHeader className="p-4 pb-2 flex-grow-0 relative">
          {/* Wishlist Button */}
          {user && (
            <Button
              variant="ghost"
              size="icon"
              className={`absolute top-3 right-3 z-10 rounded-full ${
                isWishlisted 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              } transition-all opacity-0 group-hover:opacity-100`}
              onClick={handleWishlistAction}
              disabled={wishlistLoading || !!wishlistAction}
            >
              {wishlistAction === product._id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
              )}
            </Button>
          )}
          
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover rounded-md mb-4"
          />
          <CardTitle className="text-lg hover:text-blue-600 transition-colors">
            {product.name}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {product.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex-grow">
          <div className="flex items-center mb-2">
            {renderRating()}
            <span className="ml-2 text-sm text-gray-600">({product.rating})</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-green-600">${product.price}</span>
            <span className={`text-sm ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
              {product.stock > 0 ? `In stock (${product.stock})` : "Out of stock"}
            </span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button 
            className="w-full" 
            onClick={handleAddToCart}
            disabled={product.stock === 0 || addingToCart}
          >
            {addingToCart ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
              </>
            )}
          </Button>
        </CardFooter>
      </Link>
    </Card>
  );
}