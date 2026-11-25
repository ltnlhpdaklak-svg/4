import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import PageHeader from '../components/common/PageHeader.jsx'
import Button from '../components/common/Button.jsx'
import Modal from '../components/common/Modal.jsx'
import Pagination from '../components/common/Pagination.jsx'
import ProductGrid from '../components/product/ProductGrid.jsx'
import ProductFilters from '../components/product/ProductFilters.jsx'
import { useCatalogStore } from '../store/catalogStore.js'
import { effectivePrice, formatNumber, normalizeText } from '../utils/format.js'
import { trackEvent } from '../utils/analytics.js'

const PAGE_SIZE = 20

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá thấp đến cao' },
  { value: 'price_desc', label: 'Giá cao đến thấp' },
  { value: 'best', label: 'Bán chạy' },
  { value: 'viewed', label: 'Xem nhiều' },
]

export default function Products() {
  const [params, setParams] = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(false)
  const products = useCatalogStore((s) => s.products)
  const categories = useCatalogStore((s) => s.categories)
  const loading = useCatalogStore((s) => s.loading)

  const filters = {
    q: params.get('q') ?? '',
    category: params.get('category') ?? '',
    sort: params.get('sort') ?? 'newest',
    min: params.get('min') ?? '',
    max: params.get('max') ?? '',
    inStock: params.get('inStock') === '1',
  }
  const page = Math.max(1, Number(params.get('page')) || 1)

  // Cập nhật URL. Đổi bộ lọc thì quay về trang 1.
  const updateParams = (patch) => {
    const next = new URLSearchParams(params)
    Object.entries(patch).forEach(([key, value]) => {
      if (value === '' || value === false || value == null) next.delete(key)
      else next.set(key, key === 'inStock' ? '1' : String(value))
    })
    if (!('page' in patch)) next.delete('page')
    setParams(next)
  }

  const category = categories.find((c) => c.slug === filters.category)
  const keyword = normalizeText(filters.q)

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.is_active)
    if (category) list = list.filter((p) => p.category_id === category.id)
    if (keyword) list = list.filter((p) => normalizeText(p.name).includes(keyword))
    const min = Number(filters.min)
    if (filters.min !== '' && !Number.isNaN(min)) list = list.filter((p) => effectivePrice(p) >= min)
    const max = Number(filters.max)
    if (filters.max !== '' && !Number.isNaN(max)) list = list.filter((p) => effectivePrice(p) <= max)
    if (filters.inStock) list = list.filter((p) => p.stock > 0)

    const pinFirst = (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))
    const sorted = [...list]
    switch (filters.sort) {
      case 'price_asc':
        sorted.sort((a, b) => pinFirst(a, b) || effectivePrice(a) - effectivePrice(b))
        break
      case 'price_desc':
        sorted.sort((a, b) => pinFirst(a, b) || effectivePrice(b) - effectivePrice(a))
        break
      case 'best':
        sorted.sort((a, b) => pinFirst(a, b) || b.sold_count - a.sold_count)
        break
      case 'viewed':
        sorted.sort((a, b) => pinFirst(a, b) || b.view_count - a.view_count)
        break
      default:
        sorted.sort((a, b) => pinFirst(a, b) || new Date(b.created_at) - new Date(a.created_at))
    }
    return sorted
  }, [products, category, keyword, filters.min, filters.max, filters.inStock, filters.sort])

  // Ghi nhận tìm kiếm khi người dùng dùng ô tìm kiếm của trang danh sách
  useEffect(() => {
    if (keyword) trackEvent('search', { keyword: filters.q.trim(), results: filtered.length })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const title = keyword ? `Kết quả cho “${filters.q.trim()}”` : category ? category.name : 'Tất cả sản phẩm'
  const resetFilters = () => setParams(new URLSearchParams())

  const filterPanel = (
    <ProductFilters
      filters={filters}
      categories={categories}
      onChange={updateParams}
      onReset={resetFilters}
    />
  )

  return (
    <div className="lg:grid lg:grid-cols-[240px_1fr] lg:items-start lg:gap-8">
      {/* Bộ lọc cố định bên trái (desktop) */}
      <aside className="hidden rounded-lg border border-line bg-white p-5 lg:sticky lg:top-28 lg:block">
        {filterPanel}
      </aside>

      <div className="min-w-0">
        <PageHeader
          title={title}
          description={loading ? undefined : `Hiển thị ${formatNumber(filtered.length)} sản phẩm`}
          actions={
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <Button variant="ghost" className="lg:hidden" onClick={() => setFilterOpen(true)}>
                <SlidersHorizontal size={16} /> Bộ lọc
              </Button>
              <label htmlFor="sort" className="sr-only">Sắp xếp</label>
              <select
                id="sort"
                value={filters.sort}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="h-10 flex-1 rounded-md border border-line bg-white px-3 text-sm text-ink outline-none focus:border-brand sm:flex-none"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          }
        />

        <ProductGrid
          products={pageItems}
          loading={loading}
          emptyTitle="Không tìm thấy sản phẩm phù hợp"
          emptyDescription="Thử từ khóa khác hoặc xóa bộ lọc để xem toàn bộ sản phẩm."
          emptyAction={<Button variant="ghost" onClick={resetFilters}>Xóa bộ lọc</Button>}
        />

        {!loading && (
          <Pagination
            page={safePage}
            totalPages={totalPages}
            onChange={(p) => {
              updateParams({ page: p })
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        )}
      </div>

      <Modal open={filterOpen} title="Bộ lọc" onClose={() => setFilterOpen(false)} size="sm"
        footer={<Button onClick={() => setFilterOpen(false)}>Xem {formatNumber(filtered.length)} kết quả</Button>}
      >
        {filterPanel}
      </Modal>
    </div>
  )
}
