import { useWishlist } from '@/contexts/WishListContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';

export function Wishlist() {
  const { wishlist, loading, error, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState<Record<string, boolean>>({});
  const [removing, setRemoving] = useState<Record<string, boolean>>({});

  const handleAddToCart = async (productId: string) => {
    setAddingToCart(prev => ({ ...prev, [productId]: true }));
    try {
      await addToCart(productId, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    setRemoving(prev => ({ ...prev, [productId]: true }));
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    } finally {
      setRemoving(prev => ({ ...prev, [productId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading wishlist...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  if (!wishlist || wishlist.items.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <Heart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">Start adding products to your wishlist</p>
          <Button asChild>
            <Link to="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Wishlist</h1>
          <p className="text-white">{wishlist.items.length} items</p>
        </div>
        <Button variant="outline" onClick={clearWishlist} className="!rounded-xl !text-white hover:!text-gray-100">
          Clear Wishlist
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.items.map((item) => (
          <Card key={item._id} className="h-full flex flex-col">
            <CardHeader className="p-4 pb-2">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <CardTitle className="text-lg">
                <Link 
                  to={`/products/${item.product._id}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {item.product.name}
                </Link>
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {item.product.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-4 pt-0 flex-grow">
              <div className="flex justify-between items-center mb-2">
                <span className="text-2xl font-bold text-green-600">${item.product.price}</span>
                <span className={`text-sm ${item.product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                  {item.product.stock > 0 ? "In stock" : "Out of stock"}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Added on {new Date(item.addedAt).toLocaleDateString()}
              </p>
            </CardContent>
            
            <CardFooter className="p-4 pt-0 space-x-2">
              <Button
                className="flex-1"
                onClick={() => handleAddToCart(item.product._id)}
                disabled={item.product.stock === 0 || addingToCart[item.product._id]}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {addingToCart[item.product._id] ? "Adding..." : "Add to Cart"}
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleRemoveFromWishlist(item.product._id)}
                disabled={removing[item.product._id]}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Button asChild variant="outline">
          <Link to="/products">
            Continue Shopping <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}