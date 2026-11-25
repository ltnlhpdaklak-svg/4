import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { BarChart3, ClipboardList, Home, LayoutDashboard, Mail, Menu, Package, Tags, UserCog, Users, X } from 'lucide-react'
import Logo from '../common/Logo.jsx'
import { useAuthStore } from '../../store/authStore.js'

const NAV_ITEMS = [
  { to: '/admin', label: 'Tổng quan', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Đơn hàng', icon: ClipboardList },
  { to: '/admin/products', label: 'Sản phẩm', icon: Package },
  { to: '/admin/categories', label: 'Danh mục', icon: Tags },
  { to: '/admin/customers', label: 'Khách hàng', icon: Users },
  { to: '/admin/users', label: 'Tài khoản', icon: UserCog },
  { to: '/admin/contacts', label: 'Liên hệ nhóm 4', icon: Mail },
  { to: '/admin/analytics', label: 'Thống kê Marketing', icon: BarChart3 },
]

function SidebarNav({ onNavigate }) {
  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md border-l-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-brand bg-white/10 text-white'
                  : 'border-transparent text-white/70 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon size={18} aria-hidden="true" />
            {item.label}
          </NavLink>
        )
      })}
    </nav>
  )
}

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { pathname } = useLocation()
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen bg-surface">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col bg-ink p-4 lg:flex">
        <div className="mb-6 px-2">
          <Logo tone="dark" />
          <p className="mt-1 text-xs text-white/50">Khu vực quản trị</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarNav />
        </div>
        <div className="space-y-1 border-t border-white/10 pt-4">
          <Link to="/" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white">
            <Home size={18} aria-hidden="true" /> Về trang khách
          </Link>
          <p className="truncate px-3 py-2 text-xs text-white/50">{user?.email}</p>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between bg-ink px-4 py-3 text-white lg:hidden">
        <button type="button" onClick={() => setDrawerOpen(true)} aria-label="Mở menu quản trị" className="rounded-md p-1 hover:bg-white/10">
          <Menu size={22} />
        </button>
        <Logo tone="dark" />
        <span className="max-w-[40%] truncate text-xs text-white/60">{user?.full_name}</span>
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Đóng menu" className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-ink p-4">
            <div className="mb-6 flex items-center justify-between px-2">
              <Logo tone="dark" />
              <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Đóng" className="rounded-md p-1 text-white hover:bg-white/10">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarNav onNavigate={() => setDrawerOpen(false)} />
            </div>
            <div className="space-y-1 border-t border-white/10 pt-4">
              <Link to="/" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white">
                <Home size={18} aria-hidden="true" /> Về trang khách
              </Link>
            </div>
          </aside>
        </div>
      )}

      <main className="p-4 md:p-6 lg:pl-64 lg:pr-8 lg:py-8">
        <Outlet />
      </main>
    </div>
  )
}
