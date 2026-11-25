import { CheckCircle2, Circle, XCircle } from 'lucide-react'
import { STATUS_FLOW } from '../../utils/constants.js'

// Thanh tiến trình giao hàng dạng dọc. Đơn đã hủy hiển thị riêng.
export default function OrderTimeline({ status }) {
  if (status === 'Đã hủy') {
    return (
      <div className="flex items-center gap-2 rounded-md bg-neutral-100 p-3 text-sm text-neutral-700">
        <XCircle size={18} className="text-neutral-500" aria-hidden="true" />
        Đơn hàng đã được hủy.
      </div>
    )
  }

  const currentIndex = STATUS_FLOW.indexOf(status)
  return (
    <ol className="space-y-4">
      {STATUS_FLOW.map((step, idx) => {
        const done = idx <= currentIndex
        const current = idx === currentIndex
        return (
          <li key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              {done ? (
                <CheckCircle2 size={20} className="text-brand" aria-hidden="true" />
              ) : (
                <Circle size={20} className="text-line" aria-hidden="true" />
              )}
              {idx < STATUS_FLOW.length - 1 && (
                <span className={`mt-1 h-6 w-0.5 ${idx < currentIndex ? 'bg-brand' : 'bg-line'}`} />
              )}
            </div>
            <p className={`pt-0.5 text-sm ${current ? 'font-semibold text-ink' : done ? 'text-ink' : 'text-ink-muted'}`}>
              {step}
            </p>
          </li>
        )
      })}
    </ol>
  )
}
