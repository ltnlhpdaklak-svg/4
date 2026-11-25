export default function ProductCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg border border-line bg-white" aria-hidden="true">
      <div className="aspect-square bg-surface" />
      <div className="space-y-2 p-3">
        <div className="h-4 w-4/5 rounded bg-surface" />
        <div className="h-4 w-2/5 rounded bg-surface" />
        <div className="h-3 w-1/3 rounded bg-surface" />
      </div>
    </div>
  )
}
