import { supabase } from '../lib/supabase.js'
import { useAuthStore } from './authStore.js'

const INITIAL = 1000000

export async function getWallet() {
  const user = useAuthStore.getState().user
  if (!user) return { balance: INITIAL, unlimited: false, user: null }

  const { data, error } = await supabase
    .from('baccarat_wallets').select('*').eq('user_id', user.id).maybeSingle()

  const unlimited = user.role === 'admin'
  if (error || !data) {
    if (!unlimited) {
      await supabase.from('baccarat_wallets').insert({ user_id: user.id, balance: INITIAL })
    }
    return { balance: unlimited ? -1 : INITIAL, unlimited, user }
  }
  return { balance: unlimited ? -1 : data.balance, unlimited, user }
}

export async function updateWallet(balance) {
  const user = useAuthStore.getState().user
  if (!user || user.role === 'admin' || balance < 0) return
  await supabase.from('baccarat_wallets').update({ balance, updated_at: new Date().toISOString() }).eq('user_id', user.id)
}
