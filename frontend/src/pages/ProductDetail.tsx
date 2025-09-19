import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/contexts/WishListContext'; // Fixed typo: WishListContext -> WishlistContext
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { type Product } from '@/types/product';
import { Star, ShoppingCart, ArrowLeft, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [addingToCart, setAddingToCart] = useState(false);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  // Check if product exists before accessing its properties
  const isWishlisted = product ? isInWishlist(product._id) : false;

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      const response = await productAPI.getById(productId);
      setProduct(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      await addToCart(product._id, quantity);
      // You can add a toast notification here
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistAction = async () => {
    if (!user || !product) return;

    try {
      if (isWishlisted) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
    } catch (error) {
      console.error('Failed to update wishlist:', error);
    }
  };

  const renderRating = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading product...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-500">{error || 'Product not found'}</div>
        <Button asChild className="mt-4">
          <Link to="/products">Back to Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" asChild className="mb-6">
        <Link to="/products">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Card className="overflow-hidden">
            <img src={product.image} alt={product.name} className="w-full h-96 object-cover" />
          </Card>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {renderRating(product.rating)}
                <span className="ml-2 text-sm text-gray-600">({product.rating})</span>
              </div>
              <span className="mx-4 text-gray-300">•</span>
              <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `In stock (${product.stock})` : 'Out of stock'}
              </span>
            </div>
            <p className="text-3xl font-bold text-green-600 mb-4">${product.price}</p>
            <p className="text-gray-700">{product.description}</p>
          </div>

          <div className="border-t pt-6">
            <p className="text-sm text-gray-600 mb-2">Category: {product.category}</p>
            <p className="text-sm text-gray-600">
              Added: {new Date(product.createdAt).toLocaleDateString()}
            </p>
          </div>

          {user && (
            <Card>
              <CardHeader>
                <CardTitle>Add to Cart</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label htmlFor="quantity" className="text-sm font-medium">
                    Quantity:
                  </label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20"
                    disabled={product.stock === 0}
                  />
                  <span className="text-sm text-gray-600">Max: {product.stock}</span>
                </div>

                <div className="flex space-x-4">
                  <Button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || addingToCart}
                    className="flex-1"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {addingToCart ? 'Adding...' : 'Add to Cart'}
                  </Button>

                  <Button
                    variant={isWishlisted ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={handleWishlistAction}
                  >
                    <Heart className={`mr-2 h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                    {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  </Button>
                </div>

                {product.stock === 0 && (
                  <p className="text-red-500 text-sm">This product is currently out of stock.</p>
                )}
              </CardContent>
            </Card>
          )}

          {!user && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-600 mb-4">Please login to add this product to your cart.</p>
                <Button asChild className="mr-4">
                  <Link to="/login">Login</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}