import { create } from 'zustand'
import { supabase } from '../lib/supabase.js'
import { useCatalogStore } from './catalogStore.js'

export const useOrderStore = create((set, get) => ({
  orders: [],
  loading: true,

  load: async (userId, isAdmin) => {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (!isAdmin) query = userId ? query.eq('user_id', userId) : query.eq('user_id', '00000000-0000-0000-0000-000000000000')
    const { data, error } = await query
    set({ orders: error ? [] : data ?? [], loading: false })
    return data ?? []
  },

  loadAll: async () => {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (!error && data) set({ orders: data })
    return data ?? []
  },

  addOrder: async (order) => {
    const { error } = await supabase.from('orders').insert(order)
    if (error) return { error: error.message }
    set((s) => ({ orders: [order, ...s.orders] }))
    return { ok: true }
  },

  updateStatus: async (id, status) => {
    const current = get().orders.find((o) => o.id === id)
    if (!current || current.status === status || current.status === 'Đã hủy') return

    if (status === 'Đã hủy' && current.stock_reserved) {
      await useCatalogStore.getState().restoreStock(current.items)
    }
    const patch = {
      status,
      payment_status: status === 'Đã giao hàng' ? 'Đã thanh toán' : current.payment_status,
      updated_at: new Date().toISOString(),
    }
    const { error } = await supabase.from('orders').update(patch).eq('id', id)
    if (!error) {
      set((s) => ({
        orders: s.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)),
      }))
    }
    return { error: error?.message }
  },

  deleteOrder: async (id) => {
    const { error } = await supabase.from('orders').delete().eq('id', id)
    if (!error) set((s) => ({ orders: s.orders.filter((o) => o.id !== id) }))
    return !error
  },
}))
