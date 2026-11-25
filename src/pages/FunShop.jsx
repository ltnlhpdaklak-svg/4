import { useEffect, useState } from 'react'

const STORAGE = 'baccarat-room'

const SUITS = ['♠', '♥', '♦', '♣']

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { credits: 100000, tipped: 0, happy: false, banker: [], player: [] }
}

const drawCard = () => ({
  suit: SUITS[Math.floor(Math.random() * 4)],
  rank: ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'][Math.floor(Math.random() * 13)],
})

const scoreOf = (cards) => cards.reduce((n, c) => n + ({ A: 1, J: 10, Q: 10, K: 10 }[c.rank] ?? Number(c.rank)), 0) % 10

function Card({ card, hidden }) {
  if (!card) return <span className="block h-20 w-14 rounded border border-dashed border-emerald-700/60" />
  return (
    <span className={`flex h-20 w-14 flex-col items-center justify-center rounded border bg-neutral-100 shadow-lg ${hidden ? 'bg-emerald-900 text-emerald-900' : ''}`}>
      <span className={`text-lg leading-none ${card.suit === '♥' || card.suit === '♦' ? 'text-rose-600' : 'text-neutral-900'}`}>{card.suit}</span>
      <span className="mt-1 text-sm font-bold leading-none text-neutral-900">{card.rank}</span>
    </span>
  )
}

export default function FunShop() {
  const [state, setState] = useState(load)

  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify(state))
  }, [state])

  const deal = () => {
    if (state.credits < 10000 || state.tipped >= 10) return
    const banker = [drawCard(), drawCard()]
    const player = [drawCard(), drawCard()]
    if (scoreOf(player) < 6) player.push(drawCard())
    if (scoreOf(banker) < 6) banker.push(drawCard())
    setState((s) => ({ ...s, credits: s.credits - 10000, tipped: s.tipped + 1, happy: true, banker, player }))
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-between gap-8 px-6 py-8 font-mono text-neutral-200">
      <div className="flex gap-2 self-center">
        {Array.from({ length: state.tipped }).map((_, i) => (
          <span key={i} className="h-2 w-2 rounded-full bg-rose-500" />
        ))}
      </div>

      <div className="relative h-44 w-40 self-end">
        <div className={`absolute bottom-0 left-1/2 h-20 w-24 -translate-x-1/2 rounded-t-full ${state.happy ? 'bg-rose-950' : 'bg-neutral-900'}`} />
        <div className={`absolute bottom-16 left-1/2 h-14 w-14 -translate-x-1/2 rounded-full ${state.happy ? 'bg-rose-200' : 'bg-neutral-300'}`} />
        <div className="absolute bottom-[4.5rem] left-1/2 flex -translate-x-1/2 gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${state.happy ? 'h-0.5 w-2.5 bg-rose-900' : 'bg-neutral-800'}`} />
          <span className={`h-1.5 w-1.5 rounded-full ${state.happy ? 'h-0.5 w-2.5 bg-rose-900' : 'bg-neutral-800'}`} />
        </div>
        <div className={`absolute bottom-[3.2rem] left-1/2 h-1 -translate-x-1/2 rounded-full ${state.happy ? 'w-5 bg-rose-900' : 'w-2 bg-neutral-800'}`} />
        <div className="absolute bottom-24 left-1/2 h-12 w-16 -translate-x-1/2 -rotate-6 rounded border border-neutral-600 bg-neutral-100" key={`hand-${state.tipped}`}>
          <span className={`absolute left-3 top-3 text-lg ${state.tipped % 2 ? 'text-rose-600' : 'text-neutral-900'}`}>{state.tipped % 2 ? '♥' : '♠'}</span>
        </div>
      </div>

      <div className="w-full rounded-t-[50%] border-t-4 border-emerald-900 bg-emerald-950 px-8 pb-8 pt-16">
        <div className="mx-auto grid max-w-2xl grid-cols-2 gap-10">
          <div className="flex flex-col items-center gap-3">
            <span className="text-4xl text-neutral-400">{scoreOf(state.player)}</span>
            <div className="flex gap-1">
              {state.player.map((c, i) => <Card key={i} card={c} />)}
              {Array.from({ length: Math.max(0, 3 - state.player.length) }).map((_, i) => <Card key={`e${i}`} />)}
            </div>
            <span className="text-xs tracking-[0.3em] text-neutral-500">P</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <span className="text-4xl text-neutral-400">{scoreOf(state.banker)}</span>
            <div className="flex gap-1">
              {state.banker.map((c, i) => <Card key={i} card={c} />)}
              {Array.from({ length: Math.max(0, 3 - state.banker.length) }).map((_, i) => <Card key={`e${i}`} />)}
            </div>
            <span className="text-xs tracking-[0.3em] text-neutral-500">B</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <span className="text-2xl tabular-nums text-neutral-300">{state.credits.toLocaleString('vi-VN')}</span>
        <button
          type="button"
          onClick={deal}
          disabled={state.credits < 10000 || state.tipped >= 10}
          className="flex h-16 w-16 items-center justify-center rounded-full border border-rose-900 bg-rose-950 text-2xl text-rose-200 transition-transform hover:scale-105 active:scale-95 disabled:opacity-30"
          aria-label="deal"
        >
          ♥
        </button>
      </div>
    </div>
  )
}
