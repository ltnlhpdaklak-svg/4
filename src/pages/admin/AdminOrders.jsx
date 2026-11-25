import { useEffect, useMemo, useState } from 'react'
import { ClipboardList, Search } from 'lucide-react'
import Button from '../../components/common/Button.jsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import Drawer from '../../components/common/Drawer.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import { inputClass } from '../../components/common/FormField.jsx'
import PageHeader from '../../components/common/PageHeader.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import { useOrderStore } from '../../store/orderStore.js'
import { notify } from '../../store/uiStore.js'
import { ORDER_STATUSES, PAYMENT_METHOD_LABEL } from '../../utils/constants.js'
import { formatDateTime, formatVND, normalizeText } from '../../utils/format.js'

const FILTERS = ['Tất cả', ...ORDER_STATUSES]

export default function AdminOrders() {
  const orders = useOrderStore((s) => s.orders)
  const loadOrders = useOrderStore((s) => s.loadAll)
  const updateStatus = useOrderStore((s) => s.updateStatus)

  useEffect(() => {
    loadOrders()
  }, [loadOrders])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('Tất cả')
  const [selectedId, setSelectedId] = useState(null)
  const [pendingCancel, setPendingCancel] = useState(null)

  const countOf = (f) => (f === 'Tất cả' ? orders.length : orders.filter((o) => o.status === f).length)

  const list = useMemo(() => {
    const q = normalizeText(query)
    return orders
      .filter((o) => filter === 'Tất cả' || o.status === filter)
      .filter((o) => !q || [o.order_code, o.customer_name, o.recipient_name].some((v) => normalizeText(v).includes(q)))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [orders, query, filter])

  const selected = orders.find((o) => o.id === selectedId) ?? null

  const changeStatus = (order, status) => {
    // Hủy đơn cần xác nhận trước vì ảnh hưởng tồn kho
    if (status === 'Đã hủy') {
      setPendingCancel(order)
      return
    }
    updateStatus(order.id, status)
    notify({ title: 'Đã cập nhật trạng thái', description: `${order.order_code}: ${status}` })
  }

  const confirmCancel = () => {
    updateStatus(pendingCancel.id, 'Đã hủy')
    notify({ title: 'Đã hủy đơn hàng', description: `Đơn ${pendingCancel.order_code} đã chuyển sang "Đã hủy".` })
    setPendingCancel(null)
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Quản lý đơn hàng" description={`${orders.length} đơn hàng`} />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative md:w-80">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo mã đơn, tên khách..."
            aria-label="Tìm đơn hàng"
            className={`${inputClass()} pl-9`}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f ? 'border-brand bg-brand text-white' : 'border-line bg-white text-ink hover:bg-surface'
              }`}
            >
              {f} ({countOf(f)})
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line bg-surface text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Mã đơn</th>
              <th className="px-4 py-3 font-semibold">Ngày đặt</th>
              <th className="px-4 py-3 font-semibold">Người nhận</th>
              <th className="px-4 py-3 text-right font-semibold">Tổng tiền</th>
              <th className="px-4 py-3 font-semibold">Trạng thái</th>
              <th className="px-4 py-3 text-right font-semibold"><span className="sr-only">Thao tác</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((o) => (
              <tr key={o.id} className="hover:bg-surface/60">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-ink">{o.order_code}</td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-muted">{formatDateTime(o.created_at)}</td>
                <td className="px-4 py-3">
                  <p className="text-ink">{o.recipient_name}</p>
                  <p className="text-xs text-ink-muted">Đặt bởi {o.customer_name}</p>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-medium">{formatVND(o.total_amount)}</td>
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedId(o.id)}>Chi tiết</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && (
          <div className="p-8">
            <EmptyState icon={ClipboardList} title="Không có đơn hàng phù hợp" description="Thử đổi bộ lọc hoặc từ khóa tìm kiếm." />
          </div>
        )}
      </div>

      <Drawer open={Boolean(selected)} title={selected ? `Đơn ${selected.order_code}` : ''} onClose={() => setSelectedId(null)}>
        {selected && (
          <div className="space-y-6 text-sm">
            <section className="space-y-3">
              <h3 className="font-semibold text-ink">Trạng thái</h3>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={selected.status} />
                {selected.status === 'Đã hủy' ? (
                  <p className="text-xs text-ink-muted">Đơn đã hủy nên không thể đổi trạng thái.</p>
                ) : (
                  <select
                    aria-label="Đổi trạng thái đơn hàng"
                    value={selected.status}
                    onChange={(e) => changeStatus(selected, e.target.value)}
                    className="h-10 rounded-md border border-line bg-white px-3 text-sm text-ink outline-none focus:border-brand"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                )}
              </div>
              <p className="text-xs text-ink-muted">Đặt lúc {formatDateTime(selected.created_at)}</p>
            </section>

            <section className="space-y-1">
              <h3 className="font-semibold text-ink">Giao hàng</h3>
              <p className="text-ink">{selected.recipient_name} · {selected.recipient_phone}</p>
              <p className="text-ink-muted">{selected.shipping_address}</p>
              {selected.note && <p className="rounded-md bg-surface p-2 text-xs text-ink-muted">Ghi chú: {selected.note}</p>}
            </section>

            <section className="space-y-1">
              <h3 className="font-semibold text-ink">Tài khoản đặt hàng</h3>
              <p className="text-ink">{selected.customer_name}</p>
              <p className="text-ink-muted">{selected.customer_email} · {selected.customer_phone || 'Chưa có SĐT'}</p>
            </section>

            <section>
              <h3 className="mb-2 font-semibold text-ink">Sản phẩm</h3>
              <ul className="divide-y divide-line rounded-md border border-line">
                {selected.items.map((item) => (
                  <li key={item.product_id} className="flex justify-between gap-3 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-ink">{item.product_name}</p>
                      <p className="text-xs text-ink-muted">{item.quantity} × {formatVND(item.unit_price)}</p>
                    </div>
                    <p className="shrink-0 font-medium">{formatVND(item.subtotal)}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-2 border-t border-line pt-4">
              <div className="flex justify-between"><span className="text-ink-muted">Tạm tính</span><span>{formatVND(selected.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-ink-muted">Khuyến mãi</span><span className="text-green-700">-{formatVND(selected.discount)}</span></div>
              <div className="flex justify-between font-semibold"><span>Tổng</span><span className="text-brand">{formatVND(selected.total_amount)}</span></div>
              <p className="text-xs text-ink-muted">{PAYMENT_METHOD_LABEL} · {selected.payment_status}</p>
            </section>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={Boolean(pendingCancel)}
        title="Hủy đơn hàng"
        message={pendingCancel ? `Chuyển đơn ${pendingCancel.order_code} sang trạng thái "Đã hủy"?` : ''}
        confirmLabel="Hủy đơn"
        danger
        onConfirm={confirmCancel}
        onClose={() => setPendingCancel(null)}
      />
    </div>
  )
}
