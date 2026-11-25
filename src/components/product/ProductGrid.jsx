import { PackageOpen } from 'lucide-react'
import ProductCard from '../common/ProductCard.jsx'
import ProductCardSkeleton from '../common/ProductCardSkeleton.jsx'
import EmptyState from '../common/EmptyState.jsx'

export const GRID_CLASS = 'grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5'

export default function ProductGrid({
  products,
  loading,
  skeletonCount = 8,
  emptyTitle = 'Chưa có sản phẩm',
  emptyDescription,
  emptyAction,
}) {
  if (loading) {
    return (
      <div className={GRID_CLASS}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!products.length) {
    return (
      <EmptyState
        icon={PackageOpen}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    )
  }

  return (
    <div className={GRID_CLASS}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
