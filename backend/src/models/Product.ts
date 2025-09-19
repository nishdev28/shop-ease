import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  category: { 
    type: String, 
    required: true 
  },
  image: { 
    type: String, 
    default: 'https://via.placeholder.com/300' 
  },
  stock: { 
    type: Number, 
    required: true,
    min: 0 
  },
  rating: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 5 
  }
}, {
  timestamps: true
});

export default mongoose.model<IProduct>('Product', productSchema);