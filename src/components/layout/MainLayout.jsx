import { Outlet } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from './Footer.jsx'

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-3 py-6 sm:px-4 md:py-8 lg:px-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
