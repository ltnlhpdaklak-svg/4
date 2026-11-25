import { Minus, Plus } from 'lucide-react'

export default function QuantityStepper({ value, min = 1, max = 99, onChange }) {
  return (
    <div className="inline-flex items-center rounded-md border border-line bg-white">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Giảm số lượng"
        className="flex h-9 w-9 items-center justify-center text-ink transition-colors hover:bg-surface disabled:opacity-40"
      >
        <Minus size={16} />
      </button>
      <span className="min-w-10 px-2 text-center text-sm font-semibold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Tăng số lượng"
        className="flex h-9 w-9 items-center justify-center text-ink transition-colors hover:bg-surface disabled:opacity-40"
      >
        <Plus size={16} />
      </button>
    </div>
  )
}
