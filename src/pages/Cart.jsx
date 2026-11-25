import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Trash2, AlertTriangle } from 'lucide-react'
import Button from '../components/common/Button.jsx'
import ConfirmDialog from '../components/common/ConfirmDialog.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import QuantityStepper from '../components/common/QuantityStepper.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import { useCartStore } from '../store/cartStore.js'
import { useCatalogStore } from '../store/catalogStore.js'
import { effectivePrice, formatVND } from '../utils/format.js'
import { trackEvent } from '../utils/analytics.js'

export default function Cart() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const products = useCatalogStore((s) => s.products)
  const [pendingRemove, setPendingRemove] = useState(null)

  // Ghép giỏ hàng với sản phẩm thật để lấy giá và tồn kho hiện tại
  const lines = useMemo(
    () =>
      items
        .map((i) => {
          const product = products.find((p) => p.id === i.productId)
          return product ? { productId: i.productId, quantity: i.quantity, product } : null
        })
        .filter(Boolean),
    [items, products]
  )

  // Tự điều chỉnh số lượng khi vượt tồn kho
  const [adjusted, setAdjusted] = useState([])
  useEffect(() => {
    const changed = []
    lines.forEach((l) => {
      if (l.product.stock > 0 && l.quantity > l.product.stock) {
        setQuantity(l.productId, l.product.stock)
        changed.push(l.product.name)
      }
    })
    if (changed.length) setAdjusted(changed)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines])

  const outOfStock = lines.filter((l) => l.product.stock <= 0)
  const blocked = outOfStock.length > 0

  const totals = lines.reduce(
    (acc, l) => {
      const price = effectivePrice(l.product)
      acc.subtotal += l.product.price * l.quantity
      acc.discount += (l.product.price - price) * l.quantity
      acc.total += price * l.quantity
      return acc
    },
    { subtotal: 0, discount: 0, total: 0 }
  )

  const handleCheckout = () => {
    trackEvent('checkout_start', { items: lines.length, total: totals.total })
    navigate('/checkout')
  }

  if (!lines.length) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Giỏ hàng đang trống"
        description="Hãy chọn những mẫu kính bạn yêu thích."
        action={<Button onClick={() => navigate('/products')}>Khám phá sản phẩm</Button>}
      />
    )
  }

  return (
    <div className="pb-28 lg:pb-0">
      <PageHeader title="Giỏ hàng" description={`${lines.length} sản phẩm trong giỏ`} />

      {adjusted.length > 0 && (
        <div role="status" className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>Chỉ còn đủ hàng cho một số sản phẩm, đã điều chỉnh số lượng: {adjusted.join(', ')}.</span>
        </div>
      )}
      {blocked && (
        <div role="alert" className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>Có sản phẩm đã hết hàng. Vui lòng xóa khỏi giỏ trước khi mua hàng.</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <ul className="divide-y divide-line rounded-lg border border-line bg-white px-4 lg:col-span-2 lg:px-5">
          {lines.map(({ product, quantity }) => {
            const price = effectivePrice(product)
            const hasSale = price < product.price
            const soldOut = product.stock <= 0
            return (
              <li key={product.id} className="flex gap-3 py-4">
                <Link to={`/products/${product.id}`} className="shrink-0">
                  <img src={product.image_url} alt={product.name} className="size-20 rounded-md bg-surface object-cover md:size-24" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <Link to={`/products/${product.id}`} className="line-clamp-2 text-sm font-medium text-ink hover:text-brand">
                      {product.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPendingRemove(product)}
                      aria-label={`Xóa ${product.name} khỏi giỏ`}
                      className="rounded p-1 text-ink-muted transition-colors hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-baseline gap-2 text-sm">
                      <span className="font-semibold text-brand">{formatVND(price)}</span>
                      {hasSale && <span className="text-xs text-ink-muted line-through">{formatVND(product.price)}</span>}
                    </div>
                    {!soldOut && (
                      <QuantityStepper
                        value={Math.min(quantity, product.stock)}
                        max={Math.max(1, product.stock)}
                        onChange={(v) => setQuantity(product.id, v)}
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    {soldOut ? (
                      <span className="font-medium text-red-600">Sản phẩm đã hết hàng</span>
                    ) : (
                      <span className="text-ink-muted">Còn {product.stock} sản phẩm</span>
                    )}
                    <span className="text-ink-muted">
                      Thành tiền: <span className="font-semibold text-ink">{formatVND(price * quantity)}</span>
                    </span>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        {/* Tóm tắt (desktop) */}
        <aside className="hidden h-fit rounded-lg border border-line bg-white p-5 lg:sticky lg:top-28 lg:block">
          <h2 className="text-base font-semibold text-ink">Tóm tắt đơn hàng</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-ink-muted">Tạm tính</dt><dd>{formatVND(totals.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-muted">Khuyến mãi</dt><dd className="text-green-700">-{formatVND(totals.discount)}</dd></div>
            <div className="flex items-center justify-between border-t border-line pt-3">
              <dt className="font-semibold text-ink">Tổng thanh toán</dt>
              <dd className="text-xl font-bold text-brand">{formatVND(totals.total)}</dd>
            </div>
          </dl>
          <Button size="lg" className="mt-5 w-full" onClick={handleCheckout} disabled={blocked}>Mua hàng</Button>
          <Link to="/products" className="mt-3 block text-center text-sm font-medium text-ink hover:text-brand">
            Tiếp tục mua sắm
          </Link>
        </aside>
      </div>

      {/* Thanh mua hàng cố định (mobile) */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-line bg-white p-3 shadow-lg lg:hidden">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-ink-muted">Tổng thanh toán</p>
          <p className="truncate text-base font-bold text-brand">{formatVND(totals.total)}</p>
        </div>
        <Button size="lg" onClick={handleCheckout} disabled={blocked}>Mua hàng</Button>
      </div>

      <ConfirmDialog
        open={Boolean(pendingRemove)}
        title="Xóa sản phẩm"
        message={pendingRemove ? `Bạn muốn xóa "${pendingRemove.name}" khỏi giỏ hàng?` : ''}
        confirmLabel="Xóa"
        danger
        onClose={() => setPendingRemove(null)}
        onConfirm={() => {
          removeItem(pendingRemove.id)
          setPendingRemove(null)
        }}
      />
    </div>
  )
}
