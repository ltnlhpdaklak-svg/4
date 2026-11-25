export const STATUS_STYLE = {
  'Chờ xác nhận': 'bg-amber-100 text-amber-700',
  'Đã xác nhận': 'bg-blue-100 text-blue-700',
  'Đang giao hàng': 'bg-violet-100 text-violet-700',
  'Đã giao hàng': 'bg-green-100 text-green-700',
  'Đã hủy': 'bg-neutral-200 text-neutral-600',
}

export default function StatusBadge({ status }) {
  const style = STATUS_STYLE[status] ?? 'bg-neutral-100 text-neutral-600'
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {status}
    </span>
  )
}
