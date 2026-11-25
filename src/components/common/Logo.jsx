import { Glasses } from 'lucide-react'

export default function Logo({ tone = 'light', className = '' }) {
  const textColor = tone === 'dark' ? 'text-white' : 'text-ink'
  return (
    <span className={`inline-flex items-center gap-1.5 font-extrabold tracking-tight ${textColor} ${className}`}>
      <Glasses className="size-6 text-brand" strokeWidth={2.25} aria-hidden="true" />
      <span>4EYEWEAR</span>
    </span>
  )
}
