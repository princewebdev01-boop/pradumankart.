import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types';

interface WishlistState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const { items } = get();
        if (!items.find((item) => item.id === product.id)) {
          set({ items: [...items, product] });
        }
      },
      removeItem: (productId) => {
        const { items } = get();
        set({ items: items.filter((item) => item.id !== productId) });
      },
      isInWishlist: (productId) => {
        const { items } = get();
        return items.some((item) => item.id === productId);
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'wishlist-storage',
    }
  )
);
