import { useEffect, useState } from 'react'

const STORAGE = 'dealer-room'

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { credits: 100000, tipped: 0, happy: false }
}

export default function FunShop() {
  const [state, setState] = useState(load)
  const [deal, setDeal] = useState(0)

  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify(state))
  }, [state])

  const tip = () => {
    if (state.credits < 10000 || state.tipped >= 10) return
    setState((s) => ({ ...s, credits: s.credits - 10000, tipped: s.tipped + 1, happy: true }))
    setDeal((d) => d + 1)
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-10 px-6 py-10 font-mono text-neutral-200">
      <div className="flex gap-2">
        {Array.from({ length: state.tipped }).map((_, i) => (
          <span key={i} className="h-2 w-2 rounded-full bg-rose-500" />
        ))}
      </div>

      <div className="relative h-56 w-44">
        <div className={`absolute bottom-0 left-1/2 h-24 w-28 -translate-x-1/2 rounded-t-full transition-colors duration-300 ${state.happy ? 'bg-rose-950' : 'bg-neutral-900'}`} />
        <div className={`absolute bottom-20 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full transition-colors duration-300 ${state.happy ? 'bg-rose-200' : 'bg-neutral-300'}`} />
        <div className="absolute bottom-[5.4rem] left-1/2 flex -translate-x-1/2 gap-3">
          <span className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${state.happy ? 'h-0.5 w-3 bg-rose-900' : 'bg-neutral-800'}`} />
          <span className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${state.happy ? 'h-0.5 w-3 bg-rose-900' : 'bg-neutral-800'}`} />
        </div>
        <div className={`absolute bottom-[3.9rem] left-1/2 h-1 -translate-x-1/2 rounded-full transition-all duration-300 ${state.happy ? 'w-6 bg-rose-900' : 'w-3 bg-neutral-800'}`} />

        <div className="absolute bottom-28 left-0 h-20 w-14 -rotate-12 rounded border border-neutral-500 bg-neutral-100" key={`l-${deal}`}>
          <span className={`absolute left-2 top-2 text-lg ${deal % 2 ? 'text-rose-600' : 'text-neutral-900'}`}>{deal % 2 ? '♥' : '♠'}</span>
        </div>
        <div className="absolute bottom-24 right-0 h-20 w-14 rotate-12 rounded border border-neutral-500 bg-neutral-100" key={`r-${deal}`}>
          <span className={`absolute left-2 top-2 text-lg ${deal % 3 ? 'text-rose-600' : 'text-neutral-900'}`}>{deal % 3 ? '♦' : '♣'}</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-5">
        <div className="h-px w-64 bg-neutral-800" />
        <div className="flex items-center gap-6">
          <span className="text-2xl tabular-nums text-neutral-300">{state.credits.toLocaleString('vi-VN')}</span>
          <button
            type="button"
            onClick={tip}
            disabled={state.credits < 10000 || state.tipped >= 10}
            className="flex h-16 w-16 items-center justify-center rounded-full border border-rose-900 bg-rose-950 text-2xl text-rose-200 transition-transform hover:scale-105 active:scale-95 disabled:opacity-30"
            aria-label="tip"
          >
            ♥
          </button>
        </div>
      </div>
    </div>
  )
}
