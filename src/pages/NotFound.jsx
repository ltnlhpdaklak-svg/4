import { Link } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import EmptyState from '../components/common/EmptyState.jsx'

export default function NotFound() {
  return (
    <EmptyState
      icon={SearchX}
      title="Không tìm thấy trang"
      description="Đường dẫn bạn truy cập không tồn tại hoặc đã được chuyển đi."
      action={<Link to="/" className="text-sm font-semibold text-brand hover:underline">Về trang chủ</Link>}
    />
  )
}
