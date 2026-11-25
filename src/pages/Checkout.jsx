import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogIn, ShoppingCart } from 'lucide-react'
import Button from '../components/common/Button.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import FormField, { inputClass } from '../components/common/FormField.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import { useAuthStore } from '../store/authStore.js'
import { useCartStore } from '../store/cartStore.js'
import { useCatalogStore } from '../store/catalogStore.js'
import { useOrderStore } from '../store/orderStore.js'
import { notify } from '../store/uiStore.js'
import { effectivePrice, formatAddress, formatVND } from '../utils/format.js'
import { PAYMENT_METHOD_LABEL } from '../utils/constants.js'
import { trackEvent } from '../utils/analytics.js'

const PHONE_RE = /^(0|\+84)[0-9]{9}$/

const EMPTY_FORM = {
  recipient_name: '',
  recipient_phone: '',
  province: '',
  district: '',
  ward: '',
  street_address: '',
  note: '',
}

function validate(form) {
  const errors = {}
  if (!form.recipient_name.trim()) errors.recipient_name = 'Vui lòng nhập họ và tên người nhận.'
  if (!PHONE_RE.test(form.recipient_phone.trim().replace(/\s+/g, ''))) {
    errors.recipient_phone = 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0).'
  }
  if (!form.province.trim()) errors.province = 'Vui lòng nhập tỉnh/thành phố.'
  if (!form.district.trim()) errors.district = 'Vui lòng nhập quận/huyện.'
  if (!form.ward.trim()) errors.ward = 'Vui lòng nhập phường/xã.'
  if (!form.street_address.trim()) errors.street_address = 'Vui lòng nhập địa chỉ cụ thể.'
  return errors
}

// Điền các trường giao hàng từ một địa chỉ đã lưu
const addressFields = (a) => ({
  recipient_name: a.recipient_name,
  recipient_phone: a.phone,
  province: a.province,
  district: a.district,
  ward: a.ward,
  street_address: a.street_address,
})

export default function Checkout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clear)
  const products = useCatalogStore((s) => s.products)
  const recordSale = useCatalogStore((s) => s.recordSale)
  const addOrder = useOrderStore((s) => s.addOrder)

  const defaultAddress = user?.addresses?.find((a) => a.is_default) ?? null
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    ...(defaultAddress
      ? addressFields(defaultAddress)
      : { recipient_name: user?.full_name ?? '', recipient_phone: user?.phone ?? '' }),
  }))
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState(
    () => user?.addresses?.find((a) => a.is_default)?.id ?? null
  )

  const lines = useMemo(
    () =>
      items
        .map((i) => {
          const product = products.find((p) => p.id === i.productId)
          return product ? { product, quantity: i.quantity } : null
        })
        .filter(Boolean),
    [items, products]
  )

  const totals = lines.reduce(
    (acc, l) => {
      const price = effectivePrice(l.product)
      acc.subtotal += l.product.price * l.quantity
      acc.total += price * l.quantity
      return acc
    },
    { subtotal: 0, total: 0 }
  )
  const discount = totals.subtotal - totals.total

  // Chưa đăng nhập: chỉ yêu cầu đăng nhập ở bước này
  if (!user) {
    return (
      <EmptyState
        icon={LogIn}
        title="Vui lòng đăng nhập để đặt hàng"
        description="Giỏ hàng của bạn vẫn được giữ lại sau khi đăng nhập."
        action={
          <Button onClick={() => navigate('/login', { state: { from: location.pathname } })}>
            Đăng nhập
          </Button>
        }
      />
    )
  }

  if (!lines.length) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Giỏ hàng đang trống"
        description="Hãy chọn sản phẩm trước khi thanh toán."
        action={<Link to="/products" className="text-sm font-semibold text-brand hover:underline">Xem sản phẩm</Link>}
      />
    )
  }

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors((err) => ({ ...err, [field]: undefined }))
  }

  const pickAddress = (addr) => {
    setSelectedAddressId(addr.id)
    setForm((f) => ({
      ...f,
      recipient_name: addr.recipient_name,
      recipient_phone: addr.phone,
      province: addr.province,
      district: addr.district,
      ward: addr.ward,
      street_address: addr.street_address,
    }))
    setErrors({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length) return

    // Kiểm tra tồn kho lần cuối trước khi tạo đơn
    const shortage = lines.filter((l) => l.product.stock <= 0 || l.quantity > l.product.stock)
    if (shortage.length) {
      notify({
        type: 'error',
        title: 'Không đủ hàng',
        description: `Vui lòng cập nhật lại giỏ hàng: ${shortage.map((l) => l.product.name).join(', ')}.`,
        action: { label: 'Mở giỏ hàng', to: '/cart' },
      })
      return
    }

    setSubmitting(true)
    {
      const code = `4EW-${Date.now().toString().slice(-6)}`
      const now = new Date().toISOString()
      const orderItems = lines.map((l) => {
        const unit = effectivePrice(l.product)
        return {
          product_id: l.product.id,
          product_name: l.product.name,
          product_image: l.product.image_url,
          list_price: l.product.price,
          unit_price: unit,
          quantity: l.quantity,
          subtotal: unit * l.quantity,
        }
      })

      const order = {
        id: `o-${code}`,
        order_code: code,
        user_id: user.id,
        customer_name: user.full_name,
        customer_email: user.email,
        customer_phone: user.phone,
        recipient_name: form.recipient_name.trim(),
        recipient_phone: form.recipient_phone.trim(),
        shipping_address: formatAddress(form),
        items: orderItems,
        subtotal: totals.subtotal,
        discount,
        total_amount: totals.total,
        payment_method: 'COD',
        payment_status: 'Chưa thanh toán',
        status: 'Chờ xác nhận',
        stock_reserved: true,
        note: form.note.trim(),
        created_at: now,
        updated_at: now,
      }

      const result = await addOrder(order)
      setSubmitting(false)
      if (result.error) {
        notify({ type: 'error', title: 'Không đặt được hàng', description: result.error })
        return
      }
      await recordSale(orderItems.map((i) => ({ product_id: i.product_id, quantity: i.quantity })))
      clearCart()
      trackEvent('order_placed', { order_id: order.id, total_amount: order.total_amount, items: orderItems.length })
      navigate(`/order-success/${code}`)
    }
  }

  return (
    <div className="pb-32 lg:pb-0">
      <PageHeader title="Thanh toán" description="Kiểm tra thông tin giao hàng trước khi đặt hàng." />

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <form id="checkout-form" onSubmit={handleSubmit} noValidate className="space-y-6 lg:col-span-2">
          {user.addresses?.length > 0 && (
            <section className="space-y-3 rounded-lg border border-line bg-white p-4 md:p-5">
              <h2 className="text-sm font-semibold text-ink">Địa chỉ đã lưu</h2>
              <div className="grid gap-2 md:grid-cols-2">
                {user.addresses.map((a) => (
                  <label
                    key={a.id}
                    className={`flex cursor-pointer gap-3 rounded-md border p-3 text-sm transition-colors ${
                      selectedAddressId === a.id ? 'border-brand bg-brand-soft' : 'border-line hover:bg-surface'
                    }`}
                  >
                    <input
                      type="radio"
                      name="saved-address"
                      className="mt-1 accent-brand"
                      checked={selectedAddressId === a.id}
                      onChange={() => pickAddress(a)}
                    />
                    <span className="min-w-0">
                      <span className="block font-medium text-ink">{a.recipient_name} · {a.phone}</span>
                      <span className="block truncate text-xs text-ink-muted">{formatAddress(a)}</span>
                    </span>
                  </label>
                ))}
              </div>
            </section>
          )}

          <section className="space-y-4 rounded-lg border border-line bg-white p-4 md:p-5">
            <h2 className="text-sm font-semibold text-ink">1. Thông tin người nhận</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Họ và tên" htmlFor="recipient_name" required error={errors.recipient_name}>
                <input id="recipient_name" value={form.recipient_name} onChange={update('recipient_name')} className={inputClass(!!errors.recipient_name)} autoComplete="name" />
              </FormField>
              <FormField label="Số điện thoại" htmlFor="recipient_phone" required error={errors.recipient_phone}>
                <input id="recipient_phone" inputMode="tel" value={form.recipient_phone} onChange={update('recipient_phone')} className={inputClass(!!errors.recipient_phone)} autoComplete="tel" />
              </FormField>
            </div>
          </section>

          <section className="space-y-4 rounded-lg border border-line bg-white p-4 md:p-5">
            <h2 className="text-sm font-semibold text-ink">2. Địa chỉ giao hàng</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <FormField label="Tỉnh/thành phố" htmlFor="province" required error={errors.province}>
                <input id="province" value={form.province} onChange={update('province')} className={inputClass(!!errors.province)} />
              </FormField>
              <FormField label="Quận/huyện" htmlFor="district" required error={errors.district}>
                <input id="district" value={form.district} onChange={update('district')} className={inputClass(!!errors.district)} />
              </FormField>
              <FormField label="Phường/xã" htmlFor="ward" required error={errors.ward}>
                <input id="ward" value={form.ward} onChange={update('ward')} className={inputClass(!!errors.ward)} />
              </FormField>
            </div>
            <FormField label="Địa chỉ cụ thể" htmlFor="street_address" required error={errors.street_address} hint="Số nhà, tên đường, tòa nhà">
              <input id="street_address" value={form.street_address} onChange={update('street_address')} className={inputClass(!!errors.street_address)} />
            </FormField>
          </section>

          <section className="space-y-4 rounded-lg border border-line bg-white p-4 md:p-5">
            <h2 className="text-sm font-semibold text-ink">3. Ghi chú đơn hàng (tùy chọn)</h2>
            <textarea
              id="note"
              rows={3}
              value={form.note}
              onChange={update('note')}
              placeholder="Ví dụ: giao giờ hành chính, gọi trước khi giao"
              className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </section>

          <section className="space-y-3 rounded-lg border border-line bg-white p-4 md:p-5">
            <h2 className="text-sm font-semibold text-ink">4. Phương thức thanh toán</h2>
            <label className="flex cursor-pointer items-center gap-3 rounded-md border border-brand bg-brand-soft p-3 text-sm">
              <input type="radio" name="payment" checked readOnly className="accent-brand" />
              <span className="font-medium text-ink">{PAYMENT_METHOD_LABEL}</span>
            </label>
            <p className="text-xs text-ink-muted">Thanh toán trực tiếp cho nhóm 4 khi nhận kính.</p>
          </section>
        </form>

        {/* Tóm tắt đơn hàng */}
        <aside className="hidden h-fit space-y-4 rounded-lg border border-line bg-white p-5 lg:sticky lg:top-28 lg:block">
          <h2 className="text-base font-semibold text-ink">Đơn hàng của bạn</h2>
          <ul className="max-h-72 space-y-3 overflow-y-auto">
            {lines.map(({ product, quantity }) => (
              <li key={product.id} className="flex gap-3 text-sm">
                <img src={product.image_url} alt="" className="size-12 rounded-md bg-surface object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-ink">{product.name}</p>
                  <p className="text-xs text-ink-muted">{quantity} × {formatVND(effectivePrice(product))}</p>
                </div>
              </li>
            ))}
          </ul>
          <dl className="space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-ink-muted">Tạm tính</dt><dd>{formatVND(totals.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-muted">Khuyến mãi</dt><dd className="text-green-700">-{formatVND(discount)}</dd></div>
            <div className="flex justify-between border-t border-line pt-3"><dt className="font-semibold">Tổng thanh toán</dt><dd className="text-xl font-bold text-brand">{formatVND(totals.total)}</dd></div>
          </dl>
          <Button type="submit" form="checkout-form" size="lg" className="w-full" disabled={submitting}>
            {submitting ? 'Đang xử lý...' : 'Đặt hàng'}
          </Button>
        </aside>
      </div>

      {/* Thanh đặt hàng cố định (mobile) */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-line bg-white p-3 shadow-lg lg:hidden">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-ink-muted">{lines.length} sản phẩm</p>
          <p className="truncate text-base font-bold text-brand">{formatVND(totals.total)}</p>
        </div>
        <Button type="submit" form="checkout-form" size="lg" disabled={submitting}>
          {submitting ? 'Đang xử lý...' : 'Đặt hàng'}
        </Button>
      </div>
    </div>
  )
}
