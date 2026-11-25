import { ResponsiveContainer } from 'recharts'

// Khung biểu đồ: ResponsiveContainer cần cha có chiều cao cố định, nên khung có h-64 (md:h-72)
export default function ChartCard({ title, description, children, className = '' }) {
  return (
    <div className={`rounded-lg border border-line bg-white p-4 md:p-5 ${className}`}>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {description && <p className="mt-0.5 text-xs text-ink-muted">{description}</p>}
      <div className="mt-4 h-64 w-full md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
