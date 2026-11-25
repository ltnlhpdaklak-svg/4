import { useEffect, useState } from 'react'
import Button from '../common/Button.jsx'
import { inputClass } from '../common/FormField.jsx'

// Bộ lọc sản phẩm. Mọi lựa chọn được đưa lên URL (?category=...&min=...) để chia sẻ link được.
export default function ProductFilters({ filters, categories, onChange, onReset }) {
  const [minDraft, setMinDraft] = useState(filters.min)
  const [maxDraft, setMaxDraft] = useState(filters.max)

  useEffect(() => {
    setMinDraft(filters.min)
    setMaxDraft(filters.max)
  }, [filters.min, filters.max])

  return (
    <div className="space-y-6 text-sm">
      <section>
        <h3 className="mb-3 font-semibold text-ink">Danh mục</h3>
        <ul className="space-y-2">
          <li>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="category"
                className="accent-brand"
                checked={!filters.category}
                onChange={() => onChange({ category: '' })}
              />
              Tất cả
            </label>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="category"
                  className="accent-brand"
                  checked={filters.category === c.slug}
                  onChange={() => onChange({ category: c.slug })}
                />
                {c.name}
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-3 font-semibold text-ink">Khoảng giá (VND)</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="Từ"
            aria-label="Giá từ"
            value={minDraft}
            onChange={(e) => setMinDraft(e.target.value)}
            className={inputClass()}
          />
          <span className="text-ink-muted">–</span>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="Đến"
            aria-label="Giá đến"
            value={maxDraft}
            onChange={(e) => setMaxDraft(e.target.value)}
            className={inputClass()}
          />
        </div>
        <Button variant="ghost" size="sm" className="mt-3 w-full" onClick={() => onChange({ min: minDraft, max: maxDraft })}>
          Áp dụng giá
        </Button>
      </section>

      <section>
        <h3 className="mb-3 font-semibold text-ink">Tình trạng</h3>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            className="accent-brand"
            checked={filters.inStock}
            onChange={(e) => onChange({ inStock: e.target.checked })}
          />
          Chỉ hiện sản phẩm còn hàng
        </label>
      </section>

      <Button variant="ghost" size="sm" className="w-full" onClick={onReset}>
        Xóa bộ lọc
      </Button>
    </div>
  )
}
