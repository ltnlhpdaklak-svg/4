import { create } from 'zustand'
import { supabase } from '../lib/supabase.js'

const DEFAULT_SETTINGS = {
  id: 1,
  group_name: '4EYEWEAR',
  intro: 'Liên hệ với chúng tôi để được hỗ trợ đặt hàng và giải đáp thắc mắc.',
  zalo_link: '',
  facebook_link: '',
  email: '',
  phone: '',
}

export const useContactStore = create((set, get) => ({
  settings: DEFAULT_SETTINGS,
  messages: [],
  loading: true,

  loadSettings: async () => {
    const { data, error } = await supabase.from('contact_settings').select('*').eq('id', 1).maybeSingle()
    if (!error && data) set({ settings: data, loading: false })
    else set({ loading: false })
    return data ?? DEFAULT_SETTINGS
  },

  saveSettings: async (patch) => {
    const next = { ...get().settings, ...patch, updated_at: new Date().toISOString() }
    const { error } = await supabase.from('contact_settings').upsert({ ...next, id: 1 })
    if (!error) set({ settings: next })
    return { error: error?.message }
  },

  loadMessages: async () => {
    const { data, error } = await supabase
      .from('contact_messages').select('*').order('created_at', { ascending: false })
    if (!error && data) set({ messages: data })
    return data ?? []
  },

  sendMessage: async (payload) => {
    const { error } = await supabase.from('contact_messages').insert(payload)
    if (error) return { error: error.message }
    await get().loadMessages()
    return { ok: true }
  },

  replyMessage: async (id, reply) => {
    const patch = { reply, replied_at: new Date().toISOString() }
    const { error } = await supabase.from('contact_messages').update(patch).eq('id', id)
    if (!error) {
      set((s) => ({ messages: s.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)) }))
    }
    return { error: error?.message }
  },

  togglePublic: async (id, isPublic) => {
    const { error } = await supabase.from('contact_messages').update({ is_public: isPublic }).eq('id', id)
    if (!error) {
      set((s) => ({ messages: s.messages.map((m) => (m.id === id ? { ...m, is_public: isPublic } : m)) }))
    }
    return { error: error?.message }
  },

  deleteMessage: async (id) => {
    const { error } = await supabase.from('contact_messages').delete().eq('id', id)
    if (!error) set((s) => ({ messages: s.messages.filter((m) => m.id !== id) }))
    return !error
  },
}))
