import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore.js'

// Chặn trang yêu cầu đăng nhập. Nếu truyền role="admin" thì chỉ admin mới vào được.
export default function RequireAuth({ role, children }) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (role && user.role !== role) {
    return <Navigate to="/" replace />
  }
  return children
}
