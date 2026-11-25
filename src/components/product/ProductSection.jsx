import { Link } from 'react-router-dom'
import ProductGrid from './ProductGrid.jsx'

export default function ProductSection({ title, linkTo = '/products', products, loading }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink md:text-lg">{title}</h2>
        <Link to={linkTo} className="text-sm font-medium text-brand hover:underline">
          Xem tất cả
        </Link>
      </div>
      <ProductGrid products={products} loading={loading} emptyTitle="Chưa có sản phẩm trong mục này" />
    </section>
  )
}
