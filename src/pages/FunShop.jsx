import { useEffect, useState } from 'react'
import { getWallet, updateWallet } from '../store/baccaratStore.js'

const SUITS = ['♠', '♥', '♦', '♣']
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const value = (r) => ({ A: 1, J: 10, Q: 10, K: 10 }[r] ?? Number(r))
const scoreOf = (cards) => cards.reduce((n, c) => n + value(c.rank), 0) % 10
const draw = () => ({ suit: SUITS[Math.floor(Math.random() * 4)], rank: RANKS[Math.floor(Math.random() * 13)] })

function play() {
  let banker = [draw(), draw()]
  let player = [draw(), draw()]
  if (scoreOf(player) <= 5) player.push(draw())
  const third = player[2] ? value(player[2].rank) : 0
  const b = scoreOf(banker)
  if (b <= 5) banker.push(draw())
  else if (b === 6 && (third === 6 || third === 7)) banker.push(draw())
  else if (b === 7 && third >= 6 && third <= 7) banker.push(draw())
  else if (b === 8 && third === 8) banker.push(draw())
  else if (b === 9 && third === 9) banker.push(draw())
  const p = scoreOf(player)
  const bb = scoreOf(banker)
  return { banker, player, result: p > bb ? 'P' : bb > p ? 'B' : 'T' }
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

function Girl({ happy }) {
  return (
    <div className="relative h-40 w-40 self-end">
      <div className={`absolute left-1/2 top-2 -translate-x-1/2 text-2xl transition-opacity duration-200 ${happy ? 'opacity-100' : 'opacity-0'}`}>♥</div>
      <div className={`absolute left-8 top-6 -translate-x-1/2 text-lg transition-opacity duration-200 ${happy ? 'opacity-100' : 'opacity-0'}`}>♥</div>
      <div className={`absolute right-7 top-8 -translate-x-1/2 text-base transition-opacity duration-200 ${happy ? 'opacity-100' : 'opacity-0'}`}>♥</div>
      <div className="absolute bottom-0 left-1/2 h-20 w-24 -translate-x-1/2 rounded-t-full bg-gradient-to-b from-rose-950 to-neutral-900" />
      <div className="absolute bottom-[4.6rem] left-1/2 h-3 w-28 -translate-x-1/2 rounded-full bg-neutral-800" />
      <div className={`absolute bottom-16 left-1/2 h-14 w-14 -translate-x-1/2 rounded-full transition-colors duration-200 ${happy ? 'bg-rose-200' : 'bg-neutral-300'}`} />
      <div className="absolute bottom-[5.2rem] left-[3.6rem] h-5 w-7 -rotate-12 rounded-full bg-neutral-700/80" />
      <div className="absolute bottom-[5.2rem] right-[3.6rem] h-5 w-7 rotate-12 rounded-full bg-neutral-700/80" />
      <div className="absolute bottom-[5rem] left-1/2 flex -translate-x-1/2 gap-2">
        <span className={`h-1.5 w-1.5 rounded-full transition-all duration-200 ${happy ? 'h-0.5 w-2.5 bg-rose-900' : 'bg-neutral-800'}`} />
        <span className={`h-1.5 w-1.5 rounded-full transition-all duration-200 ${happy ? 'h-0.5 w-2.5 bg-rose-900' : 'bg-neutral-800'}`} />
      </div>
      <div className={`absolute bottom-[3.7rem] left-1/2 h-px -translate-x-1/2 rounded-full transition-all duration-200 ${happy ? 'w-6 bg-rose-900' : 'w-2 bg-neutral-800'}`} />
      <div className={`absolute bottom-[3.1rem] left-1/2 h-1 -translate-x-1/2 rounded-full transition-all duration-200 ${happy ? 'w-4 bg-rose-800/60' : 'w-0 bg-transparent'}`} />
      <div className="absolute bottom-[2.7rem] left-1/2 h-3 w-8 -translate-x-1/2 rounded-t bg-rose-900/70" />
    </div>
  )
}

const QUICK = [10000, 50000, 100000, 250000, 500000]

export default function FunShop() {
  const [wallet, setWallet] = useState({ balance: 1000000, unlimited: false, user: null })
  const [bet, setBet] = useState(10000)
  const [happy, setHappy] = useState(false)
  const [busy, setBusy] = useState(false)
  const [table, setTable] = useState({ banker: [], player: [], result: '' })

  useEffect(() => {
    getWallet().then(setWallet)
  }, [])

  const canBet = wallet.unlimited || wallet.balance >= bet

  const deal = async () => {
    if (!canBet || busy) return
    setBusy(true)
    const next = play()
    setTable(next)
    setHappy(true)
    if (!wallet.unlimited) {
      const delta = next.result === 'T' ? 0 : next.result === 'P' ? bet : -bet
      const balance = wallet.balance + delta
      setWallet((w) => ({ ...w, balance }))
      await updateWallet(balance)
    }
    setBusy(false)
  }

  const p = scoreOf(table.player)
  const b = scoreOf(table.banker)

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-between gap-5 px-6 py-8 font-mono text-neutral-200">
      <div className="h-3 self-center text-xs tracking-[0.3em]">
        {table.result && (
          <span className={table.result === 'P' ? 'text-sky-300' : table.result === 'B' ? 'text-rose-300' : 'text-emerald-300'}>
            {table.result}
          </span>
        )}
      </div>

      <Girl happy={happy} />

      <div className="w-full rounded-t-[50%] border-t-4 border-emerald-900 bg-emerald-950 px-6 pb-6 pt-14">
        <div className="mx-auto grid max-w-2xl grid-cols-2 gap-8">
          <div className={`flex flex-col items-center gap-3 rounded-lg border p-4 ${table.result === 'P' ? 'border-sky-500 bg-sky-950/40' : 'border-emerald-800/60'}`}>
            <div className="flex items-center gap-3">
              <span className="text-4xl text-neutral-200">{p}</span>
              <span className="flex size-10 items-center justify-center rounded-full border-2 border-dashed border-sky-400 text-[10px] font-bold text-sky-300">{bet / 1000}k</span>
            </div>
            <div className="flex gap-1">
              {table.player.map((c, i) => <Card key={i} card={c} />)}
              {Array.from({ length: Math.max(0, 3 - table.player.length) }).map((_, i) => <Card key={`pe${i}`} />)}
            </div>
            <span className="text-xs tracking-[0.3em] text-sky-300">PLAYER</span>
          </div>
          <div className={`flex flex-col items-center gap-3 rounded-lg border p-4 ${table.result === 'B' ? 'border-rose-500 bg-rose-950/40' : 'border-emerald-800/60'}`}>
            <div className="flex items-center gap-3">
              <span className="text-4xl text-neutral-200">{b}</span>
              <span className="flex size-10 items-center justify-center rounded-full border-2 border-dashed border-rose-400 text-[10px] font-bold text-rose-300">{bet / 1000}k</span>
            </div>
            <div className="flex gap-1">
              {table.banker.map((c, i) => <Card key={i} card={c} />)}
              {Array.from({ length: Math.max(0, 3 - table.banker.length) }).map((_, i) => <Card key={`be${i}`} />)}
            </div>
            <span className="text-xs tracking-[0.3em] text-rose-300">BANKER</span>
          </div>
        </div>
      </div>

      <div className="flex w-full max-w-xl flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-2">
          {QUICK.map((v) => (
            <button key={v} type="button" onClick={() => setBet(v)} className={`rounded border px-3 py-1.5 text-xs transition-colors ${bet === v ? 'border-rose-600 bg-rose-950 text-rose-200' : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'}`}>
              {v / 1000}k
            </button>
          ))}
        </div>
        <input type="range" min="10000" max="500000" step="10000" value={bet} onChange={(e) => setBet(Number(e.target.value))} className="w-full max-w-sm accent-rose-700" />
        <div className="flex items-center gap-8">
          <span className="text-2xl tabular-nums text-neutral-300">{wallet.unlimited ? '∞' : wallet.balance.toLocaleString('vi-VN')}</span>
          <button
            type="button"
            onClick={deal}
            disabled={!canBet || busy}
            className="flex h-16 w-16 items-center justify-center rounded-full border border-rose-900 bg-rose-950 text-2xl text-rose-200 transition-transform hover:scale-105 active:scale-95 disabled:opacity-30"
            aria-label="deal"
          >
            ♥
          </button>
        </div>
      </div>
    </div>
  )
}
