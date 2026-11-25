import { create } from 'zustand'
import { supabase } from '../lib/supabase.js'

export const useEventStore = create((set) => ({
  events: [],

  load: async () => {
    const { data, error } = await supabase
      .from('events').select('*').order('created_at', { ascending: false }).limit(2000)
    if (!error && data) set({ events: data.reverse() })
    return data ?? []
  },

  track: async (event) => {
    set((s) => ({ events: [...s.events, event].slice(-2000) }))
    await supabase.from('events').insert({
      event_name: event.event_name,
      session_id: event.session_id ?? '',
      user_id: user_id ?? null,
      product_id: product_id ?? null,
      metadata: event.metadata ?? {},
      created_at: event.created_at ?? new Date().toISOString(),
    })
  },
}))
