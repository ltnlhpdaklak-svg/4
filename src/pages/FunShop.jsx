import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Crosshair, RotateCcw, ShoppingBag, Sparkles } from 'lucide-react'
import Button from '../components/common/Button.jsx'

const WEAPONS = [
  { id: 'water', name: 'Súng nước Mini', emoji: '🔫', price: 100, power: 1, desc: 'Bắn nhẹ, an toàn, hợp ngày hè.' },
  { id: 'nerf', name: 'Súng bắn đạn foam', emoji: '🎯', price: 350, power: 3, desc: 'Đạn mềm, bắn xa, không đau.' },
  { id: 'laser', name: 'Súng laser GIẢ TƯỞNG', emoji: '⚡', price: 900, power: 6, desc: 'Chỉ có trong tưởng tượng thôi nha.' },
  { id: 'cannon', name: 'Đại bác Khoai Tây', emoji: '💥', price: 2500, power: 12, desc: 'Vũ khí tối thượng của nhóm 4.' },
]

const STORAGE = '4eyewear-fun-game'

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { coins: 500, owned: [], score: 0, target: 0 }
}

export default function FunShop() {
  const [state, setState] = useState(loadState)
  const [message, setMessage] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify(state))
  }, [state])

  const buy = (weapon) => {
    if (state.owned.includes(weapon.id)) {
      setMessage(`Bạn đã có ${weapon.name} rồi!`)
      return
    }
    if (state.coins < weapon.price) {
      setMessage('Tiền ảo chưa đủ. Bắn mục tiêu để kiếm thêm!')
      return
    }
    setState((s) => ({ ...s, coins: s.coins - weapon.price, owned: [...s.owned, weapon.id] }))
    setMessage(`Đã mua ${weapon.name}. Đồ chơi, không có thật nha!`)
  }

  const shoot = () => {
    const best = WEAPONS.filter((w) => state.owned.includes(w.id)).reduce((max, w) => Math.max(max, w.power), 0)
    if (!best) {
      setMessage('Chưa có súng nào. Mua một cái đã!')
      return
    }
    const hit = Math.random() < 0.75
    const gain = hit ? best * 10 : 0
    setState((s) => ({
      ...s,
      coins: s.coins + gain,
      score: s.score + (hit ? 1 : 0),
      target: s.target + 1,
    }))
    setMessage(hit ? `Trúng mục tiêu! +${gain} xu` : 'Trượt rồi, thử lại!')
  }

  const reset = () => {
    setState({ coins: 500, owned: [], score: 0, target: 0 })
    setMessage('Đã chơi lại từ đầu.')
  }

  const accuracy = state.target ? Math.round((state.score / state.target) * 100) : 0
  const best = WEAPONS.filter((w) => state.owned.includes(w.id)).reduce((max, w) => Math.max(max, w.power), 0)

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-6">
      <div className="rounded-lg bg-ink p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">Khu vực bí mật · Chỉ để vui</p>
        <h1 className="mt-2 text-2xl font-extrabold md:text-3xl">4EYEWEAR ARSENAL 🔫</h1>
        <p className="mt-2 text-sm text-white/70">
          Cửa hàng vũ khí GIẢ TƯỞNG. Mọi thứ ở đây là đồ chơi, dùng xu ảo, không liên quan đến cửa hàng kính.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <span className="rounded-md bg-white/10 px-3 py-2">💰 {state.coins} xu</span>
          <span className="rounded-md bg-white/10 px-3 py-2">🎯 {state.score}/{state.target} trúng ({accuracy}%)</span>
          <span className="rounded-md bg-white/10 px-3 py-2">🏆 Sức mạnh: {best || 0}</span>
        </div>
      </div>

      {message && (
        <p className="rounded-md border border-brand bg-brand-soft px-4 py-3 text-sm font-medium text-brand">{message}</p>
      )}

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-ink"><ShoppingBag size={18} /> Cửa hàng đồ chơi</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {WEAPONS.map((w) => (
            <div key={w.id} className="rounded-lg border border-line bg-white p-4 text-center">
              <div className="text-4xl">{w.emoji}</div>
              <h3 className="mt-3 text-sm font-semibold text-ink">{w.name}</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">{w.desc}</p>
              <p className="mt-2 text-xs font-medium text-brand">Sức mạnh {w.power} · {w.price} xu</p>
              <Button size="sm" className="mt-3 w-full" onClick={() => buy(w)} disabled={state.owned.includes(w.id)}>
                {state.owned.includes(w.id) ? 'Đã có' : 'Mua'}
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-5 text-center">
        <h2 className="text-base font-semibold text-ink">Bắn mục tiêu</h2>
        <p className="mt-1 text-xs text-ink-muted">Click để bắn. Trúng được cộng xu, dùng để mua thêm đồ chơi.</p>
        <div className="my-6 flex items-center justify-center">
          <button
            type="button"
            onClick={shoot}
            aria-label="Bắn mục tiêu"
            className="flex size-40 items-center justify-center rounded-full border-4 border-brand bg-brand-soft text-6xl transition-transform hover:scale-105 active:scale-95"
          >
            🎯
          </button>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={shoot}><Crosshair size={16} /> Bắn!</Button>
          <Button variant="outline" onClick={reset}><RotateCcw size={16} /> Chơi lại</Button>
        </div>
      </section>

      <div className="flex items-center justify-center gap-2 text-xs text-ink-muted">
        <Sparkles size={14} /> <Link to="/" className="hover:text-brand">Quay lại cửa hàng kính</Link>
      </div>
    </div>
  )
}
