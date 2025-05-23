import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set) => ({
      cart: [],
      addToCart: (product, size, price, image_url) =>
        set((state) => {
          const existingItem = state.cart.find(
            (item) =>
              item.product.id === product.id && item.size === size && item.image_url === image_url,
          )
          if (existingItem) {
            return {
              cart: state.cart.map((item) =>
                item.product.id === product.id && item.size === size
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
            }
          }
          return {
            cart: [...state.cart, { product, size, price, quantity: 1, image_url }],
          }
        }),
      removeFromCart: (productId, size) =>
        set((state) => ({
          cart: state.cart.filter((item) => !(item.product.id === productId && item.size === size)),
        })),
      updateQuantity: (productId, size, newQuantity) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.product.id === productId && item.size === size
              ? { ...item, quantity: newQuantity }
              : item,
          ),
        })),
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: 'cart-storage', // name of the item in localStorage
      skipHydration: false, // enable automatic hydration
    },
  ),
)

export default useCartStore
