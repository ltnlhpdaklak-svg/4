import { AlertTriangle } from 'lucide-react'
import Button from './Button.jsx'

export default function ErrorState({
  title = 'Không tải được dữ liệu',
  description = 'Vui lòng kiểm tra kết nối và thử lại.',
  onRetry,
}) {
  return (
    <div role="alert" className="flex flex-col items-center px-4 py-14 text-center">
      <AlertTriangle className="mb-4 size-12 text-red-600" strokeWidth={1.5} aria-hidden="true" />
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>
      {onRetry && (
        <div className="mt-6">
          <Button variant="ghost" onClick={onRetry}>Thử lại</Button>
        </div>
      )}
    </div>
  )
}
