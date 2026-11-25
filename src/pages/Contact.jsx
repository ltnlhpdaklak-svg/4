import { useEffect, useState } from 'react'
import { CheckCircle2, Mail, MessageCircle, Phone, Send } from 'lucide-react'
import Button from '../components/common/Button.jsx'
import FormField, { inputClass } from '../components/common/FormField.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import { useContactStore } from '../store/contactStore.js'
import { notify } from '../store/uiStore.js'

const EMPTY = { full_name: '', email: '', phone: '', subject: '', message: '' }

export default function Contact() {
  const settings = useContactStore((s) => s.settings)
  const loadSettings = useContactStore((s) => s.loadSettings)
  const sendMessage = useContactStore((s) => s.sendMessage)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors((err) => ({ ...err, [field]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const found = {}
    if (!form.full_name.trim()) found.full_name = 'Vui lòng nhập họ và tên.'
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) found.email = 'Email không hợp lệ.'
    if (form.message.trim().length < 5) found.message = 'Vui lòng nhập nội dung (ít nhất 5 ký tự).'
    setErrors(found)
    if (Object.keys(found).length) return

    setSubmitting(true)
    const result = await sendMessage({
      ...form,
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      subject: form.subject.trim() || 'Câu hỏi từ website',
      message: form.message.trim(),
      reply: '',
      replied_at: null,
    })
    setSubmitting(false)
    if (result.error) {
      notify({ type: 'error', title: 'Gửi tin thất bại', description: result.error })
      return
    }
    setSent(true)
    setForm(EMPTY)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Liên hệ" description="Cần hỗ trợ đặt hàng hoặc muốn hỏi thêm về sản phẩm? Gửi tin cho chúng tôi tại đây." />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <section className="rounded-lg border border-line bg-white p-5 md:p-6">
          {sent ? (
            <div className="flex flex-col items-center py-12 text-center">
              <CheckCircle2 size={40} className="text-brand" />
              <h2 className="mt-4 text-lg font-bold text-ink">Đã gửi tin nhắn</h2>
              <p className="mt-2 max-w-sm text-sm text-ink-muted">
                Chúng tôi đã nhận được tin của bạn và sẽ phản hồi sớm nhất có thể.
              </p>
              <Button className="mt-6" variant="outline" onClick={() => setSent(false)}>Gửi tin khác</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <h2 className="text-base font-semibold text-ink">Gửi tin nhắn</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Họ và tên" htmlFor="name" required error={errors.full_name}>
                  <input id="name" value={form.full_name} onChange={update('full_name')} className={inputClass(!!errors.full_name)} />
                </FormField>
                <FormField label="Email" htmlFor="email" required error={errors.email}>
                  <input id="email" type="email" value={form.email} onChange={update('email')} className={inputClass(!!errors.email)} />
                </FormField>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Số điện thoại" htmlFor="phone">
                  <input id="phone" inputMode="tel" value={form.phone} onChange={update('phone')} className={inputClass()} />
                </FormField>
                <FormField label="Tiêu đề" htmlFor="subject">
                  <input id="subject" value={form.subject} onChange={update('subject')} className={inputClass()} placeholder="Ví dụ: Hỏi về đơn hàng" />
                </FormField>
              </div>
              <FormField label="Nội dung" htmlFor="message" required error={errors.message}>
                <textarea id="message" rows={6} value={form.message} onChange={update('message')} className={inputClass(!!errors.message)} placeholder="Nhắn điều bạn cần hỏi ở đây..." />
              </FormField>
              <Button type="submit" size="lg" disabled={submitting} className="w-full md:w-auto">
                <Send size={16} /> {submitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
              </Button>
            </form>
          )}
        </section>

        <aside className="h-fit space-y-4">
          <div className="rounded-lg border border-line bg-white p-5">
            <h2 className="text-base font-semibold text-ink">4EYEWEAR</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {settings.intro || 'Liên hệ với chúng tôi để được hỗ trợ đặt hàng và giải đáp thắc mắc.'}
            </p>
            <div className="mt-5 space-y-3 text-sm">
              {settings.zalo_link && (
                <a href={settings.zalo_link} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-md bg-brand-soft p-3 font-medium text-brand hover:underline">
                  <MessageCircle size={18} /> Nhắn Zalo
                </a>
              )}
              {settings.facebook_link && (
                <a href={settings.facebook_link} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-md border border-line p-3 text-ink hover:border-brand">
                  <MessageCircle size={18} /> Nhóm Facebook
                </a>
              )}
              {settings.email && (
                <a href={`mailto:${settings.email}`} className="flex items-center gap-3 text-ink-muted hover:text-brand">
                  <Mail size={16} /> {settings.email}
                </a>
              )}
              {settings.phone && (
                <a href={`tel:${settings.phone}`} className="flex items-center gap-3 text-ink-muted hover:text-brand">
                  <Phone size={16} /> {settings.phone}
                </a>
              )}
              {!settings.zalo_link && !settings.facebook_link && !settings.email && !settings.phone && (
                <p className="text-sm text-ink-muted">Chưa có link liên hệ. Bạn có thể gửi tin qua form bên cạnh.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
