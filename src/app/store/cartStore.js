import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set) => ({
      // Initial state
      cart: [],

      // Action to add an item to the cart
      addToCart: (product, size, price, image_url) =>
        set((state) => {
          // Check if the item already exists in the cart (same product ID and size)
          const existingItem = state.cart.find(
            (item) => item.product.id === product.id && item.size === size
          );

          if (existingItem) {
            // If item exists, update its quantity
            return {
              cart: state.cart.map((item) =>
                item.product.id === product.id && item.size === size
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
            };
          }
          // If item does not exist, add it to the cart
          return {
            cart: [...state.cart, { product, size, price, quantity: 1, image_url }],
          };
        }),

      // Action to remove an item from the cart
      removeFromCart: (productId, size) =>
        set((state) => ({
          cart: state.cart.filter((item) => !(item.product.id === productId && item.size === size)),
        })),

      // Action to update the quantity of an item in the cart
      updateQuantity: (productId, size, newQuantity) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.product.id === productId && item.size === size
              ? { ...item, quantity: newQuantity }
              : item,
          ),
        })),

      // Action to clear the entire cart
      clearCart: () => set({ cart: [] }),

      // New action: Set the entire cart array. Useful for syncing with remote data.
      setCart: (newCart) => set({ cart: newCart }),
    }),
    {
      name: 'cart-storage', // Name of the item in localStorage
      // getStorage: () => localStorage, // Default is localStorage, explicitly stating for clarity
      skipHydration: false, // Enable automatic hydration from localStorage
    },
  ),
);

export default useCartStore;
