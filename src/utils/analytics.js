import { useAuthStore } from '../store/authStore.js'
import { useEventStore } from '../store/eventStore.js'

// Ghi sự kiện theo phiên (session) vào bảng events trên Supabase.
const SESSION_KEY = 'eyewear-session-id'

export function getSessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY)
    if (!id) {
      id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `s-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
      sessionStorage.setItem(SESSION_KEY, id)
    }
    return id
  } catch {
    return 'session-unavailable'
  }
}

export function trackEvent(eventName, metadata = {}) {
  const { product_id = null, ...rest } = metadata
  const user = useAuthStore.getState().user
  useEventStore.getState().track({
    id: `e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    event_name: eventName,
    session_id: getSessionId(),
    user_id: user?.id ?? null,
    product_id,
    metadata: rest,
    created_at: new Date().toISOString(),
  })
}
