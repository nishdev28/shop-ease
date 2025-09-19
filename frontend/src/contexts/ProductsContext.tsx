import { productAPI } from '@/lib/api';
import type { Product, ProductFilters } from '@/types/product';
import { createContext, useContext, useEffect, useState, type FC, type ReactNode } from 'react';

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
  setFilters: (filters: ProductFilters) => void;
  fetchProducts: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};
interface ProductsProviderProps {
  children: ReactNode;
}

export const ProductsProvider: FC<ProductsProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilters>({});

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productAPI.getAll(filters);
      setProducts(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, [filters]);
  const value = {
    products,
    loading,
    error,
    filters,
    setFilters,
    fetchProducts,
  };
  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
};
