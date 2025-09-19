import { useState, useEffect } from "react";
import { orderAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react";

interface Order {
  _id: string;
  items: Array<{
    product: string;
    quantity: number;
    price: number;
    name: string;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

// Define the order status flow
const statusFlow: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered'];

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getAll();
      setOrders(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    setUpdatingOrderId(orderId);
    try {
      const response = await orderAPI.updateStatus(orderId, newStatus);
      
      // Update the local state with the new order status
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? response.data : order
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5" />;
      case 'processing': return <Package className="h-5 w-5" />;
      case 'shipped': return <Truck className="h-5 w-5" />;
      case 'delivered': return <CheckCircle className="h-5 w-5" />;
      case 'cancelled': return <XCircle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatus = (currentStatus: Order['status']): Order['status'] | null => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    return currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-500">{error}</div>
        <Button onClick={fetchOrders} className="mt-4 mx-auto block">
          Try Again
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">No orders yet</h2>
          <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
          <Button asChild>
            <a href="/products">Start Shopping</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Your Orders</h1>
        <Button variant="outline" onClick={fetchOrders}>
          Refresh Orders
        </Button>
      </div>
      
      <div className="space-y-6">
        {orders.map((order) => {
          const nextStatus = getNextStatus(order.status);
          const isUpdating = updatingOrderId === order._id;

          return (
            <Card key={order._id} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Order #{order._id.slice(-8).toUpperCase()}</CardTitle>
                    <CardDescription>
                      Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-sm text-gray-600">Price: ${item.price}</p>
                        </div>
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 flex justify-between items-center">
                    <div className="space-y-2">
                      <p className="font-bold text-lg">Total: ${order.total.toFixed(2)}</p>
                      
                      {/* Status progression buttons - typically for admin use */}
                      {nextStatus && (
                        <Button
                          onClick={() => updateOrderStatus(order._id, nextStatus)}
                          disabled={isUpdating}
                          size="sm"
                        >
                          {isUpdating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            `Mark as ${nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}`
                          )}
                        </Button>
                      )}
                    </div>
                    
                    {/* Status progression visual */}
                    <div className="hidden md:flex items-center space-x-2">
                      {statusFlow.map((status, index) => (
                        <div key={status} className="flex items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              statusFlow.indexOf(order.status) >= index
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-400'
                            }`}
                          >
                            {index + 1}
                          </div>
                          {index < statusFlow.length - 1 && (
                            <div
                              className={`w-12 h-1 ${
                                statusFlow.indexOf(order.status) > index
                                  ? 'bg-blue-600'
                                  : 'bg-gray-200'
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Order Status Legend */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Order Status Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="h-6 w-6" />
              </div>
              <p className="font-medium">Pending</p>
              <p className="text-sm text-gray-600">Order received</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mx-auto mb-2">
                <Package className="h-6 w-6" />
              </div>
              <p className="font-medium">Processing</p>
              <p className="text-sm text-gray-600">Preparing order</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-800 rounded-full flex items-center justify-center mx-auto mb-2">
                <Truck className="h-6 w-6" />
              </div>
              <p className="font-medium">Shipped</p>
              <p className="text-sm text-gray-600">On the way</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 text-green-800 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-6 w-6" />
              </div>
              <p className="font-medium">Delivered</p>
              <p className="text-sm text-gray-600">Order complete</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 text-red-800 rounded-full flex items-center justify-center mx-auto mb-2">
                <XCircle className="h-6 w-6" />
              </div>
              <p className="font-medium">Cancelled</p>
              <p className="text-sm text-gray-600">Order cancelled</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}