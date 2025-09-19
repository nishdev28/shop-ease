import express from 'express';
import Wishlist from '../models/Wishlist';
import Product from '../models/Product';
import authenticate from '../middleware/auth';

const router = express.Router();

// Get user's wishlist
router.get('/', authenticate, async (req: any, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.userId })
      .populate('items.product', 'name price image category stock rating');
    
    if (!wishlist) {
      return res.json({ items: [] });
    }
    
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to wishlist
router.post('/items', authenticate, async (req: any, res) => {
  try {
    const { productId } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    let wishlist = await Wishlist.findOne({ user: req.userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.userId, items: [] });
    }
    
    // Check if product already in wishlist
    const existingItem = wishlist.items.find(
      item => item.product.toString() === productId
    );
    
    if (existingItem) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }
    
    // Add new item
    wishlist.items.push({ product: productId });
    
    await wishlist.save();
    await wishlist.populate('items.product', 'name price image category stock rating');
    
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from wishlist
router.delete('/items/:productId', authenticate, async (req: any, res) => {
  try {
    const { productId } = req.params;
    
    const wishlist = await Wishlist.findOne({ user: req.userId });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    wishlist.items = wishlist.items.filter(
      item => item.product.toString() !== productId
    );
    
    await wishlist.save();
    await wishlist.populate('items.product', 'name price image category stock rating');
    
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear wishlist
router.delete('/', authenticate, async (req: any, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.userId });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    wishlist.items = [];
    await wishlist.save();
    
    res.json({ message: 'Wishlist cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if product is in wishlist
router.get('/check/:productId', authenticate, async (req: any, res) => {
  try {
    const { productId } = req.params;
    
    const wishlist = await Wishlist.findOne({ 
      user: req.userId,
      'items.product': productId
    });
    
    res.json({ isInWishlist: !!wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;