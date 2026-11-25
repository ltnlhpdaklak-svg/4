import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Baby, Dumbbell, Eye, Glasses, Sparkles, Sun } from 'lucide-react'
import Button from '../components/common/Button.jsx'
import ProductGrid from '../components/product/ProductGrid.jsx'
import ProductSection from '../components/product/ProductSection.jsx'
import { useCatalogStore } from '../store/catalogStore.js'
import { effectivePrice } from '../utils/format.js'

const ICONS = { Sun, Eye, Glasses, Dumbbell, Baby, Sparkles }

function Banner() {
  const navigate = useNavigate()
  return (
    <section className="relative overflow-hidden rounded-lg bg-brand-soft">
      <div className="grid aspect-[16/10] grid-cols-1 sm:aspect-[16/8] md:aspect-[16/6] md:grid-cols-2">
        <div className="flex flex-col justify-center gap-3 p-6 md:p-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand">4EYEWEAR · Nhóm 4</span>
          <h1 className="text-2xl font-extrabold leading-tight text-ink md:text-4xl">Kính mắt cho cả lớp.</h1>
          <p className="max-w-md text-sm text-ink-muted md:text-base">
            Kính râm, kính cận và gọng kính cho mọi phong cách. Chọn mẫu ưng ý rồi đặt hàng với nhóm 4.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button size="lg" onClick={() => navigate('/products')}>Khám phá ngay</Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/contact')}>Liên hệ nhóm 4</Button>
          </div>
        </div>
        <div className="relative hidden md:block">
          <img src="/products/p1.svg" alt="Kính râm Aviator gọng vàng" className="absolute inset-0 h-full w-full object-cover" />
        </div>
      </div>
    </section>
  )
}

function CategoryGrid({ categories }) {
  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold text-ink md:text-lg">Danh mục mắt kính</h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {categories.map((c) => {
          const Icon = ICONS[c.icon] ?? Glasses
          return (
            <Link
              key={c.id}
              to={`/products?category=${c.slug}`}
              className="group flex flex-col items-center gap-2 rounded-lg border border-line bg-white p-3 text-center transition-colors hover:border-brand hover:text-brand"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-surface text-ink transition-colors group-hover:bg-brand-soft group-hover:text-brand">
                <Icon size={22} aria-hidden="true" />
              </span>
              <span className="text-xs font-medium leading-tight md:text-sm">{c.name}</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default function Home() {
  const allProducts = useCatalogStore((s) => s.products)
  const categories = useCatalogStore((s) => s.categories)
  const loading = useCatalogStore((s) => s.loading)

  const active = useMemo(() => allProducts.filter((p) => p.is_active), [allProducts])

  const featured = useMemo(
    () => [...active].sort((a, b) => b.sold_count + b.view_count - (a.sold_count + a.view_count)).slice(0, 6),
    [active]
  )
  const newest = useMemo(
    () => [...active].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6),
    [active]
  )
  const bestSellers = useMemo(() => [...active].sort((a, b) => b.sold_count - a.sold_count).slice(0, 6), [active])
  const mostViewed = useMemo(() => [...active].sort((a, b) => b.view_count - a.view_count).slice(0, 6), [active])
  const deals = useMemo(() => active.filter((p) => effectivePrice(p) < p.price).slice(0, 4), [active])

  return (
    <div className="space-y-10 md:space-y-12">
      <Banner />
      <CategoryGrid categories={categories} />

      <section className="space-y-4 rounded-lg bg-brand-soft p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink md:text-lg">Ưu đãi hôm nay</h2>
          <Link to="/products" className="text-sm font-medium text-brand hover:underline">Xem tất cả</Link>
        </div>
        <ProductGrid products={deals} loading={loading} skeletonCount={4} emptyTitle="Chưa có ưu đãi nào" />
      </section>

      <ProductSection title="Sản phẩm nổi bật" products={featured} loading={loading} />
      <ProductSection title="Sản phẩm mới" linkTo="/products?sort=newest" products={newest} loading={loading} />
      <ProductSection title="Sản phẩm bán chạy" linkTo="/products?sort=best" products={bestSellers} loading={loading} />
      <ProductSection title="Sản phẩm được xem nhiều" linkTo="/products?sort=viewed" products={mostViewed} loading={loading} />
    </div>
  )
}
