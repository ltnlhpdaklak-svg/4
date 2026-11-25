import { create } from 'zustand'
import { supabase } from '../lib/supabase.js'
import { slugify } from '../utils/format.js'

const touch = () => new Date().toISOString()

export const useCatalogStore = create((set, get) => ({
  categories: [],
  products: [],
  loading: true,

  load: async () => {
    const [catRes, prodRes] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('products').select('*').order('created_at', { ascending: false }),
    ])
    set({
      categories: catRes.data ?? [],
      products: prodRes.data ?? [],
      loading: false,
    })
  },

  addProduct: async (data) => {
    const now = touch()
    const product = {
      ...data,
      id: `p-${Date.now()}`,
      slug: data.slug || slugify(data.name) || `san-pham-${Date.now()}`,
      is_active: data.is_active ?? true,
      sold_count: 0,
      view_count: 0,
      created_at: now,
      updated_at: now,
    }
    const { error } = await supabase.from('products').insert(product)
    if (error) return null
    set((s) => ({ products: [product, ...s.products] }))
    return product
  },

  updateProduct: async (id, patch) => {
    const changes = {
      ...patch,
      ...(patch.name ? { slug: slugify(patch.name) } : {}),
      updated_at: touch(),
    }
    const { error } = await supabase.from('products').update(changes).eq('id', id)
    if (!error) {
      set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, ...changes } : p)) }))
    }
    return { error: error?.message }
  },

  deleteProduct: async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (!error) set((s) => ({ products: s.products.filter((p) => p.id !== id) }))
    return !error
  },

  incrementView: async (id) => {
    const p = get().products.find((x) => x.id === id)
    if (!p) return
    const view_count = (p.view_count ?? 0) + 1
    await supabase.from('products').update({ view_count }).eq('id', id)
    set((s) => ({ products: s.products.map((x) => (x.id === id ? { ...x, view_count } : x)) }))
  },

  recordSale: async (lines) => {
    const qtyById = Object.fromEntries(lines.map((l) => [l.product_id, l.quantity]))
    const updates = get().products.filter((p) => qtyById[p.id]).map((p) => {
      const qty = qtyById[p.id]
      return {
        id: p.id,
        stock: Math.max(0, p.stock - qty),
        sold_count: (p.sold_count ?? 0) + qty,
      }
    })
    for (const { id, ...changes } of updates) {
      await supabase.from('products').update(changes).eq('id', id)
    }
    set((s) => ({
      products: s.products.map((p) => {
        const u = updates.find((x) => x.id === p.id)
        return u ? { ...p, ...u, id: p.id } : p
      }),
    }))
  },

  restoreStock: async (lines) => {
    const qtyById = Object.fromEntries(lines.map((l) => [l.product_id, l.quantity]))
    const updates = get().products.filter((p) => qtyById[p.id]).map((p) => {
      const qty = qtyById[p.id]
      return {
        id: p.id,
        stock: p.stock + qty,
        sold_count: Math.max(0, (p.sold_count ?? 0) - qty),
      }
    })
    for (const { id, ...changes } of updates) {
      await supabase.from('products').update(changes).eq('id', id)
    }
    set((s) => ({
      products: s.products.map((p) => {
        const u = updates.find((x) => x.id === p.id)
        return u ? { ...p, ...u, id: p.id } : p
      }),
    }))
  },

  addCategory: async (data) => {
    const category = {
      ...data,
      id: `cat-${Date.now()}`,
      slug: data.slug || slugify(data.name),
      created_at: touch(),
    }
    const { error } = await supabase.from('categories').insert(category)
    if (error) return null
    set((s) => ({ categories: [...s.categories, category] }))
    return category
  },

  updateCategory: async (id, patch) => {
    const changes = { ...patch, ...(patch.name ? { slug: slugify(patch.name) } : {}) }
    const { error } = await supabase.from('categories').update(changes).eq('id', id)
    if (!error) {
      set((s) => ({ categories: s.categories.map((c) => (c.id === id ? { ...c, ...changes } : c)) }))
    }
    return { error: error?.message }
  },

  deleteCategory: async (id) => {
    if (get().products.some((p) => p.category_id === id)) return false
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (!error) set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }))
    return !error
  },
}))
