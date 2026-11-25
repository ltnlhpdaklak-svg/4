import { create } from 'zustand'
import { supabase } from '../lib/supabase.js'

const sameEmail = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase()

const normalizeAddresses = (list = []) => {
  if (!list.length) return list
  const hasDefault = list.some((a) => a.is_default)
  return list.map((a, idx) => ({ ...a, is_default: hasDefault ? a.is_default : idx === 0 }))
}

const toUser = (profile) => ({
  ...profile,
  addresses: normalizeAddresses(profile.addresses ?? []),
})

export const useAuthStore = create((set, get) => ({
  user: null,
  users: [],
  loading: true,

  init: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      set({ user: null, loading: false })
      return
    }
    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle()
    set({ user: data ? toUser(data) : null, loading: false })
  },

  listen: () => {
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        set({ user: null })
        return
      }
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle()
      if (data) set({ user: toUser(data) })
    })
  },

  login: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) {
      if (error.message.includes('Email not confirmed')) {
        return { error: 'Email chưa được xác nhận. Vào email để bấm xác nhận, hoặc bật lại tính năng xác nhận email trong Supabase.' }
      }
      return { error: error.message || 'Email hoặc mật khẩu không đúng.' }
    }
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
    const found = data ? toUser(data) : null
    set({ user: found })
    return found ? { ok: true, user: found } : { error: 'Không tìm thấy hồ sơ tài khoản.' }
  },

  register: async ({ full_name, email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: full_name.trim() } },
    })
    if (error) return { error: error.message }
    if (!data.user) return { error: 'Không thể tạo tài khoản.' }
    const profile = {
      id: data.user.id,
      email: email.trim(),
      full_name: full_name.trim(),
      phone: '',
      role: 'customer',
      status: 'Hoạt động',
      addresses: [],
      created_at: data.user.created_at,
    }
    set({ user: toUser(profile) })
    return { ok: true, user: toUser(profile) }
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },

  loadUsers: async () => {
    const { data, error } = await supabase
      .from('profiles').select('*').order('created_at', { ascending: false })
    if (!error && data) set({ users: data.map(toUser) })
    return data ?? []
  },

  updateProfile: async (patch) => {
    const current = get().user
    if (!current) return
    const next = { ...current, ...patch }
    const { error } = await supabase.from('profiles').update(next).eq('id', current.id)
    if (error) return { error: error.message }
    set({ user: next })
  },

  saveAddress: async (addr) => {
    const current = get().user
    if (!current) return
    const payload = { ...addr, id: addr.id ?? `a-${Date.now()}` }
    let list = current.addresses ?? []
    list = addr.id ? list.map((a) => (a.id === addr.id ? payload : a)) : [...list, payload]
    if (payload.is_default) list = list.map((a) => ({ ...a, is_default: a.id === payload.id }))
    const addresses = normalizeAddresses(list)
    const { error } = await supabase.from('profiles').update({ addresses }).eq('id', current.id)
    if (error) return { error: error.message }
    set({ user: { ...current, addresses } })
  },

  deleteAddress: async (id) => {
    const current = get().user
    if (!current) return
    const addresses = normalizeAddresses((current.addresses ?? []).filter((a) => a.id !== id))
    const { error } = await supabase.from('profiles').update({ addresses }).eq('id', current.id)
    if (error) return { error: error.message }
    set({ user: { ...current, addresses } })
  },

  setDefaultAddress: async (id) => {
    const current = get().user
    if (!current) return
    const addresses = (current.addresses ?? []).map((a) => ({ ...a, is_default: a.id === id }))
    const { error } = await supabase.from('profiles').update({ addresses }).eq('id', current.id)
    if (error) return { error: error.message }
    set({ user: { ...current, addresses } })
  },

  // Chỉ admin: đổi vai trò / khóa tài khoản / xóa người dùng.
  setUserRole: async (id, role) => {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
    if (!error) set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, role } : u)) }))
    return { error: error?.message }
  },

  setUserStatus: async (id, status) => {
    const { error } = await supabase.from('profiles').update({ status }).eq('id', id)
    if (!error) set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, status } : u)) }))
    return { error: error?.message }
  },

  deleteUser: async (id) => {
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (!error) set((s) => ({ users: s.users.filter((u) => u.id !== id) }))
    return { error: error?.message }
  },

  sameEmail,
}))
