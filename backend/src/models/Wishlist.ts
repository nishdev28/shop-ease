import mongoose, { Document, Schema } from 'mongoose';

export interface IWishlistItem {
  product: mongoose.Types.ObjectId;
  addedAt?: Date;
}

export interface IWishlist extends Document {
  user: mongoose.Types.ObjectId;
  items: IWishlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

const wishlistItemSchema = new Schema({
  product: { 
    type: Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  addedAt: { 
    type: Date, 
    default: Date.now 
  }
});

const wishlistSchema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
  },
  items: [wishlistItemSchema]
}, {
  timestamps: true
});

wishlistSchema.index({ user: 1, 'items.product': 1 }, { unique: true });

export default mongoose.model<IWishlist>('Wishlist', wishlistSchema);