import { useEffect, useMemo, useState } from 'react'
import { Search, Users } from 'lucide-react'
import Button from '../../components/common/Button.jsx'
import Drawer from '../../components/common/Drawer.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import { inputClass } from '../../components/common/FormField.jsx'
import PageHeader from '../../components/common/PageHeader.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import { useAuthStore } from '../../store/authStore.js'
import { useOrderStore } from '../../store/orderStore.js'
import { formatAddress, formatDate, formatDateTime, formatNumber, formatVND, normalizeText } from '../../utils/format.js'

const sortByNewest = (a, b) => new Date(b.created_at) - new Date(a.created_at)

export default function AdminCustomers() {
  const users = useAuthStore((s) => s.users)
  const orders = useOrderStore((s) => s.orders)
  const loadUsers = useAuthStore((s) => s.loadUsers)
  const loadOrders = useOrderStore((s) => s.loadAll)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    loadUsers()
    loadOrders()
  }, [loadUsers, loadOrders])

  // Mỗi khách kèm số đơn, chi tiêu (không tính đơn hủy) và đơn gần nhất
  const rows = useMemo(() => {
    const q = normalizeText(query)
    return users
      .filter((u) => u.role === 'customer')
      .filter((u) => !q || [u.full_name, u.email, u.phone ?? ''].some((v) => normalizeText(v).includes(q)))
      .map((u) => {
        const mine = orders.filter((o) => o.user_id === u.id).sort(sortByNewest)
        const spent = mine.filter((o) => o.status !== 'Đã hủy').reduce((sum, o) => sum + o.total_amount, 0)
        return { user: u, orderCount: mine.length, spent, lastOrder: mine[0]?.created_at ?? null }
      })
  }, [users, orders, query])

  const selected = users.find((u) => u.id === selectedId) ?? null
  const selectedOrders = selected ? orders.filter((o) => o.user_id === selected.id).sort(sortByNewest) : []

  return (
    <div className="space-y-5">
      <PageHeader title="Khách hàng" description={`${rows.length} khách hàng`} />

      <div className="relative md:w-80">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo tên, email, SĐT..."
          aria-label="Tìm khách hàng"
          className={`${inputClass()} pl-9`}
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-line bg-surface text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Khách hàng</th>
              <th className="px-4 py-3 font-semibold">Điện thoại</th>
              <th className="px-4 py-3 text-right font-semibold">Số đơn</th>
              <th className="px-4 py-3 text-right font-semibold">Chi tiêu</th>
              <th className="px-4 py-3 font-semibold">Đơn gần nhất</th>
              <th className="px-4 py-3 font-semibold">Tham gia</th>
              <th className="px-4 py-3 text-right font-semibold"><span className="sr-only">Thao tác</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map(({ user, orderCount, spent, lastOrder }) => (
              <tr key={user.id} className="hover:bg-surface/60">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{user.full_name}</p>
                  <p className="text-xs text-ink-muted">{user.email}</p>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-muted">{user.phone || '—'}</td>
                <td className="px-4 py-3 text-right">{formatNumber(orderCount)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-medium">{formatVND(spent)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-muted">{lastOrder ? formatDate(lastOrder) : '—'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-muted">{formatDate(user.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedId(user.id)}>Chi tiết</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="p-8">
            <EmptyState icon={Users} title="Không tìm thấy khách hàng" description="Thử từ khóa khác." />
          </div>
        )}
      </div>

      <Drawer open={Boolean(selected)} title={selected ? selected.full_name : ''} onClose={() => setSelectedId(null)}>
        {selected && (
          <div className="space-y-6 text-sm">
            <section className="space-y-1">
              <h3 className="font-semibold text-ink">Thông tin</h3>
              <p className="text-ink-muted">{selected.email}</p>
              <p className="text-ink-muted">{selected.phone || 'Chưa có số điện thoại'}</p>
              <p className="text-xs text-ink-muted">Tham gia {formatDateTime(selected.created_at)}</p>
            </section>

            <section>
              <h3 className="mb-2 font-semibold text-ink">Địa chỉ</h3>
              {selected.addresses?.length ? (
                <ul className="space-y-2">
                  {selected.addresses.map((a) => (
                    <li key={a.id} className="rounded-md border border-line p-3">
                      <p className="text-ink">
                        {a.recipient_name} · {a.phone}
                        {a.is_default && <span className="ml-2 text-xs font-semibold text-brand">Mặc định</span>}
                      </p>
                      <p className="text-xs text-ink-muted">{formatAddress(a)}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-ink-muted">Chưa có địa chỉ.</p>
              )}
            </section>

            <section>
              <h3 className="mb-2 font-semibold text-ink">Lịch sử đơn hàng ({selectedOrders.length})</h3>
              {selectedOrders.length ? (
                <ul className="divide-y divide-line rounded-md border border-line">
                  {selectedOrders.map((o) => (
                    <li key={o.id} className="flex items-center justify-between gap-3 p-3">
                      <div className="min-w-0">
                        <p className="font-medium text-ink">{o.order_code}</p>
                        <p className="text-xs text-ink-muted">{formatDateTime(o.created_at)}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-medium">{formatVND(o.total_amount)}</p>
                        <StatusBadge status={o.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-ink-muted">Khách chưa đặt đơn nào.</p>
              )}
            </section>
          </div>
        )}
      </Drawer>
    </div>
  )
}
