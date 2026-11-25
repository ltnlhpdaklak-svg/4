import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RotateCcw, ShoppingBag, Sparkles } from 'lucide-react'
import Button from '../components/common/Button.jsx'

const MASKS = [
  { id: 'idol', name: 'Idol Live', face: '🎤', price: 100, tag: 'Hát live' },
  { id: 'hacker', name: 'Hacker', face: '🕶️', price: 250, tag: 'Ẩn danh' },
  { id: 'killer', name: 'Killer', face: '😈', price: 500, tag: 'Đáng sợ' },
  { id: 'ghost', name: 'Ghost', face: '👻', price: 800, tag: 'Vô hình' },
]

const STORAGE = '4eyewear-mask-shop'

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { coins: 300, owned: [], equipped: null }
}

export default function FunShop() {
  const [state, setState] = useState(loadState)
  const [message, setMessage] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify(state))
  }, [state])

  const buy = (mask) => {
    if (state.owned.includes(mask.id)) {
      setState((s) => ({ ...s, equipped: mask.id }))
      setMessage(`Đã đeo ${mask.name}`)
      return
    }
    if (state.coins < mask.price) {
      setMessage('Chưa đủ xu')
      return
    }
    setState((s) => ({ ...s, coins: s.coins - mask.price, owned: [...s.owned, mask.id], equipped: mask.id }))
    setMessage(`Mua ${mask.name}`)
  }

  const reset = () => {
    setState({ coins: 300, owned: [], equipped: null })
    setMessage('')
  }

  const current = MASKS.find((m) => m.id === state.equipped)
  const equippedCount = state.owned.length

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-6">
      <div className="rounded-lg bg-ink p-6 text-center text-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">Khu vực bí mật</p>
        <h1 className="mt-2 text-2xl font-extrabold md:text-3xl">MASK SHOP 🎭</h1>
        <p className="mt-1 text-sm text-white/70">Mặt nạ giả tưởng. Chỉ để vui.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2 text-sm">
          <span className="rounded-md bg-white/10 px-3 py-2">💰 {state.coins} xu</span>
          <span className="rounded-md bg-white/10 px-3 py-2">🎭 {equippedCount}/4</span>
        </div>
      </div>

      {message && (
        <p className="rounded-md border border-brand bg-brand-soft px-4 py-3 text-center text-sm font-medium text-brand">{message}</p>
      )}

      <section className="rounded-lg border border-line bg-white p-5 text-center">
        <p className="text-xs text-ink-muted">Đang đeo</p>
        <div className="my-3 text-7xl">{current?.face ?? '🙂'}</div>
        <p className="text-sm font-semibold text-ink">{current?.name ?? 'Chưa đeo mặt nạ'}</p>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-ink"><ShoppingBag size={18} /> Chọn mặt nạ</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {MASKS.map((m) => {
            const owned = state.owned.includes(m.id)
            const active = state.equipped === m.id
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => buy(m)}
                className={`rounded-lg border p-4 text-center transition-colors ${
                  active ? 'border-brand bg-brand-soft' : 'border-line bg-white hover:border-brand'
                }`}
              >
                <div className="text-4xl">{m.face}</div>
                <p className="mt-2 text-sm font-semibold text-ink">{m.name}</p>
                <p className="mt-0.5 text-xs text-ink-muted">{m.tag}</p>
                <p className="mt-2 text-xs font-medium text-brand">{owned ? 'Đã có' : `${m.price} xu`}</p>
              </button>
            )
          })}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" onClick={reset}><RotateCcw size={16} /> Chơi lại</Button>
        <span className="flex items-center gap-1 text-xs text-ink-muted"><Sparkles size={14} /> <Link to="/" className="hover:text-brand">Về cửa hàng kính</Link></span>
      </div>
    </div>
  )
}
