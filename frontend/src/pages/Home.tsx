import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Truck, Shield, Star } from 'lucide-react';

export function Home() {
  const { user } = useAuth();

  const features = [
    {
      icon: <ShoppingBag className="h-8 w-8 text-neutral-600" />,
      title: 'Wide Selection',
      description: 'Thousands of products across various categories',
    },
    {
      icon: <Truck className="h-8 w-8 text-neutral-600" />,
      title: 'Fast Delivery',
      description: 'Free shipping on orders over $50',
    },
    {
      icon: <Shield className="h-8 w-8 text-neutral-600" />,
      title: 'Secure Payment',
      description: '100% secure payment processing',
    },
    {
      icon: <Star className="h-8 w-8 text-neutral-600" />,
      title: 'Quality Guarantee',
      description: '30-day money-back guarantee',
    },
  ];

  return (
    <div className="w-full">
      <section className="bg-gradient-to-r from-gray-950 to-gray-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Welcome to ShopEase</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Discover amazing products at unbeatable prices. Your one-stop shop for all your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-black text-white !text-white hover:bg-gray-800" asChild>
              <Link to="/products">
                Shop Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            {!user && (
              <Button
                size="lg"
                variant="outline"
                className="bg-white text-black border-black hover:bg-black hover:text-white"
                asChild
              >
                <Link to="/signup">Create Account</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose ShopEase?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're committed to providing the best shopping experience for our customers.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="text-center p-6 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Shopping?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Browse our extensive collection of products and find exactly what you're looking for.
          </p>
          <Button size="lg" className="bg-black text-white hover:bg-gray-800" asChild>
            <Link to="/products">
              Explore Products <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* User Welcome Section */}
      {user && (
        <section className="py-12 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-2xl font-semibold text-neutral-800 mb-2">
                Welcome back, {user.name}! 👋
              </h3>
              <p className="text-neutral-700 mb-4">
                We're glad to see you again. Ready to continue shopping?
              </p>
              <p className="text-neutral-600 mb-6">Email: {user.email}</p>
              <Button className="bg-black hover:bg-neutral-700" asChild>
                <Link to="/products" className="text-white !text-white flex items-center">
                  Continue Shopping <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
