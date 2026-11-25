import { useEffect, useState } from 'react'
import { Mail, MessageCircle, Trash2 } from 'lucide-react'
import Button from '../../components/common/Button.jsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import Drawer from '../../components/common/Drawer.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import FormField, { inputClass } from '../../components/common/FormField.jsx'
import PageHeader from '../../components/common/PageHeader.jsx'
import { useContactStore } from '../../store/contactStore.js'
import { notify } from '../../store/uiStore.js'
import { formatDateTime } from '../../utils/format.js'

export default function AdminContacts() {
  const { settings, messages } = useContactStore()
  const loadSettings = useContactStore((s) => s.loadSettings)
  const saveSettings = useContactStore((s) => s.saveSettings)
  const loadMessages = useContactStore((s) => s.loadMessages)
  const replyMessage = useContactStore((s) => s.replyMessage)
  const deleteMessage = useContactStore((s) => s.deleteMessage)
  const [form, setForm] = useState(settings)
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState(null)
  const [reply, setReply] = useState('')
  const [confirmId, setConfirmId] = useState(null)

  useEffect(() => {
    loadSettings().then((data) => setForm((current) => ({ ...current, ...data })))
    loadMessages()
  }, [loadSettings, loadMessages])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    const result = await saveSettings({
      group_name: form.group_name,
      intro: form.intro,
      zalo_link: form.zalo_link,
      facebook_link: form.facebook_link,
      email: form.email,
      phone: form.phone,
    })
    setSaving(false)
    notify(result.error
      ? { type: 'error', title: 'Không lưu được', description: result.error }
      : { title: 'Đã cập nhật liên hệ', description: 'Trang liên hệ đã dùng nội dung mới.' })
  }

  const openMessage = (m) => {
    setSelected(m)
    setReply(m.reply ?? '')
  }

  const sendReply = async () => {
    if (!selected || !reply.trim()) return
    const result = await replyMessage(selected.id, reply.trim())
    notify(result.error
      ? { type: 'error', title: 'Không gửi được', description: result.error }
      : { title: 'Đã lưu phản hồi', description: 'Bạn có thể gửi nội dung này qua email/Zalo cho khách.' })
    if (!result.error) setSelected({ ...selected, reply: reply.trim(), replied_at: new Date().toISOString() })
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Liên hệ nhóm 4" description="Chỉnh link liên hệ và trả lời tin nhắn khách gửi từ website." />

      <section className="rounded-lg border border-line bg-white p-5">
        <h2 className="text-base font-semibold text-ink">Nội dung hiển thị trên trang liên hệ</h2>
        <form onSubmit={save} className="mt-4 grid gap-4 md:grid-cols-2">
          <FormField label="Tên nhóm" htmlFor="group_name">
            <input id="group_name" value={form.group_name ?? ''} onChange={(e) => setForm({ ...form, group_name: e.target.value })} className={inputClass()} />
          </FormField>
          <FormField label="Số điện thoại" htmlFor="cphone">
            <input id="cphone" value={form.phone ?? ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass()} placeholder="09xx xxx xxx" />
          </FormField>
          <FormField label="Email" htmlFor="cemail">
            <input id="cemail" type="email" value={form.email ?? ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass()} placeholder="nhom4@example.com" />
          </FormField>
          <FormField label="Link Zalo" htmlFor="zalo" hint="Dán đầy đủ https://...">
            <input id="zalo" value={form.zalo_link ?? ''} onChange={(e) => setForm({ ...form, zalo_link: e.target.value })} className={inputClass()} placeholder="https://zalo.me/..." />
          </FormField>
          <FormField label="Link Facebook" htmlFor="fb" hint="Dán đầy đủ https://...">
            <input id="fb" value={form.facebook_link ?? ''} onChange={(e) => setForm({ ...form, facebook_link: e.target.value })} className={inputClass()} placeholder="https://facebook.com/groups/..." />
          </FormField>
          <FormField label="Giới thiệu ngắn" htmlFor="intro">
            <input id="intro" value={form.intro ?? ''} onChange={(e) => setForm({ ...form, intro: e.target.value })} className={inputClass()} />
          </FormField>
          <div className="md:col-span-2">
            <Button type="submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu nội dung liên hệ'}</Button>
          </div>
        </form>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Tin nhắn khách gửi ({messages.length})</h2>
          <Button variant="ghost" size="sm" onClick={loadMessages}>Làm mới</Button>
        </div>
        <div className="overflow-x-auto rounded-lg border border-line bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line bg-surface text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Khách</th>
                <th className="px-4 py-3 font-semibold">Tiêu đề</th>
                <th className="px-4 py-3 font-semibold">Thời gian</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {messages.map((m) => (
                <tr key={m.id} className="hover:bg-surface/60">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{m.full_name}</p>
                    <p className="text-xs text-ink-muted">{m.email}{m.phone ? ` · ${m.phone}` : ''}</p>
                  </td>
                  <td className="max-w-[260px] truncate px-4 py-3">{m.subject || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-muted">{formatDateTime(m.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${m.reply ? 'bg-brand-soft text-brand' : 'bg-amber-50 text-amber-700'}`}>
                      {m.reply ? 'Đã trả lời' : 'Chưa trả lời'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openMessage(m)}>Xem</Button>
                      <button type="button" onClick={() => setConfirmId(m.id)} aria-label="Xóa tin" className="rounded p-2 text-ink-muted hover:bg-red-50 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {messages.length === 0 && (
            <div className="p-8">
              <EmptyState icon={MessageCircle} title="Chưa có tin nhắn" description="Tin nhắn khách gửi từ trang Liên hệ sẽ hiện ở đây." />
            </div>
          )}
        </div>
      </section>

      <Drawer open={Boolean(selected)} title="Chi tiết tin nhắn" onClose={() => setSelected(null)}>
        {selected && (
          <div className="space-y-5 text-sm">
            <div className="space-y-1">
              <p className="font-semibold text-ink">{selected.full_name}</p>
              <p className="text-ink-muted">{selected.email}</p>
              {selected.phone && <p className="text-ink-muted">{selected.phone}</p>}
              <p className="text-xs text-ink-muted">{formatDateTime(selected.created_at)}</p>
            </div>
            <div>
              <h3 className="font-semibold text-ink">{selected.subject || 'Câu hỏi'}</h3>
              <p className="mt-2 whitespace-pre-wrap rounded-md border border-line bg-surface p-3 leading-relaxed">{selected.message}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-ink">Phản hồi của nhóm 4</h3>
              <textarea rows={5} value={reply} onChange={(e) => setReply(e.target.value)} className={inputClass()} placeholder="Soạn câu trả lời..." />
              <p className="flex items-center gap-1 text-xs text-ink-muted">
                <Mail size={13} /> Sau khi lưu, hãy gửi nội dung này qua email/Zalo cho khách.
              </p>
              <div className="flex gap-2">
                <Button onClick={sendReply} disabled={!reply.trim()}>Lưu phản hồi</Button>
                {selected.email && (
                  <a href={`mailto:${selected.email}?body=${encodeURIComponent(reply)}`} className="inline-flex items-center gap-2 rounded-md border border-line px-4 py-2 text-sm hover:border-brand">
                    <Mail size={15} /> Mở email
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={Boolean(confirmId)}
        title="Xóa tin nhắn này?"
        message="Tin nhắn sẽ bị xóa vĩnh viễn."
        confirmLabel="Xóa"
        danger
        onClose={() => setConfirmId(null)}
        onConfirm={async () => {
          await deleteMessage(confirmId)
          setConfirmId(null)
          setSelected(null)
        }}
      />
    </div>
  )
}
