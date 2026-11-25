import { useState } from 'react'
import { Baby, Dumbbell, Eye, Glasses, Pencil, Plus, Sparkles, Sun, Trash2 } from 'lucide-react'
import Button from '../../components/common/Button.jsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import FormField, { inputClass } from '../../components/common/FormField.jsx'
import Modal from '../../components/common/Modal.jsx'
import PageHeader from '../../components/common/PageHeader.jsx'
import { useCatalogStore } from '../../store/catalogStore.js'
import { notify } from '../../store/uiStore.js'
import { normalizeText } from '../../utils/format.js'

const ICONS = { Sun, Eye, Glasses, Dumbbell, Baby, Sparkles }

const ICON_OPTIONS = [
  { value: 'Sun', label: 'Mặt trời (kính râm)' },
  { value: 'Eye', label: 'Mắt (kính cận)' },
  { value: 'Glasses', label: 'Kính (gọng kính)' },
  { value: 'Dumbbell', label: 'Thể thao' },
  { value: 'Baby', label: 'Trẻ em' },
  { value: 'Sparkles', label: 'Phụ kiện' },
]

const EMPTY = { name: '', description: '', icon: 'Glasses' }

function CategoryFormModal({ category, onClose }) {
  const categories = useCatalogStore((s) => s.categories)
  const addCategory = useCatalogStore((s) => s.addCategory)
  const updateCategory = useCatalogStore((s) => s.updateCategory)
  const [form, setForm] = useState(() =>
    category ? { name: category.name, description: category.description ?? '', icon: category.icon ?? 'Glasses' } : EMPTY
  )
  const [error, setError] = useState('')

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    if (error) setError('')
  }

  const handleSave = () => {
    const name = form.name.trim()
    if (name.length < 2) {
      setError('Tên danh mục cần ít nhất 2 ký tự.')
      return
    }
    const duplicate = categories.some(
      (c) => c.id !== category?.id && normalizeText(c.name) === normalizeText(name)
    )
    if (duplicate) {
      setError('Tên danh mục này đã tồn tại.')
      return
    }

    const payload = { name, description: form.description.trim(), icon: form.icon }
    if (category) {
      updateCategory(category.id, payload)
      notify({ title: 'Đã cập nhật danh mục', description: name })
    } else {
      addCategory(payload)
      notify({ title: 'Đã thêm danh mục', description: name })
    }
    onClose()
  }

  return (
    <Modal
      open
      title={category ? 'Sửa danh mục' : 'Thêm danh mục'}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSave}>{category ? 'Lưu thay đổi' : 'Thêm danh mục'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField label="Tên danh mục" htmlFor="c-name" required error={error}>
          <input id="c-name" value={form.name} onChange={update('name')} className={inputClass(!!error)} />
        </FormField>
        <FormField label="Mô tả ngắn" htmlFor="c-desc">
          <textarea
            id="c-desc"
            rows={3}
            value={form.description}
            onChange={update('description')}
            className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand"
          />
        </FormField>
        <FormField label="Biểu tượng" htmlFor="c-icon">
          <select id="c-icon" value={form.icon} onChange={update('icon')} className={inputClass()}>
            {ICON_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </FormField>
      </div>
    </Modal>
  )
}

export default function AdminCategories() {
  const categories = useCatalogStore((s) => s.categories)
  const products = useCatalogStore((s) => s.products)
  const deleteCategory = useCatalogStore((s) => s.deleteCategory)
  const [editor, setEditor] = useState(null) // null | { category: null } khi thêm | { category } khi sửa
  const [pendingDelete, setPendingDelete] = useState(null)

  const countOf = (id) => products.filter((p) => p.category_id === id).length

  const handleDelete = () => {
    const ok = deleteCategory(pendingDelete.id)
    if (ok) {
      notify({ title: 'Đã xóa danh mục', description: pendingDelete.name })
    } else {
      notify({
        type: 'error',
        title: 'Không thể xóa danh mục',
        description: 'Danh mục đang có sản phẩm. Hãy chuyển sản phẩm sang danh mục khác trước.',
      })
    }
    setPendingDelete(null)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Danh mục"
        description={`${categories.length} danh mục`}
        actions={
          <Button onClick={() => setEditor({ category: null })}>
            <Plus size={16} aria-hidden="true" /> Thêm danh mục
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((c) => {
          const Icon = ICONS[c.icon] ?? Glasses
          const count = countOf(c.id)
          return (
            <article key={c.id} className="flex flex-col gap-3 rounded-lg border border-line bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-11 items-center justify-center rounded-full bg-brand-soft text-brand">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setEditor({ category: c })}
                    aria-label={`Sửa ${c.name}`}
                    className="rounded-md p-2 text-ink-muted hover:bg-surface hover:text-ink"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={count > 0}
                    onClick={() => setPendingDelete(c)}
                    aria-label={`Xóa ${c.name}`}
                    title={count > 0 ? 'Đang có sản phẩm, không thể xóa' : 'Xóa danh mục'}
                    className="rounded-md p-2 text-ink-muted hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink-muted"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-ink">{c.name}</h3>
                <p className="text-xs text-ink-muted">/{c.slug}</p>
              </div>
              <p className="flex-1 text-sm text-ink-muted">{c.description || 'Chưa có mô tả.'}</p>
              <p className="text-xs font-medium text-ink">{count} sản phẩm</p>
            </article>
          )
        })}
      </div>

      {editor && (
        <CategoryFormModal
          key={editor.category?.id ?? 'new'}
          category={editor.category}
          onClose={() => setEditor(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Xóa danh mục"
        message={pendingDelete ? `Xóa danh mục "${pendingDelete.name}"?` : ''}
        confirmLabel="Xóa"
        danger
        onConfirm={handleDelete}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  )
}
