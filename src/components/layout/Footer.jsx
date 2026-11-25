import { Link } from 'react-router-dom'
import Logo from '../common/Logo.jsx'
import { useContactStore } from '../../store/contactStore.js'

export default function Footer() {
  const settings = useContactStore((s) => s.settings)

  return (
    <footer className="mt-12 bg-ink text-white/70">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 lg:grid-cols-4 lg:px-6">
        <div className="col-span-2 lg:col-span-1">
          <Logo tone="dark" />
          <p className="mt-3 text-sm leading-relaxed">
            Cửa hàng kính mắt của lớp D26TDK1. Chọn kính ưng ý, đặt hàng và nhận trực tiếp từ nhóm 4.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Mua hàng</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/products" className="hover:text-brand">Tất cả sản phẩm</Link></li>
            <li>Thanh toán khi nhận hàng (COD)</li>
            <li><Link to="/my-orders" className="hover:text-brand">Đơn mua của tôi</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Hỗ trợ</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/contact" className="hover:text-brand">Liên hệ nhóm 4</Link></li>
            <li><Link to="/contact" className="hover:text-brand">Gửi tin nhắn / hỏi đáp</Link></li>
            <li><Link to="/account" className="hover:text-brand">Hồ sơ và địa chỉ</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Liên hệ nhóm 4</h4>
          <ul className="mt-3 space-y-2 text-sm">
            {settings.zalo_link && <li><a href={settings.zalo_link} target="_blank" rel="noreferrer" className="hover:text-brand">Zalo nhóm 4</a></li>}
            {settings.facebook_link && <li><a href={settings.facebook_link} target="_blank" rel="noreferrer" className="hover:text-brand">Facebook nhóm 4</a></li>}
            {settings.email && <li>Email: {settings.email}</li>}
            {settings.phone && <li>Hotline: {settings.phone}</li>}
            <li><Link to="/contact" className="hover:text-brand">Xem tất cả liên hệ →</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs">
        © 2026 4EYEWEAR · Nhóm 4 D26TDK1
      </div>
    </footer>
  )
}
