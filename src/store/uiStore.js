import { create } from 'zustand'

// Thông báo nhanh (toast). Không lưu vào localStorage.
let nextId = 1

export const useUIStore = create((set, get) => ({
  toasts: [],

  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  push: ({ type = 'success', title, description, action }) => {
    const id = nextId++
    set((s) => ({ toasts: [...s.toasts, { id, type, title, description, action }] }))
    setTimeout(() => get().dismiss(id), 3500)
    return id
  },
}))

// Gọi nhanh từ bất kỳ đâu: notify({ title: '...', description: '...' })
export const notify = (payload) => useUIStore.getState().push(payload)
