import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PackageOpen } from 'lucide-react'
import Button from '../components/common/Button.jsx'
import ConfirmDialog from '../components/common/ConfirmDialog.jsx'
import Drawer from '../components/common/Drawer.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import StatusBadge from '../components/common/StatusBadge.jsx'
import OrderTimeline from '../components/order/OrderTimeline.jsx'
import { useAuthStore } from '../store/authStore.js'
import { useOrderStore } from '../store/orderStore.js'
import { notify } from '../store/uiStore.js'
import { CUSTOMER_CANCELLABLE_STATUS, ORDER_STATUSES, PAYMENT_METHOD_LABEL } from '../utils/constants.js'
import { formatDateTime, formatVND } from '../utils/format.js'

const TABS = ['Tất cả', ...ORDER_STATUSES]

export default function MyOrders() {
  const user = useAuthStore((s) => s.user)
  const allOrders = useOrderStore((s) => s.orders)
  const loadOrders = useOrderStore((s) => s.load)
  const updateStatus = useOrderStore((s) => s.updateStatus)

  useEffect(() => {
    if (user) loadOrders(user.id, user.role === 'admin')
  }, [user, loadOrders])
  const [tab, setTab] = useState('Tất cả')
  const [selectedId, setSelectedId] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Chỉ lấy đơn của tài khoản đang đăng nhập, mới nhất lên đầu
  const myOrders = useMemo(
    () =>
      allOrders
        .filter((o) => o.user_id === user?.id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [allOrders, user?.id]
  )

  const shown = tab === 'Tất cả' ? myOrders : myOrders.filter((o) => o.status === tab)
  const selected = myOrders.find((o) => o.id === selectedId) ?? null

  const countOf = (status) =>
    status === 'Tất cả' ? myOrders.length : myOrders.filter((o) => o.status === status).length

  const handleCancel = () => {
    if (!selected) return
    updateStatus(selected.id, 'Đã hủy')
    setConfirmOpen(false)
    notify({ title: 'Đã hủy đơn hàng', description: `Mã đơn ${selected.order_code}` })
  }

  if (!myOrders.length) {
    return (
      <EmptyState
        icon={PackageOpen}
        title="Bạn chưa có đơn hàng nào"
        description="Các đơn đặt hàng sẽ hiển thị tại đây."
        action={<Link to="/products" className="text-sm font-semibold text-brand hover:underline">Mua sắm ngay</Link>}
      />
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Đơn hàng của tôi" description={`${myOrders.length} đơn hàng`} />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors md:text-sm ${
              tab === t ? 'border-brand bg-brand text-white' : 'border-line bg-white text-ink hover:bg-surface'
            }`}
          >
            {t} ({countOf(t)})
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="rounded-lg border border-line bg-white p-6 text-center text-sm text-ink-muted">
          Không có đơn hàng nào ở trạng thái này.
        </p>
      ) : (
        <ul className="space-y-3">
          {shown.map((order) => (
            <li key={order.id} className="rounded-lg border border-line bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3 text-sm">
                <p>
                  <span className="font-semibold text-ink">{order.order_code}</span>
                  <span className="text-ink-muted"> · {formatDateTime(order.created_at)}</span>
                </p>
                <StatusBadge status={order.status} />
              </div>

              <ul className="divide-y divide-line">
                {order.items.map((item) => (
                  <li key={item.product_id} className="flex gap-3 py-3">
                    <img src={item.product_image} alt="" className="size-14 shrink-0 rounded-md bg-surface object-cover" />
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="line-clamp-2 text-ink">{item.product_name}</p>
                      <p className="text-xs text-ink-muted">x{item.quantity}</p>
                    </div>
                    <p className="shrink-0 text-sm font-medium text-ink">{formatVND(item.unit_price)}</p>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                <p className="text-sm text-ink">
                  Tổng tiền: <span className="font-bold text-brand">{formatVND(order.total_amount)}</span>
                </p>
                <Button variant="ghost" size="sm" onClick={() => setSelectedId(order.id)}>
                  Xem chi tiết
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Drawer open={Boolean(selected)} title={selected ? `Đơn ${selected.order_code}` : ''} onClose={() => setSelectedId(null)}>
        {selected && (
          <div className="space-y-6 text-sm">
            <div className="flex items-center justify-between gap-3">
              <StatusBadge status={selected.status} />
              <span className="text-xs text-ink-muted">{formatDateTime(selected.created_at)}</span>
            </div>

            <section>
              <h3 className="mb-3 font-semibold text-ink">Tiến trình đơn hàng</h3>
              <OrderTimeline status={selected.status} />
            </section>

            <section className="space-y-1">
              <h3 className="font-semibold text-ink">Thông tin nhận hàng</h3>
              <p className="text-ink">{selected.recipient_name} · {selected.recipient_phone}</p>
              <p className="text-ink-muted">{selected.shipping_address}</p>
              {selected.note && <p className="text-ink-muted">Ghi chú: {selected.note}</p>}
            </section>

            <section className="space-y-2 border-t border-line pt-4">
              <div className="flex justify-between"><span className="text-ink-muted">Tạm tính</span><span>{formatVND(selected.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-ink-muted">Khuyến mãi</span><span className="text-green-700">-{formatVND(selected.discount)}</span></div>
              <div className="flex justify-between font-semibold"><span>Tổng cộng</span><span className="text-brand">{formatVND(selected.total_amount)}</span></div>
              <p className="text-xs text-ink-muted">{PAYMENT_METHOD_LABEL} · {selected.payment_status}</p>
            </section>

            {selected.status === CUSTOMER_CANCELLABLE_STATUS ? (
              <div className="space-y-2">
                <Button variant="danger" className="w-full" onClick={() => setConfirmOpen(true)}>
                  Hủy đơn hàng
                </Button>
                <p className="text-xs text-ink-muted">Bạn chỉ có thể tự hủy khi đơn còn ở trạng thái "Chờ xác nhận".</p>
              </div>
            ) : null}
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={confirmOpen}
        title="Hủy đơn hàng"
        message={selected ? `Bạn chắc chắn muốn hủy đơn ${selected.order_code}?` : ''}
        confirmLabel="Hủy đơn"
        danger
        onConfirm={handleCancel}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  )
}
