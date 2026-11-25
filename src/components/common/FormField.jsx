export const inputClass = (hasError = false) =>
  `h-10 w-full rounded-md border bg-white px-3 text-sm text-ink outline-none transition focus:ring-2 focus:ring-brand/20 ${
    hasError ? 'border-red-500 focus:border-red-500' : 'border-line focus:border-brand'
  }`

export default function FormField({ label, htmlFor, error, hint, required = false, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-ink-muted">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
