import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { wishlistAPI } from '@/lib/api';
import { useAuth } from './AuthContext';
import { type Wishlist } from '@/types/wishlist';

interface WishlistContextType {
  wishlist: Wishlist | null;
  loading: boolean;
  error: string | null;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchWishlist = async () => {
    if (!user) {
      setWishlist(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await wishlistAPI.get();
      // Handle case where wishlist doesn't exist yet
      if (response.data && response.data.items) {
        setWishlist(response.data);
      } else {
        // Create empty wishlist structure
        setWishlist({ 
          _id: '', 
          user: user.id, 
          items: [], 
          createdAt: new Date().toISOString(), 
          updatedAt: new Date().toISOString() 
        });
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Wishlist doesn't exist yet - create empty structure
        setWishlist({ 
          _id: '', 
          user: user.id, 
          items: [], 
          createdAt: new Date().toISOString(), 
          updatedAt: new Date().toISOString() 
        });
      } else {
        setError(err.response?.data?.message || 'Failed to fetch wishlist');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlist(null);
    }
  }, [user]);

  const addToWishlist = async (productId: string) => {
    try {
      const response = await wishlistAPI.addItem(productId);
      setWishlist(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add item to wishlist');
      throw err;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const response = await wishlistAPI.removeItem(productId);
      setWishlist(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove item from wishlist');
      throw err;
    }
  };

  const clearWishlist = async () => {
    try {
      await wishlistAPI.clear();
      setWishlist(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to clear wishlist');
      throw err;
    }
  };

  const isInWishlist = (productId: string): boolean => {
    // Add null checks to prevent the error
    if (!wishlist || !wishlist.items) return false;
    return wishlist.items.some(item => item.product && item.product._id === productId);
  };

  const refreshWishlist = async () => {
    await fetchWishlist();
  };

  const value = {
    wishlist,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    refreshWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};