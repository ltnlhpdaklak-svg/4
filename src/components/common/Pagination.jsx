import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const navBtn =
    'flex h-9 items-center gap-1 rounded-md border border-line bg-white px-3 text-sm text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Phân trang">
      <button type="button" className={navBtn} disabled={page === 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft size={16} /> Trước
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
          className={`h-9 min-w-9 rounded-md px-3 text-sm font-medium transition-colors ${
            p === page ? 'bg-brand text-white' : 'border border-line bg-white text-ink hover:bg-surface'
          }`}
        >
          {p}
        </button>
      ))}
      <button type="button" className={navBtn} disabled={page === totalPages} onClick={() => onChange(page + 1)}>
        Sau <ChevronRight size={16} />
      </button>
    </nav>
  )
}
