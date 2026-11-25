import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut, Menu, Search, ShoppingCart, X } from 'lucide-react'
import Logo from '../common/Logo.jsx'
import { useAuthStore } from '../../store/authStore.js'
import { selectCartCount, useCartStore } from '../../store/cartStore.js'
import { useCatalogStore } from '../../store/catalogStore.js'
import { notify } from '../../store/uiStore.js'
import { trackEvent } from '../../utils/analytics.js'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const cartCount = useCartStore(selectCartCount)
  const categories = useCatalogStore((s) => s.categories)

  // Đóng menu di động khi đổi trang
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const handleSearch = (e) => {
    e.preventDefault()
    const q = keyword.trim()
    if (q) trackEvent('search', { keyword: q })
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : '/products')
  }

  const handleLogout = () => {
    logout()
    notify({ title: 'Đã đăng xuất', description: 'Hẹn gặp lại bạn tại 4EYEWEAR.' })
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 shadow-sm">
      {/* Dải trên cùng (desktop) */}
      <div className="hidden bg-ink text-xs text-white lg:block">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-6">
          <span className="tracking-wide">Miễn phí giao hàng cho đơn từ 500.000đ · Hỗ trợ 24/7</span>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-white/80">Xin chào, {user.full_name}</span>
              <Link to="/account" className="hover:text-brand">Tài khoản</Link>
              <button type="button" onClick={handleLogout} className="hover:text-brand">Đăng xuất</button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/contact" className="hover:text-brand">Liên hệ</Link>
              <Link to="/login" className="hover:text-brand">Đăng nhập</Link>
              <span className="text-white/40">|</span>
              <Link to="/register" className="hover:text-brand">Đăng ký</Link>
            </div>
          )}
        </div>
      </div>

      {/* Dòng chính */}
      <div className="bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2 sm:px-4 lg:h-16 lg:flex-nowrap lg:gap-x-6 lg:px-6 lg:py-0">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Mở menu"
            className="rounded-md p-2 text-ink hover:bg-surface lg:hidden"
          >
            <Menu size={22} />
          </button>

          <Link to="/" className="flex flex-1 justify-center lg:flex-none lg:justify-start" aria-label="Trang chủ 4EYEWEAR">
            <Logo />
          </Link>

          <form
            onSubmit={handleSearch}
            role="search"
            className="order-last flex w-full items-center overflow-hidden rounded-md border border-line bg-surface focus-within:border-brand lg:order-none lg:flex-1"
          >
            <input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm kiếm mắt kính, gọng kính, kính râm..."
              aria-label="Tìm kiếm sản phẩm"
              className="h-10 w-full bg-transparent px-3 text-sm text-ink outline-none placeholder:text-ink-muted"
            />
            <button
              type="submit"
              aria-label="Tìm kiếm"
              className="flex h-10 w-12 shrink-0 items-center justify-center bg-brand text-white transition-colors hover:bg-brand-hover"
            >
              <Search size={18} />
            </button>
          </form>

          <Link
            to="/cart"
            aria-label={`Giỏ hàng, ${cartCount} sản phẩm`}
            className="relative rounded-md p-2 text-ink hover:bg-surface"
          >
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[11px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Danh mục (tablet và desktop) */}
        <nav className="hidden border-t border-line md:block">
          <div className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 py-2 text-sm lg:px-6">
            <Link to="/products" className="whitespace-nowrap font-medium text-ink hover:text-brand">Tất cả sản phẩm</Link>
            {categories.map((c) => (
              <Link key={c.id} to={`/products?category=${c.slug}`} className="whitespace-nowrap text-ink hover:text-brand">
                {c.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Menu di động */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Đóng menu" className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 max-w-[85%] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-line p-4">
              <Logo />
              <button type="button" onClick={() => setMenuOpen(false)} aria-label="Đóng" className="rounded-md p-1 hover:bg-surface">
                <X size={22} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 text-sm">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Danh mục</p>
              <Link to="/products" className="block rounded-md px-3 py-2.5 font-medium hover:bg-surface">Tất cả sản phẩm</Link>
              {categories.map((c) => (
                <Link key={c.id} to={`/products?category=${c.slug}`} className="block rounded-md px-3 py-2.5 hover:bg-surface">
                  {c.name}
                </Link>
              ))}

              <Link to="/contact" className="mt-6 block rounded-md px-3 py-2.5 font-medium text-brand hover:bg-brand-soft">Liên hệ hỗ trợ</Link>
              <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-ink-muted">Tài khoản</p>
              {user ? (
                <>
                  <p className="px-3 pb-2 text-ink-muted">Xin chào, {user.full_name}</p>
                  <Link to="/account" className="block rounded-md px-3 py-2.5 hover:bg-surface">Hồ sơ và địa chỉ</Link>
                  <Link to="/my-orders" className="block rounded-md px-3 py-2.5 hover:bg-surface">Đơn mua</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="flex items-center gap-2 rounded-md px-3 py-2.5 font-medium text-brand hover:bg-brand-soft">
                      <LayoutDashboard size={16} /> Quản trị
                    </Link>
                  )}
                  <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left hover:bg-surface">
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block rounded-md px-3 py-2.5 hover:bg-surface">Đăng nhập</Link>
                  <Link to="/register" className="block rounded-md px-3 py-2.5 hover:bg-surface">Đăng ký</Link>
                </>
              )}
            </nav>
          </aside>
        </div>
      )}
    </header>
  )
}
