import { useMemo, useState } from 'react'
import { Package, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import Button from '../../components/common/Button.jsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import FormField, { inputClass } from '../../components/common/FormField.jsx'
import Modal from '../../components/common/Modal.jsx'
import PageHeader from '../../components/common/PageHeader.jsx'
import { useCatalogStore } from '../../store/catalogStore.js'
import { notify } from '../../store/uiStore.js'
import { effectivePrice, formatNumber, formatVND, normalizeText } from '../../utils/format.js'

const MAX_IMAGE_BYTES = 300 * 1024

const EMPTY_FORM = {
  name: '',
  category_id: '',
  description: '',
  price: '',
  sale_price: '',
  stock: '',
  is_active: true,
  featured: false,
  image_url: '',
}

const toForm = (p) => ({
  name: p.name,
  category_id: p.category_id,
  description: p.description ?? '',
  price: String(p.price),
  sale_price: p.sale_price ? String(p.sale_price) : '',
  stock: String(p.stock),
  is_active: p.is_active,
  featured: p.featured ?? false,
  image_url: p.image_url,
})

function validate(form) {
  const errors = {}
  if (form.name.trim().length < 3) errors.name = 'Tên sản phẩm cần ít nhất 3 ký tự.'
  if (!form.category_id) errors.category_id = 'Vui lòng chọn danh mục.'
  if (!form.description.trim()) errors.description = 'Vui lòng nhập mô tả ngắn.'

  const price = Number(form.price)
  if (!form.price || !Number.isInteger(price) || price <= 0) {
    errors.price = 'Giá gốc phải là số nguyên dương.'
  }
  if (form.sale_price !== '') {
    const sale = Number(form.sale_price)
    if (!Number.isInteger(sale) || sale <= 0) errors.sale_price = 'Giá khuyến mãi phải là số nguyên dương.'
    else if (!errors.price && sale >= price) errors.sale_price = 'Giá khuyến mãi phải thấp hơn giá gốc.'
  }

  const stock = Number(form.stock)
  if (form.stock === '' || !Number.isInteger(stock) || stock < 0) {
    errors.stock = 'Tồn kho phải là số nguyên từ 0 trở lên.'
  }
  if (!form.image_url) errors.image_url = 'Vui lòng chọn ảnh sản phẩm.'
  return errors
}

function ProductFormModal({ product, categories, onClose }) {
  const addProduct = useCatalogStore((s) => s.addProduct)
  const updateProduct = useCatalogStore((s) => s.updateProduct)
  const [form, setForm] = useState(() => (product ? toForm(product) : EMPTY_FORM))
  const [errors, setErrors] = useState({})

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((err) => ({ ...err, [field]: undefined }))
  }

  const setImageError = (message) => setErrors((err) => ({ ...err, image_url: message }))

  // Ảnh được đọc thành chuỗi base64 và lưu cùng sản phẩm trên trình duyệt
  const handleFile = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setImageError('Vui lòng chọn file ảnh (JPG, PNG hoặc WEBP).')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('Ảnh tối đa 300KB để lưu được trên trình duyệt.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setForm((f) => ({ ...f, image_url: reader.result }))
      setImageError(undefined)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length) return

    const payload = {
      name: form.name.trim(),
      category_id: form.category_id,
      description: form.description.trim(),
      price: Number(form.price),
      sale_price: form.sale_price === '' ? null : Number(form.sale_price),
      stock: Number(form.stock),
      is_active: form.is_active,
      featured: form.featured,
      image_url: form.image_url,
    }

    if (product) {
      updateProduct(product.id, payload)
      notify({ title: 'Đã cập nhật sản phẩm', description: payload.name })
    } else {
      addProduct(payload)
      notify({ title: 'Đã thêm sản phẩm', description: payload.name })
    }
    onClose()
  }

  return (
    <Modal
      open
      title={product ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSave}>{product ? 'Lưu thay đổi' : 'Thêm sản phẩm'}</Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Tên sản phẩm" htmlFor="p-name" required error={errors.name}>
          <input id="p-name" value={form.name} onChange={set('name')} className={inputClass(!!errors.name)} />
        </FormField>

        <FormField label="Danh mục" htmlFor="p-category" required error={errors.category_id}>
          <select id="p-category" value={form.category_id} onChange={set('category_id')} className={inputClass(!!errors.category_id)}>
            <option value="">-- Chọn danh mục --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Giá gốc (VND)" htmlFor="p-price" required error={errors.price}>
          <input id="p-price" type="number" min="1" inputMode="numeric" value={form.price} onChange={set('price')} className={inputClass(!!errors.price)} />
        </FormField>

        <FormField label="Giá khuyến mãi (VND)" htmlFor="p-sale" error={errors.sale_price} hint="Để trống nếu không khuyến mãi">
          <input id="p-sale" type="number" min="1" inputMode="numeric" value={form.sale_price} onChange={set('sale_price')} className={inputClass(!!errors.sale_price)} />
        </FormField>

        <FormField label="Tồn kho" htmlFor="p-stock" required error={errors.stock}>
          <input id="p-stock" type="number" min="0" inputMode="numeric" value={form.stock} onChange={set('stock')} className={inputClass(!!errors.stock)} />
        </FormField>

        <FormField label="Trạng thái bán" htmlFor="p-active">
          <label className="flex h-10 items-center gap-2 text-sm text-ink">
            <input id="p-active" type="checkbox" className="accent-brand" checked={form.is_active} onChange={set('is_active')} />
            Đang hiển thị và bán
          </label>
        </FormField>

        <FormField label="Ghim lên đầu" htmlFor="p-featured">
          <label className="flex h-10 items-center gap-2 text-sm text-ink">
            <input id="p-featured" type="checkbox" className="accent-brand" checked={form.featured} onChange={set('featured')} />
            Hiện đầu danh sách sản phẩm
          </label>
        </FormField>

        <div className="md:col-span-2">
          <FormField label="Mô tả" htmlFor="p-desc" required error={errors.description}>
            <textarea
              id="p-desc"
              rows={3}
              value={form.description}
              onChange={set('description')}
              className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand ${
                errors.description ? 'border-red-500' : 'border-line'
              }`}
            />
          </FormField>
        </div>

        <div className="md:col-span-2">
          <FormField label="Ảnh sản phẩm" htmlFor="p-image" required error={errors.image_url} hint="JPG, PNG hoặc WEBP, tối đa 300KB">
            <div className="flex flex-wrap items-center gap-4">
              {form.image_url ? (
                <img src={form.image_url} alt="Xem trước ảnh sản phẩm" className="size-20 rounded-md border border-line bg-surface object-cover" />
              ) : (
                <div className="flex size-20 items-center justify-center rounded-md border border-dashed border-line text-xs text-ink-muted">
                  Chưa có ảnh
                </div>
              )}
              <input
                id="p-image"
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand-soft file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand"
              />
            </div>
          </FormField>
        </div>
      </div>
    </Modal>
  )
}

export default function AdminProducts() {
  const products = useCatalogStore((s) => s.products)
  const categories = useCatalogStore((s) => s.categories)
  const updateProduct = useCatalogStore((s) => s.updateProduct)
  const deleteProduct = useCatalogStore((s) => s.deleteProduct)
  const [query, setQuery] = useState('')
  const [editor, setEditor] = useState(null) // null | { product: null } khi thêm mới | { product } khi sửa
  const [pendingDelete, setPendingDelete] = useState(null)

  const categoryName = (id) => categories.find((c) => c.id === id)?.name ?? '—'

  const list = useMemo(() => {
    const q = normalizeText(query)
    return [...products]
      .filter((p) => !q || normalizeText(p.name).includes(q))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [products, query])

  const activeCount = products.filter((p) => p.is_active).length

  const handleDelete = () => {
    deleteProduct(pendingDelete.id)
    notify({ title: 'Đã xóa sản phẩm', description: pendingDelete.name })
    setPendingDelete(null)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Quản lý sản phẩm"
        description={`${products.length} sản phẩm · ${activeCount} đang bán`}
        actions={
          <Button onClick={() => setEditor({ product: null })}>
            <Plus size={16} aria-hidden="true" /> Thêm sản phẩm
          </Button>
        }
      />

      <div className="relative md:w-80">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo tên sản phẩm..."
          aria-label="Tìm sản phẩm"
          className={`${inputClass()} pl-9`}
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-line bg-surface text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Ảnh</th>
              <th className="px-4 py-3 font-semibold">Sản phẩm</th>
              <th className="px-4 py-3 font-semibold">Danh mục</th>
              <th className="px-4 py-3 font-semibold">Giá bán</th>
              <th className="px-4 py-3 font-semibold">Tồn kho</th>
              <th className="px-4 py-3 font-semibold">Đã bán</th>
              <th className="px-4 py-3 font-semibold">Hiển thị</th>
              <th className="px-4 py-3 font-semibold">Ghim</th>
              <th className="px-4 py-3 text-right font-semibold"><span className="sr-only">Thao tác</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((p) => {
              const price = effectivePrice(p)
              const onSale = price < p.price
              return (
                <tr key={p.id} className="hover:bg-surface/60">
                  <td className="px-4 py-3">
                    <img src={p.image_url} alt="" className="size-12 rounded-md border border-line bg-surface object-cover" />
                  </td>
                  <td className="min-w-[200px] px-4 py-3">
                    <p className="font-medium text-ink">{p.name}</p>
                    <p className="text-xs text-ink-muted">/{p.slug}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-muted">{categoryName(p.category_id)}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <p className="font-medium text-ink">{formatVND(price)}</p>
                    {onSale && <p className="text-xs text-ink-muted line-through">{formatVND(p.price)}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-semibold ${
                        p.stock === 0 ? 'text-red-600' : p.stock <= 5 ? 'text-amber-700' : 'text-ink'
                      }`}
                    >
                      {formatNumber(p.stock)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{formatNumber(p.sold_count)}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={p.is_active}
                      aria-label={`Hiển thị ${p.name}`}
                      onClick={() => updateProduct(p.id, { is_active: !p.is_active })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        p.is_active ? 'bg-green-600' : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`inline-block size-5 transform rounded-full bg-white shadow transition-transform ${
                          p.is_active ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={Boolean(p.featured)}
                      aria-label={`Ghim ${p.name}`}
                      onClick={() => updateProduct(p.id, { featured: !p.featured })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        p.featured ? 'bg-brand' : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`inline-block size-5 transform rounded-full bg-white shadow transition-transform ${
                          p.featured ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setEditor({ product: p })}
                        aria-label={`Sửa ${p.name}`}
                        className="rounded-md p-2 text-ink-muted hover:bg-surface hover:text-ink"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(p)}
                        aria-label={`Xóa ${p.name}`}
                        className="rounded-md p-2 text-ink-muted hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {list.length === 0 && (
          <div className="p-8">
            <EmptyState icon={Package} title="Không có sản phẩm phù hợp" description="Thử từ khóa khác hoặc thêm sản phẩm mới." />
          </div>
        )}
      </div>

      {editor && (
        <ProductFormModal
          key={editor.product?.id ?? 'new'}
          product={editor.product}
          categories={categories}
          onClose={() => setEditor(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Xóa sản phẩm"
        message={pendingDelete ? `Xóa "${pendingDelete.name}" khỏi cửa hàng? Thao tác này không hoàn tác được.` : ''}
        confirmLabel="Xóa"
        danger
        onConfirm={handleDelete}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  )
}
