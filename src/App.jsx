import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout.jsx'
import AdminLayout from './components/layout/AdminLayout.jsx'
import RequireAuth from './components/common/RequireAuth.jsx'
import GuestGate from './components/common/GuestGate.jsx'
import Toaster from './components/common/Toaster.jsx'
import { trackEvent } from './utils/analytics.js'

import Home from './pages/Home.jsx'
import Products from './pages/Products.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import OrderSuccess from './pages/OrderSuccess.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Account from './pages/Account.jsx'
import MyOrders from './pages/MyOrders.jsx'
import Contact from './pages/Contact.jsx'
import FunShop from './pages/FunShop.jsx'
import NotFound from './pages/NotFound.jsx'

import Dashboard from './pages/admin/Dashboard.jsx'
import AdminOrders from './pages/admin/AdminOrders.jsx'
import AdminProducts from './pages/admin/AdminProducts.jsx'
import AdminCategories from './pages/admin/AdminCategories.jsx'
import AdminCustomers from './pages/admin/AdminCustomers.jsx'
import AdminUsers from './pages/admin/AdminUsers.jsx'
import AdminAnalytics from './pages/admin/AdminAnalytics.jsx'
import AdminContacts from './pages/admin/AdminContacts.jsx'

import { useAuthStore } from './store/authStore.js'
import { useCatalogStore } from './store/catalogStore.js'
import { useContactStore } from './store/contactStore.js'
import { useEventStore } from './store/eventStore.js'

function DataBootstrap() {
  const init = useAuthStore((s) => s.init)
  const listen = useAuthStore((s) => s.listen)
  const loadCatalog = useCatalogStore((s) => s.load)
  const loadSettings = useContactStore((s) => s.loadSettings)
  const loadEvents = useEventStore((s) => s.load)

  useEffect(() => {
    init()
    listen()
    loadCatalog()
    loadSettings()
    loadEvents()
  }, [init, listen, loadCatalog, loadSettings, loadEvents])
  return null
}

function RouteEffects() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    if (!pathname.startsWith('/admin')) trackEvent('page_view', { path: pathname })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <DataBootstrap />
      <RouteEffects />
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        <Route element={<GuestGate><MainLayout /></GuestGate>}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-success/:code" element={<OrderSuccess />} />
          <Route path="contact" element={<Contact />} />
          <Route path="account" element={<RequireAuth><Account /></RequireAuth>} />
          <Route path="my-orders" element={<RequireAuth><MyOrders /></RequireAuth>} />
          <Route path="home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="fun-zone" element={<div className="min-h-screen bg-black text-neutral-200"><FunShop /></div>} />

        <Route path="admin" element={<RequireAuth role="admin"><AdminLayout /></RequireAuth>}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="contacts" element={<AdminContacts />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}
