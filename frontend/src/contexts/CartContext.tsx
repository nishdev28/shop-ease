import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { cartAPI } from '@/lib/api';
import { useAuth } from './AuthContext';

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
  };
  quantity: number;
  price: number;
}

interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchCart = async () => {
    if (!user) {
      setCart(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await cartAPI.get();
      setCart(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setCart(null);
      } else {
        setError(err.response?.data?.message || 'Failed to fetch cart');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [user]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      const response = await cartAPI.addItem(productId, quantity);
      setCart(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add item to cart');
      throw err;
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      const response = await cartAPI.updateItem(productId, quantity);
      setCart(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update cart');
      throw err;
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const response = await cartAPI.removeItem(productId);
      setCart(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove item from cart');
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clear();
      setCart(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to clear cart');
      throw err;
    }
  };

  const refreshCart = async () => {
    await fetchCart();
  };

  const value = {
    cart,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
