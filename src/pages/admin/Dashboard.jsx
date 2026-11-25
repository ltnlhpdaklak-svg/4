import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts'
import ChartCard from '../../components/admin/ChartCard.jsx'
import StatCard from '../../components/admin/StatCard.jsx'
import PageHeader from '../../components/common/PageHeader.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import { useAuthStore } from '../../store/authStore.js'
import { useCatalogStore } from '../../store/catalogStore.js'
import { useOrderStore } from '../../store/orderStore.js'
import { CHART, STATUS_COLORS, shortenLabel } from '../../utils/chartColors.js'
import { ORDER_STATUSES } from '../../utils/constants.js'
import { formatDateTime, formatNumber, formatVND } from '../../utils/format.js'

const axisTick = { fontSize: 11, fill: CHART.muted }

export default function Dashboard() {
  const products = useCatalogStore((s) => s.products)
  const orders = useOrderStore((s) => s.orders)
  const users = useAuthStore((s) => s.users)
  const loadAllOrders = useOrderStore((s) => s.loadAll)
  const loadUsers = useAuthStore((s) => s.loadUsers)

  useEffect(() => {
    loadAllOrders()
    loadUsers()
  }, [loadAllOrders, loadUsers])

  const stats = useMemo(() => {
    const revenue = orders.filter((o) => o.status !== 'Đã hủy').reduce((sum, o) => sum + o.total_amount, 0)
    return {
      revenue,
      pending: orders.filter((o) => o.status === 'Chờ xác nhận').length,
      customers: users.filter((u) => u.role === 'customer').length,
      active: products.filter((p) => p.is_active).length,
      outOfStock: products.filter((p) => p.stock === 0).length,
    }
  }, [orders, users, products])

  const statusData = useMemo(
    () =>
      ORDER_STATUSES.map((name) => ({ name, value: orders.filter((o) => o.status === name).length })).filter(
        (d) => d.value > 0
      ),
    [orders]
  )

  const topProducts = useMemo(
    () =>
      [...products]
        .sort((a, b) => b.sold_count - a.sold_count)
        .slice(0, 5)
        .map((p) => ({ name: shortenLabel(p.name, 26), sold: p.sold_count })),
    [products]
  )

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5),
    [orders]
  )

  const traffic = useMemo(() => {
    const map = {}
    orders.forEach((o) => {
      const key = o.created_at?.slice(0, 10)
      if (!key) return
      map[key] = (map[key] ?? 0) + 1
    })
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, orders]) => ({ label: date.slice(5), visits: orders, productViews: orders }))
  }, [orders])

  return (
    <div className="space-y-6">
      <PageHeader title="Tổng quan" description="Số liệu cập nhật theo thời gian thực từ hệ thống." />

      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <StatCard label="Doanh thu (không tính đơn hủy)" value={formatVND(stats.revenue)} tone="brand" />
        <StatCard label="Đơn chờ xác nhận" value={formatNumber(stats.pending)} hint={`Trên tổng ${formatNumber(orders.length)} đơn`} />
        <StatCard label="Khách hàng" value={formatNumber(stats.customers)} hint={`Tổng ${formatNumber(users.length)} tài khoản`} />
        <StatCard
          label="Sản phẩm đang bán"
          value={formatNumber(stats.active)}
          hint={stats.outOfStock ? `${stats.outOfStock} sản phẩm đã hết hàng` : 'Tất cả còn hàng'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          title="Đơn hàng 30 ngày gần nhất"
          description="Số đơn phát sinh theo ngày."
          className="lg:col-span-2"
        >
          <LineChart data={traffic} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
            <XAxis dataKey="label" tick={axisTick} interval="preserveStartEnd" minTickGap={16} />
            <YAxis tick={axisTick} width={44} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="visits" name="Số đơn" stroke={CHART.brand} strokeWidth={2} dot={false} />
          </LineChart>
        </ChartCard>

        <ChartCard title="Trạng thái đơn hàng" description="Phân bổ theo trạng thái hiện tại">
          <PieChart>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Pie data={statusData} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={2}>
              {statusData.map((d) => (
                <Cell key={d.name} fill={STATUS_COLORS[d.name]} />
              ))}
            </Pie>
          </PieChart>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Top 5 sản phẩm bán chạy" description="Theo số lượng đã bán" className="lg:col-span-2">
          <BarChart data={topProducts} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} horizontal={false} />
            <XAxis type="number" tick={axisTick} allowDecimals={false} />
            <YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 11, fill: CHART.ink }} />
            <Tooltip />
            <Bar dataKey="sold" name="Đã bán" fill={CHART.brand} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartCard>

        <section className="rounded-lg border border-line bg-white p-4 md:p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-ink">Đơn hàng gần đây</h3>
            <Link to="/admin/orders" className="text-xs font-semibold text-brand hover:underline">Xem tất cả</Link>
          </div>
          <ul className="mt-4 divide-y divide-line">
            {recentOrders.map((o) => (
              <li key={o.id} className="py-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-ink">{o.order_code}</span>
                  <StatusBadge status={o.status} />
                </div>
                <div className="mt-1 flex items-center justify-between gap-2 text-xs text-ink-muted">
                  <span className="truncate">{o.recipient_name}</span>
                  <span className="shrink-0">{formatVND(o.total_amount)}</span>
                </div>
                <p className="mt-0.5 text-[11px] text-ink-muted">{formatDateTime(o.created_at)}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
