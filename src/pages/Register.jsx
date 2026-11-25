import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import Button from '../components/common/Button.jsx'
import FormField, { inputClass } from '../components/common/FormField.jsx'
import Logo from '../components/common/Logo.jsx'
import { useAuthStore } from '../store/authStore.js'
import { notify } from '../store/uiStore.js'
import { trackEvent } from '../utils/analytics.js'

const EMPTY = { full_name: '', email: '', password: '', confirm: '' }

export default function Register() {
  const navigate = useNavigate()
  const register = useAuthStore((s) => s.register)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors((err) => ({ ...err, [field]: undefined }))
  }

  const validate = () => {
    const found = {}
    if (!form.full_name.trim()) found.full_name = 'Vui lòng nhập họ và tên.'
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) found.email = 'Email không hợp lệ.'
    if (form.password.length < 6) found.password = 'Mật khẩu cần ít nhất 6 ký tự.'
    if (form.confirm !== form.password) found.confirm = 'Mật khẩu xác nhận không khớp.'
    return found
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const found = validate()
    setErrors(found)
    setFormError('')
    if (Object.keys(found).length) return

    setSubmitting(true)
    const result = await register({ full_name: form.full_name, email: form.email, password: form.password })
    setSubmitting(false)
    if (result.error) {
      setFormError(result.error)
      return
    }
    trackEvent('signup', { role: 'customer' })
    notify({ title: 'Đăng ký thành công', description: `Chào mừng ${result.user.full_name} đến với 4EYEWEAR.` })
    navigate('/account', { replace: true })
  }

  return (
    <div className="mx-auto max-w-md py-4 md:py-8">
      <div className="rounded-lg border border-line bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <h1 className="text-center text-xl font-bold text-ink">Tạo tài khoản</h1>
        <p className="mt-1 text-center text-sm text-ink-muted">Đăng ký để đặt hàng và theo dõi đơn</p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          {formError && (
            <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formError}</div>
          )}
          <FormField label="Họ và tên" htmlFor="full_name" required error={errors.full_name}>
            <input id="full_name" autoComplete="name" value={form.full_name} onChange={update('full_name')} className={inputClass(!!errors.full_name)} />
          </FormField>
          <FormField label="Email" htmlFor="email" required error={errors.email}>
            <input id="email" type="email" autoComplete="email" value={form.email} onChange={update('email')} className={inputClass(!!errors.email)} />
          </FormField>
          <FormField label="Mật khẩu" htmlFor="password" required error={errors.password} hint="Tối thiểu 6 ký tự">
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={form.password}
                onChange={update('password')}
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
          <FormField label="Xác nhận mật khẩu" htmlFor="confirm" required error={errors.confirm}>
            <input id="confirm" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.confirm} onChange={update('confirm')} className={inputClass(!!errors.confirm)} />
          </FormField>
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-semibold text-brand hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  )
}
