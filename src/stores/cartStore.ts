import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: number;
  quantity: number;
  price: string;   // wei as decimal string, e.g. "10000000000000000"
  name: string;
  image: string;
}

interface CartStore {
  // State
  items: CartItem[];
  isLoading: boolean;

  // Actions
  addItem: (
    productId: number,
    quantity: number,
    price: bigint,  // Caller passes bigint, we convert to string for storage
    name: string,
    image: string
  ) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  setLoading: (loading: boolean) => void;

  // Getters
  getTotalPrice: () => bigint;
  getTotalItems: () => number;
  getCartSize: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addItem: (productId, quantity, price, name, image) => {
        const { items } = get();
        const existingItem = items.find((item) => item.productId === productId);
        const priceStr = price.toString(); // Convert bigint to string for JSON serialization

        if (existingItem) {
          existingItem.quantity += quantity;
          set({ items: [...items] });
        } else {
          set({
            items: [
              ...items,
              { productId, quantity, price: priceStr, name, image },
            ],
          });
        }
      },

      removeItem: (productId) => {
        const { items } = get();
        set({ items: items.filter((item) => item.productId !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        const { items } = get();
        const item = items.find((item) => item.productId === productId);
        if (item) {
          item.quantity = quantity;
          set({ items: [...items] });
        }
      },

      clearCart: () => set({ items: [] }),

      setLoading: (loading) => set({ isLoading: loading }),

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + BigInt(item.price) * BigInt(item.quantity),
          BigInt(0)
        );
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      getCartSize: () => {
        const { items } = get();
        return items.length;
      },
    }),
    {
      name: "cart-store",
    }
  )
);
