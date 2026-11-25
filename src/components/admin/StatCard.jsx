export default function StatCard({ label, value, hint, tone = 'default', loading = false }) {
  return (
    <div className="rounded-lg border border-line bg-white p-4 md:p-5">
      <p className="text-xs font-medium text-ink-muted md:text-sm">{label}</p>
      {loading ? (
        <div className="mt-2 h-7 w-24 animate-pulse rounded bg-surface" aria-hidden="true" />
      ) : (
        <p className={`mt-1 text-xl font-bold tabular-nums md:text-2xl ${tone === 'brand' ? 'text-brand' : 'text-ink'}`}>
          {value}
        </p>
      )}
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  )
}
