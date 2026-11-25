import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/common/Button.jsx'

const MASKS = [
  { id: 'idol', name: 'IDOL LIVE', code: 'IL-01', price: 100 },
  { id: 'hacker', name: 'HACKER', code: 'HK-02', price: 250 },
  { id: 'killer', name: 'KILLER', code: 'KL-03', price: 500 },
  { id: 'ghost', name: 'GHOST', code: 'GH-04', price: 800 },
]

const STORAGE = 'mask-shop'

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { coins: 300, owned: [], equipped: null }
}

export default function FunShop() {
  const [state, setState] = useState(load)
  const [note, setNote] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify(state))
  }, [state])

  const choose = (mask) => {
    if (state.owned.includes(mask.id)) {
      setState((s) => ({ ...s, equipped: mask.id }))
      setNote('')
      return
    }
    if (state.coins < mask.price) {
      setNote('NOT ENOUGH')
      return
    }
    setState((s) => ({ ...s, coins: s.coins - mask.price, owned: [...s.owned, mask.id], equipped: mask.id }))
    setNote('')
  }

  const reset = () => {
    setState({ coins: 300, owned: [], equipped: null })
    setNote('')
  }

  const current = MASKS.find((m) => m.id === state.equipped)

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-8 font-mono">
      <header className="border-b border-neutral-800 pb-6">
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-bold uppercase tracking-[0.35em] text-neutral-100">The Mask Shop</h1>
          <span className="text-[10px] tracking-widest text-neutral-500">EST. 2026</span>
        </div>
        <p className="mt-2 text-[11px] tracking-[0.2em] text-neutral-500">NO QUESTIONS. NO REFUNDS.</p>
      </header>

      <div className="flex justify-between text-xs tracking-widest text-neutral-400">
        <span>BALANCE <span className="text-neutral-100">{state.coins}</span></span>
        <span>COLLECTION <span className="text-neutral-100">{state.owned.length}/4</span></span>
      </div>

      {note && <p className="text-xs tracking-widest text-neutral-300">{note}</p>}

      <section className="border border-neutral-800 bg-neutral-950 p-8 text-center">
        <p className="text-[10px] tracking-[0.3em] text-neutral-500">CURRENT</p>
        <div className="mx-auto my-6 flex size-32 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 text-4xl text-neutral-300">
          {current ? current.code.slice(0, 2) : '--'}
        </div>
        <p className="text-sm tracking-[0.25em] text-neutral-200">{current?.name ?? 'NONE'}</p>
      </section>

      <section>
        <p className="mb-3 text-[10px] tracking-[0.3em] text-neutral-500">CATALOGUE</p>
        <div className="grid grid-cols-2 gap-px bg-neutral-800 sm:grid-cols-4">
          {MASKS.map((m) => {
            const owned = state.owned.includes(m.id)
            const active = state.equipped === m.id
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => choose(m)}
                className={`bg-neutral-950 p-5 text-left transition-colors hover:bg-neutral-900 ${
                  active ? 'bg-neutral-900 ring-1 ring-neutral-600' : ''
                }`}
              >
                <p className="text-[10px] tracking-widest text-neutral-500">{m.code}</p>
                <p className="mt-3 text-sm font-bold tracking-widest text-neutral-200">{m.name}</p>
                <p className="mt-4 text-xs text-neutral-400">{owned ? 'OWNED' : `${m.price}`}</p>
              </button>
            )
          })}
        </div>
      </section>

      <div className="flex items-center justify-between border-t border-neutral-800 pt-6">
        <Button variant="ghost" size="sm" onClick={reset} className="text-neutral-400">RESET</Button>
        <Link to="/" className="text-[11px] tracking-widest text-neutral-500 hover:text-neutral-300">EXIT</Link>
      </div>
    </div>
  )
}
