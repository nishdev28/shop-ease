import {type Product } from './product';

export interface WishlistItem {
  product: Product;
  addedAt: string;
  _id?: string;
}

export interface Wishlist {
  _id: string;
  user: string;
  items: WishlistItem[];
  createdAt: string;
  updatedAt: string;
}