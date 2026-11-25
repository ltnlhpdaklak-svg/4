import { Link } from 'react-router-dom'
import { discountPercent, effectivePrice, formatNumber, formatVND } from '../../utils/format.js'

export default function ProductCard({ product }) {
  const price = effectivePrice(product)
  const hasSale = price < product.price
  const percent = discountPercent(product)
  const outOfStock = product.stock <= 0

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block overflow-hidden rounded-lg border border-line bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square bg-surface">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        {hasSale && (
          <span className="absolute left-2 top-2 rounded-sm bg-brand px-2 py-0.5 text-xs font-semibold text-white">
            -{percent}%
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-semibold text-ink-muted">
            Hết hàng
          </span>
        )}
      </div>

      <div className="p-2.5 md:p-3">
        <h3 className="line-clamp-2 min-h-10 text-[13px] leading-5 text-ink md:text-sm">{product.name}</h3>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-[15px] font-semibold text-brand md:text-base">{formatVND(price)}</span>
          {hasSale && <span className="text-xs text-ink-muted line-through">{formatVND(product.price)}</span>}
        </div>
        <p className="mt-1 text-xs text-ink-muted">Đã bán {formatNumber(product.sold_count)}</p>
      </div>
    </Link>
  )
}
