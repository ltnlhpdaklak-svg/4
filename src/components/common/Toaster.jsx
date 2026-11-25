import { Link } from 'react-router-dom'
import { CheckCircle2, AlertTriangle, X } from 'lucide-react'
import { useUIStore } from '../../store/uiStore.js'

export default function Toaster() {
  const toasts = useUIStore((s) => s.toasts)
  const dismiss = useUIStore((s) => s.dismiss)

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-3 bottom-4 z-[70] flex flex-col items-center gap-2 md:inset-x-auto md:bottom-auto md:right-4 md:top-20 md:items-end"
    >
      {toasts.map((t) => {
        const isError = t.type === 'error'
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border bg-white p-3 shadow-md ${
              isError ? 'border-red-200' : 'border-green-200'
            }`}
          >
            {isError ? (
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" aria-hidden="true" />
            )}
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-semibold ${isError ? 'text-red-700' : 'text-ink'}`}>{t.title}</p>
              {t.description && <p className="mt-0.5 text-xs text-ink-muted">{t.description}</p>}
              {t.action && (
                <Link to={t.action.to} className="mt-1 inline-block text-xs font-semibold text-brand hover:underline">
                  {t.action.label}
                </Link>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Đóng thông báo"
              className="rounded p-0.5 text-ink-muted hover:bg-surface"
            >
              <X size={16} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
