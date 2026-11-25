import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import Button from '../components/common/Button.jsx'
import FormField, { inputClass } from '../components/common/FormField.jsx'
import Logo from '../components/common/Logo.jsx'
import { useAuthStore } from '../store/authStore.js'
import { notify } from '../store/uiStore.js'
import { trackEvent } from '../utils/analytics.js'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const found = {}
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) found.email = 'Email không hợp lệ.'
    if (!password) found.password = 'Vui lòng nhập mật khẩu.'
    setErrors(found)
    setFormError('')
    if (Object.keys(found).length) return

    setSubmitting(true)
    const result = await login(email, password)
    setSubmitting(false)
    if (result.error) {
      setFormError(result.error)
      return
    }
    trackEvent('login', { role: result.user.role })
    notify({ title: `Chào mừng ${result.user.full_name}!`, description: 'Bạn đã đăng nhập thành công.' })
    const from = location.state?.from
    const isAdmin = result.user.role === 'admin'
    let target = isAdmin ? '/admin' : '/'
    if (from && (isAdmin ? from.startsWith('/admin') : !from.startsWith('/admin'))) target = from
    navigate(target, { replace: true })
  }

  return (
    <div className="mx-auto max-w-md py-4 md:py-8">
      <div className="rounded-lg border border-line bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <h1 className="text-center text-xl font-bold text-ink">Đăng nhập</h1>
        <p className="mt-1 text-center text-sm text-ink-muted">Chào mừng bạn quay lại 4EYEWEAR</p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          {formError && (
            <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formError}</div>
          )}
          <FormField label="Email" htmlFor="email" required error={errors.email}>
            <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass(!!errors.email)} />
          </FormField>
          <FormField label="Mật khẩu" htmlFor="password" required error={errors.password}>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass(!!errors.password)} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-muted hover:text-ink"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </FormField>
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-semibold text-brand hover:underline">Đăng ký</Link>
        </p>

      </div>
    </div>
  )
}
