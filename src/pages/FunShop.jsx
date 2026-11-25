import { useEffect, useState } from 'react'

const STORAGE = 'baccarat-room'

const SUITS = ['♠', '♥', '♦', '♣']
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const value = (rank) => ({ A: 1, J: 10, Q: 10, K: 10 }[rank] ?? Number(rank))
const scoreOf = (cards) => cards.reduce((n, c) => n + value(c.rank), 0) % 10

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { credits: 100000, deals: 0, happy: false, banker: [], player: [], result: '' }
}

const draw = () => ({
  suit: SUITS[Math.floor(Math.random() * 4)],
  rank: RANKS[Math.floor(Math.random() * 13)],
})

function playBaccarat() {
  let banker = [draw(), draw()]
  let player = [draw(), draw()]
  const playerTotal = scoreOf(player)
  const bankerTotal = scoreOf(banker)

  if (playerTotal <= 5) player.push(draw())
  const playerThird = player[2] ? value(player[2].rank) : 0

  if (bankerTotal <= 5) {
    banker.push(draw())
  } else if (bankerTotal === 6) {
    if (playerThird === 6 || playerThird === 7) banker.push(draw())
  } else if (bankerTotal === 7) {
    if (playerThird >= 6 && playerThird <= 7) banker.push(draw())
  } else if (bankerTotal === 8) {
    if (playerThird === 8) banker.push(draw())
  } else if (bankerTotal === 9) {
    if (playerThird === 9) banker.push(draw())
  }

  const p = scoreOf(player)
  const b = scoreOf(banker)
  return { banker, player, result: p > b ? 'P' : b > p ? 'B' : 'T' }
}

function Card({ card }) {
  if (!card) return <span className="block h-20 w-14 rounded border border-dashed border-emerald-700/60" />
  const red = card.suit === '♥' || card.suit === '♦'
  return (
    <span className="flex h-20 w-14 flex-col items-center justify-center rounded border border-neutral-300 bg-neutral-100 shadow-lg">
      <span className={`text-lg leading-none ${red ? 'text-rose-600' : 'text-neutral-900'}`}>{card.suit}</span>
      <span className="mt-1 text-sm font-bold leading-none text-neutral-900">{card.rank}</span>
    </span>
  )
}

function Chip({ amount, color }) {
  return (
    <span className={`flex size-10 items-center justify-center rounded-full border-2 border-dashed ${color} text-[10px] font-bold`}>
      {amount >= 1000 ? `${amount / 1000}k` : amount}
    </span>
  )
}

export default function FunShop() {
  const [state, setState] = useState(load)
  const [hearts, setHearts] = useState([])

  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify(state))
  }, [state])

  const deal = () => {
    if (state.credits < 10000) return
    const { banker, player, result } = playBaccarat()
    setState((s) => ({ ...s, credits: s.credits - 10000, deals: s.deals + 1, happy: true, banker, player, result }))
    const id = Date.now() + Math.random()
    setHearts((h) => [...h, { id, x: Math.random() * 80 - 40 }])
    setTimeout(() => setHearts((h) => h.filter((i) => i.id !== id)), 1600)
  }

  const p = scoreOf(state.player)
  const b = scoreOf(state.banker)

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-between gap-6 px-6 py-8 font-mono text-neutral-200">
      <div className="flex h-3 items-center gap-2 self-center">
        {state.result && (
          <span className={`text-xs tracking-[0.3em] ${state.result === 'P' ? 'text-sky-300' : state.result === 'B' ? 'text-rose-300' : 'text-emerald-300'}`}>
            {state.result}
          </span>
        )}
      </div>

      <div className="relative h-40 w-40 self-end">
        {hearts.map((h) => (
          <span key={h.id} className="pointer-events-none absolute left-1/2 top-0 animate-bounce text-rose-500" style={{ transform: `translateX(${h.x}px)` }}>♥</span>
        ))}
        <div className={`absolute bottom-0 left-1/2 h-20 w-24 -translate-x-1/2 rounded-t-full ${state.happy ? 'bg-rose-950' : 'bg-neutral-900'}`} />
        <div className={`absolute bottom-16 left-1/2 h-14 w-14 -translate-x-1/2 rounded-full ${state.happy ? 'bg-rose-200' : 'bg-neutral-300'}`} />
        <div className="absolute bottom-[4.5rem] left-1/2 flex -translate-x-1/2 gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${state.happy ? 'h-0.5 w-2.5 bg-rose-900' : 'bg-neutral-800'}`} />
          <span className={`h-1.5 w-1.5 rounded-full ${state.happy ? 'h-0.5 w-2.5 bg-rose-900' : 'bg-neutral-800'}`} />
        </div>
        <div className={`absolute bottom-[3.2rem] left-1/2 h-1 -translate-x-1/2 rounded-full ${state.happy ? 'w-5 bg-rose-900' : 'w-2 bg-neutral-800'}`} />
        <div className="absolute bottom-24 left-1/2 h-12 w-16 -translate-x-1/2 -rotate-6 rounded border border-neutral-600 bg-neutral-100" key={`hand-${state.deals}`}>
          <span className={`absolute left-3 top-3 text-lg ${state.deals % 2 ? 'text-rose-600' : 'text-neutral-900'}`}>{state.deals % 2 ? '♥' : '♠'}</span>
        </div>
      </div>

      <div className="w-full rounded-t-[50%] border-t-4 border-emerald-900 bg-emerald-950 px-6 pb-6 pt-14">
        <div className="mx-auto grid max-w-2xl grid-cols-2 gap-8">
          <div className={`flex flex-col items-center gap-3 rounded-lg border p-4 ${state.result === 'P' ? 'border-sky-500 bg-sky-950/40' : 'border-emerald-800/60'}`}>
            <div className="flex items-center gap-3">
              <span className="text-4xl text-neutral-200">{p}</span>
              <Chip amount={10000} color="border-sky-400 text-sky-300" />
            </div>
            <div className="flex gap-1">
              {state.player.map((c, i) => <Card key={i} card={c} />)}
              {Array.from({ length: Math.max(0, 3 - state.player.length) }).map((_, i) => <Card key={`e${i}`} />)}
            </div>
            <span className="text-xs tracking-[0.3em] text-sky-300">PLAYER</span>
          </div>
          <div className={`flex flex-col items-center gap-3 rounded-lg border p-4 ${state.result === 'B' ? 'border-rose-500 bg-rose-950/40' : 'border-emerald-800/60'}`}>
            <div className="flex items-center gap-3">
              <span className="text-4xl text-neutral-200">{b}</span>
              <Chip amount={10000} color="border-rose-400 text-rose-300" />
            </div>
            <div className="flex gap-1">
              {state.banker.map((c, i) => <Card key={i} card={c} />)}
              {Array.from({ length: Math.max(0, 3 - state.banker.length) }).map((_, i) => <Card key={`e${i}`} />)}
            </div>
            <span className="text-xs tracking-[0.3em] text-rose-300">BANKER</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <span className="text-2xl tabular-nums text-neutral-300">{state.credits.toLocaleString('vi-VN')}</span>
        <button
          type="button"
          onClick={deal}
          disabled={state.credits < 10000}
          className="flex h-16 w-16 items-center justify-center rounded-full border border-rose-900 bg-rose-950 text-2xl text-rose-200 transition-transform hover:scale-105 active:scale-95 disabled:opacity-30"
          aria-label="deal"
        >
          ♥
        </button>
      </div>
    </div>
  )
}
