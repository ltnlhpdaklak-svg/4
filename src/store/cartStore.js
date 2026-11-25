import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const MAX_QTY = 99

export const selectCartCount = (state) => state.items.reduce((n, i) => n + i.quantity, 0)

// Giỏ hàng lưu trong localStorage để không mất khi tải lại trang.
export const useCartStore = create()(
  persist(
    (set) => ({
      items: [],

      addItem: (productId, quantity = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.productId === productId)
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.productId === productId ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + quantity) } : i
              ),
            }
          }
          return { items: [...s.items, { productId, quantity: Math.min(MAX_QTY, quantity) }] }
        }),

      setQuantity: (productId, quantity) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(MAX_QTY, quantity)) } : i
          ),
        })),

      removeItem: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),

      clear: () => set({ items: [] }),
    }),
    {
      name: 'eyewear-cart',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    }
  )
)
