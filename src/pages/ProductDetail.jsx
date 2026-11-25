import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Eye, PackageX, ShoppingCart, Truck } from 'lucide-react'
import Button from '../components/common/Button.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import QuantityStepper from '../components/common/QuantityStepper.jsx'
import ProductGrid from '../components/product/ProductGrid.jsx'
import { useCartStore } from '../store/cartStore.js'
import { useCatalogStore } from '../store/catalogStore.js'
import { notify } from '../store/uiStore.js'
import { discountPercent, effectivePrice, formatNumber, formatVND } from '../utils/format.js'
import { trackEvent } from '../utils/analytics.js'

function DetailSkeleton() {
  return (
    <div className="grid animate-pulse gap-8 lg:grid-cols-2" aria-hidden="true">
      <div className="aspect-square rounded-lg bg-white" />
      <div className="space-y-4">
        <div className="h-7 w-3/4 rounded bg-white" />
        <div className="h-4 w-1/2 rounded bg-white" />
        <div className="h-24 rounded-lg bg-white" />
        <div className="h-10 w-1/2 rounded bg-white" />
      </div>
    </div>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [qty, setQty] = useState(1)

  const loading = useCatalogStore((s) => s.loading)
  const product = useCatalogStore((s) => s.products.find((p) => p.id === id))
  const products = useCatalogStore((s) => s.products)
  const categories = useCatalogStore((s) => s.categories)
  const incrementView = useCatalogStore((s) => s.incrementView)
  const addItem = useCartStore((s) => s.addItem)

  const productId = product?.id

  // Mỗi lần mở trang sản phẩm: tăng lượt xem và ghi sự kiện product_view
  useEffect(() => {
    if (!productId) return
    incrementView(productId)
    trackEvent('product_view', { product_id: productId })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  const related = useMemo(() => {
    if (!product) return []
    return products
      .filter((p) => p.is_active && p.id !== product.id && p.category_id === product.category_id)
      .slice(0, 5)
  }, [products, product])

  if (loading) {
    return <DetailSkeleton />
  }

  if (!product) {
    return (
      <EmptyState
        icon={PackageX}
        title="Sản phẩm không tồn tại"
        description="Sản phẩm này có thể đã bị gỡ khỏi cửa hàng."
        action={<Link to="/products" className="text-sm font-semibold text-brand hover:underline">Xem tất cả sản phẩm</Link>}
      />
    )
  }

  const category = categories.find((c) => c.id === product.category_id)
  const price = effectivePrice(product)
  const hasSale = price < product.price
  const percent = discountPercent(product)
  const inStock = product.stock > 0
  const maxQty = Math.max(1, product.stock)
  const lowStock = inStock && product.stock <= 5

  const handleAdd = () => {
    addItem(product.id, qty)
    trackEvent('add_to_cart', { product_id: product.id, quantity: qty })
    notify({
      title: 'Đã thêm vào giỏ hàng',
      description: `${product.name} × ${qty}`,
      action: { label: 'Xem giỏ hàng', to: '/cart' },
    })
  }

  const handleBuyNow = () => {
    addItem(product.id, qty)
    trackEvent('add_to_cart', { product_id: product.id, quantity: qty, source: 'buy_now' })
    navigate('/checkout')
  }

  const actionDisabled = !inStock

  return (
    <div className="pb-24 lg:pb-0">
      <nav aria-label="Đường dẫn" className="mb-4 flex flex-wrap items-center gap-1 text-xs text-ink-muted">
        <Link to="/" className="hover:text-brand">Trang chủ</Link>
        <span>/</span>
        {category && (
          <>
            <Link to={`/products?category=${category.slug}`} className="hover:text-brand">{category.name}</Link>
            <span>/</span>
          </>
        )}
        <span className="line-clamp-1 text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        <div className="overflow-hidden rounded-lg border border-line bg-white">
          <img src={product.image_url} alt={product.name} className="aspect-square w-full object-cover" />
        </div>

        <div className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <h1 className="text-xl font-bold leading-snug text-ink md:text-2xl">{product.name}</h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted md:text-sm">
            <span>Đã bán {formatNumber(product.sold_count)}</span>
            <span className="flex items-center gap-1">
              <Eye size={14} aria-hidden="true" /> {formatNumber(product.view_count)} lượt xem
            </span>
            {category && <span>Danh mục: {category.name}</span>}
          </div>

          <div className="rounded-lg bg-brand-soft p-4">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-2xl font-bold text-brand md:text-3xl">{formatVND(price)}</span>
              {hasSale && (
                <>
                  <span className="text-sm text-ink-muted line-through">{formatVND(product.price)}</span>
                  <span className="rounded-sm bg-brand px-2 py-0.5 text-xs font-semibold text-white">-{percent}%</span>
                </>
              )}
            </div>
          </div>

          <p className={`text-sm font-medium ${inStock ? (lowStock ? 'text-amber-700' : 'text-green-700') : 'text-red-600'}`}>
            {inStock ? (lowStock ? `Chỉ còn ${product.stock} sản phẩm` : `Còn ${formatNumber(product.stock)} sản phẩm`) : 'Hết hàng'}
          </p>

          {inStock && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-ink">Số lượng</span>
              <QuantityStepper value={Math.min(qty, maxQty)} max={maxQty} onChange={setQty} />
            </div>
          )}

          {/* Nút hành động (desktop) */}
          <div className="hidden gap-3 lg:flex">
            <Button variant="outline" size="lg" className="flex-1" onClick={handleAdd} disabled={actionDisabled}>
              <ShoppingCart size={18} /> Thêm vào giỏ hàng
            </Button>
            <Button size="lg" className="flex-1" onClick={handleBuyNow} disabled={actionDisabled}>
              Mua ngay
            </Button>
          </div>

          <ul className="space-y-2 rounded-lg border border-line bg-white p-4 text-sm text-ink-muted">
            <li className="flex items-center gap-2">
              <Truck size={16} className="text-brand" aria-hidden="true" /> Thanh toán khi nhận hàng (COD)
            </li>
          </ul>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-ink">Mô tả sản phẩm</h2>
            <p className="text-sm leading-relaxed text-ink-muted">{product.description}</p>
          </section>
        </div>
      </div>

      {/* Thanh đặt hàng cố định (mobile) */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-line bg-white p-3 shadow-lg lg:hidden">
        <Button variant="outline" size="lg" className="flex-1" onClick={handleAdd} disabled={actionDisabled}>
          Thêm vào giỏ
        </Button>
        <Button size="lg" className="flex-1" onClick={handleBuyNow} disabled={actionDisabled}>
          {inStock ? 'Mua ngay' : 'Hết hàng'}
        </Button>
      </div>

      {related.length > 0 && (
        <section className="mt-12 space-y-4">
          <h2 className="text-base font-semibold text-ink md:text-lg">Sản phẩm liên quan</h2>
          <ProductGrid products={related} loading={false} />
        </section>
      )}
    </div>
  )
}
