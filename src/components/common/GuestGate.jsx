import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore.js'

export default function GuestGate({ children }) {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const navigate = useNavigate()

  if (loading || user) return children

  return (
    <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/login') }} className="cursor-pointer">
      {children}
    </div>
  )
}
