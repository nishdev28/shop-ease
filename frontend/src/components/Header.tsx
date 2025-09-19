import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link, NavLink } from 'react-router-dom';
import { ShoppingCart, User, Heart, Menu, Package } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import { useWishlist } from '@/contexts/WishListContext';

export function Header() {
  const { user, logout, isLoading } = useAuth();
  const { cart } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { wishlist } = useWishlist();
  const wishlistCount = wishlist ? wishlist.items.length : 0;

  // Calculate cart items count
  const cartCount = cart ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0;

  // Navigation items - don't include Orders in the main nav since we'll show it as an icon
  const navItems = ['Home', 'Products', 'About', 'Contact'];

  return (
    <header className="fixed top-0 w-full bg-gray-800 text-white backdrop-blur-md shadow-sm z-50 h-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-700 rounded-md flex items-center justify-center">
            <ShoppingCart className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-lg font-bold text-white">ShopEase</h1>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <NavLink
              key={item}
              to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
              end
              className={({ isActive }) =>
                [
                  'font-medium transition-colors px-4 py-2 rounded-lg',
                  isActive
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700',
                ].join(' ')
              }
            >
              {item}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {/* Orders Icon - only show when user is logged in */}
          {user && (
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `relative p-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`
              }
            >
              <Package className="h-6 w-6" />
            </NavLink>
          )}

          {/* Wishlist Icon */}
          <NavLink
            to="/wishlist"
            className="relative text-gray-300 hover:text-white transition-colors"
          >
            <Heart className="h-6 w-6" />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </NavLink>

          {/* Cart Icon */}
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `relative p-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`
            }
          >
            <ShoppingCart className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </NavLink>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-300 hover:text-white hover:bg-gray-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          {/* User Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:flex items-center text-sm text-gray-300">
                  <User className="h-4 w-4 mr-1" /> {user.name}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={logout}
                  className="rounded-lg bg-gray-700 text-white hover:bg-gray-600 hover:text-white border-gray-600"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg bg-gray-700 text-white hover:bg-gray-600 hover:text-white border-gray-600"
                  asChild
                >
                  <Link to="/login">Login</Link>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                  asChild
                >
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <div className="px-4 py-3 space-y-2">
            {/* Main navigation items */}
            {navItems.map((item) => (
              <NavLink
                key={item}
                to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                end
                className={({ isActive }) =>
                  [
                    'block font-medium transition-colors px-4 py-2 rounded-lg',
                    isActive
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700',
                  ].join(' ')
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item}
              </NavLink>
            ))}

            {/* Orders link in mobile menu (only for logged in users) */}
            {user && (
              <NavLink
                to="/orders"
                className={({ isActive }) =>
                  [
                    'block font-medium transition-colors px-4 py-2 rounded-lg',
                    isActive
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700',
                  ].join(' ')
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Orders
              </NavLink>
            )}

            {/* Mobile Auth Buttons */}
            {!isLoading && !user && (
              <div className="pt-4 border-t border-gray-700 space-y-2">
                <Button
                  variant="outline"
                  className="w-full bg-gray-700 text-white hover:bg-gray-600 border-gray-600"
                  asChild
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Link to="/login">Login</Link>
                </Button>
                <Button
                  variant="default"
                  className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
                  asChild
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
