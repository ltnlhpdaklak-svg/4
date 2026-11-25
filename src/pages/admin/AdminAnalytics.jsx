import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import ChartCard from '../../components/admin/ChartCard.jsx'
import StatCard from '../../components/admin/StatCard.jsx'
import PageHeader from '../../components/common/PageHeader.jsx'
import { useEventStore } from '../../store/eventStore.js'
import { useOrderStore } from '../../store/orderStore.js'
import { CHART } from '../../utils/chartColors.js'
import { formatNumber, formatVND, localDateKey } from '../../utils/format.js'

const RANGES = [7, 30, 90]

// Các bước của phễu chuyển đổi, khớp với tên sự kiện trong utils/analytics.js
const FUNNEL = [
  { event: 'page_view', label: 'Lượt xem trang' },
  { event: 'product_view', label: 'Xem sản phẩm' },
  { event: 'add_to_cart', label: 'Thêm vào giỏ' },
  { event: 'checkout_start', label: 'Bắt đầu thanh toán' },
  { event: 'order_placed', label: 'Đặt hàng thành công' },
]

const DEFINITIONS = [
  ['Lượt xem trang', 'Mỗi lần mở một trang trong website', 'Sự kiện page_view'],
  ['Xem sản phẩm', 'Mở trang chi tiết của một sản phẩm', 'Sự kiện product_view'],
  ['Thêm vào giỏ', 'Bấm "Thêm vào giỏ hàng" hoặc "Mua ngay"', 'Sự kiện add_to_cart'],
  ['Bắt đầu thanh toán', 'Bấm "Mua hàng" từ giỏ hàng', 'Sự kiện checkout_start'],
  ['Đặt hàng thành công', 'Tạo đơn hàng thành công', 'Sự kiện order_placed'],
  ['Tỷ lệ đặt hàng (xấp xỉ)', 'Số đơn thành công chia cho số lượt xem trang. Không phải tỷ lệ theo từng người dùng', 'Tính toán từ sự kiện'],
  ['Doanh thu trong kỳ', 'Tổng tiền các đơn không bị hủy trong khoảng thời gian đã chọn', 'Bảng đơn hàng'],
]

const axisTick = { fontSize: 11, fill: CHART.muted }
const dayLabel = (key) => `${key.slice(8, 10)}/${key.slice(5, 7)}`

export default function AdminAnalytics() {
  const [days, setDays] = useState(30)
  const events = useEventStore((s) => s.events)
  const loadEvents = useEventStore((s) => s.load)
  const orders = useOrderStore((s) => s.orders)
  const loadOrders = useOrderStore((s) => s.loadAll)

  useEffect(() => {
    loadEvents()
    loadOrders()
  }, [loadEvents, loadOrders])

  // Danh sách ngày trong khoảng đã chọn, tính theo giờ địa phương
  const dayKeys = useMemo(() => {
    const keys = []
    const today = new Date()
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      keys.push(localDateKey(d))
    }
    return keys
  }, [days])

  const since = useMemo(() => new Date(`${dayKeys[0]}T00:00:00`), [dayKeys])

  const inRange = useMemo(() => events.filter((e) => new Date(e.created_at) >= since), [events, since])

  const totals = useMemo(
    () => Object.fromEntries(FUNNEL.map((f) => [f.event, inRange.filter((e) => e.event_name === f.event).length])),
    [inRange]
  )

  const funnel = FUNNEL.map((f) => ({ label: f.label, value: totals[f.event] }))

  const ordersByDay = useMemo(() => {
    const map = Object.fromEntries(dayKeys.map((k) => [k, { label: dayLabel(k), orders: 0, revenue: 0 }]))
    orders.forEach((o) => {
      const key = localDateKey(new Date(o.created_at))
      if (!map[key]) return
      map[key].orders += 1
      if (o.status !== 'Đã hủy') map[key].revenue += o.total_amount
    })
    return dayKeys.map((k) => map[k])
  }, [dayKeys, orders])

  const revenueInRange = ordersByDay.reduce((sum, d) => sum + d.revenue, 0)
  const ordersInRange = ordersByDay.reduce((sum, d) => sum + d.orders, 0)

  // Top từ khóa tìm kiếm trong khoảng thời gian
  const keywords = useMemo(() => {
    const map = {}
    inRange.forEach((e) => {
      if (e.event_name !== 'search') return
      const k = String(e.metadata?.keyword ?? '').trim().toLowerCase()
      if (k) map[k] = (map[k] ?? 0) + 1
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [inRange])

  const conversion = totals.page_view ? (totals.order_placed / totals.page_view) * 100 : 0

  const traffic = useMemo(
    () =>
      dayKeys.map((key) => {
        const views = inRange.filter((e) => localDateKey(new Date(e.created_at)) === key).length
        const onDay = ordersByDay.find((d) => d.label === dayLabel(key))
        return { label: dayLabel(key), visits: views, orders: onDay?.orders ?? 0 }
      }),
    [dayKeys, inRange, ordersByDay]
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thống kê Marketing"
        description="Số liệu ghi nhận từ hoạt động trên website."
        actions={
          <div className="inline-flex rounded-md border border-line bg-white p-1">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setDays(r)}
                aria-pressed={days === r}
                className={`rounded px-3 py-1.5 text-xs font-medium transition-colors md:text-sm ${
                  days === r ? 'bg-ink text-white' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {r} ngày
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <StatCard label="Lượt xem trang" value={formatNumber(totals.page_view)} hint={`${days} ngày gần nhất`} />
        <StatCard label="Đơn đặt thành công" value={formatNumber(totals.order_placed)} hint="Ghi nhận từ sự kiện order_placed" />
        <StatCard
          label="Doanh thu trong kỳ"
          value={formatVND(revenueInRange)}
          hint={`${formatNumber(ordersInRange)} đơn, không tính đơn hủy`}
          tone="brand"
        />
        <StatCard label="Tỷ lệ đặt hàng (xấp xỉ)" value={`${conversion.toFixed(1)}%`} hint="Đơn thành công / lượt xem trang" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Phễu chuyển đổi" description="Số lượt theo từng bước">
          <BarChart data={funnel} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} horizontal={false} />
            <XAxis type="number" tick={axisTick} allowDecimals={false} />
            <YAxis type="category" dataKey="label" width={140} tick={{ fontSize: 11, fill: CHART.ink }} />
            <Tooltip formatter={(v) => formatNumber(v)} />
            <Bar dataKey="value" name="Số lượt" fill={CHART.brand} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Đơn hàng theo ngày" description="Dữ liệu thật từ bảng đơn hàng">
          <BarChart data={ordersByDay} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
            <XAxis dataKey="label" tick={axisTick} interval="preserveStartEnd" minTickGap={16} />
            <YAxis tick={axisTick} allowDecimals={false} width={32} />
            <Tooltip />
            <Bar dataKey="orders" name="Số đơn" fill={CHART.ink} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          title="Hoạt động trên website"
          description="Số sự kiện và đơn hàng theo ngày"
          className="lg:col-span-2"
        >
          <LineChart data={traffic} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
            <XAxis dataKey="label" tick={axisTick} interval="preserveStartEnd" minTickGap={16} />
            <YAxis tick={axisTick} width={44} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="visits" name="Sự kiện" stroke={CHART.brand} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="orders" name="Đơn hàng" stroke={CHART.ink} strokeWidth={2} dot={false} />
          </LineChart>
        </ChartCard>

        <section className="rounded-lg border border-line bg-white p-4 md:p-5">
          <h3 className="text-sm font-semibold text-ink">Từ khóa tìm kiếm nhiều nhất</h3>
          <p className="mt-0.5 text-xs text-ink-muted">Lấy từ ô tìm kiếm của khách hàng</p>
          {keywords.length ? (
            <ol className="mt-4 space-y-3 text-sm">
              {keywords.map(([kw, n], idx) => (
                <li key={kw} className="flex items-center justify-between gap-3">
                  <span className="truncate text-ink">
                    <span className="mr-2 text-ink-muted">{idx + 1}.</span>
                    {kw}
                  </span>
                  <span className="shrink-0 font-medium text-ink">{n} lần</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-6 text-sm text-ink-muted">
              Chưa có lượt tìm kiếm nào trong kỳ này. Thử tìm kiếm ở thanh đầu trang để có dữ liệu.
            </p>
          )}
        </section>
      </div>

      <section className="overflow-x-auto rounded-lg border border-line bg-white">
        <div className="border-b border-line px-4 py-3">
          <h3 className="text-sm font-semibold text-ink">Giải thích chỉ số</h3>
        </div>
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-surface text-xs text-ink-muted">
            <tr>
              <th className="px-4 py-2 font-semibold">Chỉ số</th>
              <th className="px-4 py-2 font-semibold">Ý nghĩa</th>
              <th className="px-4 py-2 font-semibold">Nguồn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {DEFINITIONS.map(([name, meaning, source]) => (
              <tr key={name}>
                <td className="px-4 py-2 font-medium text-ink">{name}</td>
                <td className="px-4 py-2 text-ink-muted">{meaning}</td>
                <td className="px-4 py-2 text-ink-muted">{source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
