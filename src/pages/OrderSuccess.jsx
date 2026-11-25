import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, PackageSearch } from 'lucide-react'
import EmptyState from '../components/common/EmptyState.jsx'
import { useAuthStore } from '../store/authStore.js'
import { useOrderStore } from '../store/orderStore.js'
import { formatDateTime, formatVND } from '../utils/format.js'

export default function OrderSuccess() {
  const { code } = useParams()
  const user = useAuthStore((s) => s.user)
  const order = useOrderStore((s) => s.orders.find((o) => o.order_code === code))

  if (!order) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="Không tìm thấy đơn hàng"
        description="Mã đơn hàng không đúng hoặc đơn hàng không thuộc tài khoản này."
        action={<Link to="/" className="text-sm font-semibold text-brand hover:underline">Về trang chủ</Link>}
      />
    )
  }

  const isOwner = user && user.id === order.user_id

  return (
    <div className="mx-auto max-w-xl space-y-6 py-6 text-center">
      <CheckCircle2 className="mx-auto size-16 text-green-600" strokeWidth={1.5} aria-hidden="true" />
      <div>
        <h1 className="text-2xl font-bold text-ink">Đặt hàng thành công!</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Mã đơn hàng của bạn là <span className="font-semibold text-ink">{order.order_code}</span>.
          Chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất.
        </p>
      </div>

      <div className="rounded-lg border border-line bg-white p-5 text-left text-sm">
        <div className="flex justify-between py-1"><span className="text-ink-muted">Ngày đặt</span><span>{formatDateTime(order.created_at)}</span></div>
        <div className="flex justify-between py-1"><span className="text-ink-muted">Người nhận</span><span>{order.recipient_name}</span></div>
        <div className="flex justify-between py-1"><span className="text-ink-muted">Thanh toán</span><span>Khi nhận hàng (COD)</span></div>
        <div className="flex justify-between border-t border-line pt-3 mt-2 font-semibold"><span>Tổng thanh toán</span><span className="text-brand">{formatVND(order.total_amount)}</span></div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        {isOwner && (
          <Link to="/my-orders" className="inline-flex h-12 items-center justify-center rounded-md bg-brand px-6 text-base font-semibold text-white hover:bg-brand-hover">
            Xem đơn hàng
          </Link>
        )}
        <Link to="/products" className="inline-flex h-12 items-center justify-center rounded-md border border-line bg-white px-6 text-base font-semibold text-ink hover:bg-surface">
          Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  )
}
