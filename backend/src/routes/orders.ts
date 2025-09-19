import express from 'express';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import authenticate from '../middleware/auth';

const router = express.Router();

// Get user's orders
router.get('/', authenticate, async (req: any, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single order
router.get('/:id', authenticate, async (req: any, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.userId 
    }).populate('items.product', 'name image');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new order
router.post('/', authenticate, async (req: any, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    
    // Get user's cart
    const cart = await Cart.findOne({ user: req.userId })
      .populate('items.product', 'name stock');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // Check stock availability
    for (const item of cart.items) {
      const product: any = item.product;
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}` 
        });
      }
    }
    
    // Create order items
    const orderItems = cart.items.map(item => ({
      product: (item.product as any)._id,
      quantity: item.quantity,
      price: item.price,
      name: (item.product as any).name
    }));
    
    // Create order
    const order = new Order({
      user: req.userId,
      items: orderItems,
      total: cart.total,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'pending' // Will be updated after payment processing
    });
    
    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        (item.product as any)._id,
        { $inc: { stock: -item.quantity } }
      );
    }
    
    // Clear cart
    cart.items = [];
    await cart.save();
    
    await order.save();
    await order.populate('items.product', 'name image');
    
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// In your backend routes/orders.ts - update the status route
router.put('/:id/status', authenticate, async (req: any, res) => {
    try {
      const { status } = req.body;  
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      
      order.status = status;
      await order.save();
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
export default router;