import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Glasses } from 'lucide-react'

export default function Logo({ tone = 'light', className = '' }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const clicks = useRef([])
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const handleClick = () => {
    if (pathname === '/fun-zone') return
    const now = Date.now()
    clicks.current = [...clicks.current.filter((t) => now - t < 2500), now]
    if (clicks.current.length >= 5) {
      clicks.current = []
      navigate('/fun-zone')
      return
    }
    clearTimeout(timer.current)
    timer.current = setTimeout(() => { clicks.current = [] }, 2500)
  }

  const textColor = tone === 'dark' ? 'text-white' : 'text-ink'
  return (
    <button type="button" onClick={handleClick} className={`inline-flex items-center gap-1.5 font-extrabold tracking-tight ${textColor} ${className}`}>
      <Glasses className="size-6 text-brand" strokeWidth={2.25} aria-hidden="true" />
      <span>4EYEWEAR</span>
    </button>
  )
}
