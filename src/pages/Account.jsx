import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, LogOut, MapPin, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import Button from '../components/common/Button.jsx'
import ConfirmDialog from '../components/common/ConfirmDialog.jsx'
import FormField, { inputClass } from '../components/common/FormField.jsx'
import Modal from '../components/common/Modal.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import { useAuthStore } from '../store/authStore.js'
import { notify } from '../store/uiStore.js'
import { formatAddress } from '../utils/format.js'

const PHONE_RE = /^(0|\+84)[0-9]{9}$/

const EMPTY_ADDRESS = {
  recipient_name: '',
  phone: '',
  province: '',
  district: '',
  ward: '',
  street_address: '',
}

function validateAddress(form) {
  const errors = {}
  if (!form.recipient_name.trim()) errors.recipient_name = 'Vui lòng nhập họ và tên.'
  if (!PHONE_RE.test(form.phone.trim().replace(/\s+/g, ''))) {
    errors.phone = 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0).'
  }
  if (!form.province.trim()) errors.province = 'Vui lòng nhập tỉnh/thành phố.'
  if (!form.district.trim()) errors.district = 'Vui lòng nhập quận/huyện.'
  if (!form.ward.trim()) errors.ward = 'Vui lòng nhập phường/xã.'
  if (!form.street_address.trim()) errors.street_address = 'Vui lòng nhập địa chỉ cụ thể.'
  return errors
}

function ProfileSection({ user }) {
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const [fullName, setFullName] = useState(user.full_name)
  const [phone, setPhone] = useState(user.phone ?? '')
  const [error, setError] = useState('')

  const handleSave = (e) => {
    e.preventDefault()
    if (!fullName.trim()) {
      setError('Vui lòng nhập họ và tên.')
      return
    }
    if (phone.trim() && !PHONE_RE.test(phone.trim().replace(/\s+/g, ''))) {
      setError('Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0).')
      return
    }
    setError('')
    updateProfile({ full_name: fullName.trim(), phone: phone.trim() })
    notify({ title: 'Đã lưu thông tin', description: 'Thông tin cá nhân đã được cập nhật.' })
  }

  return (
    <section className="rounded-lg border border-line bg-white p-4 md:p-6">
      <h2 className="text-base font-semibold text-ink">Thông tin cá nhân</h2>
      <form onSubmit={handleSave} noValidate className="mt-4 grid gap-4 md:grid-cols-2">
        {error && (
          <p role="alert" className="text-sm text-red-600 md:col-span-2">{error}</p>
        )}
        <FormField label="Họ và tên" htmlFor="profile-name" required>
          <input id="profile-name" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass()} />
        </FormField>
        <FormField label="Số điện thoại" htmlFor="profile-phone">
          <input id="profile-phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass()} />
        </FormField>
        <FormField label="Email" htmlFor="profile-email" hint="Email dùng để đăng nhập">
          <input id="profile-email" value={user.email} readOnly className={`${inputClass()} bg-surface text-ink-muted`} />
        </FormField>
        <div className="flex justify-end md:col-span-2">
          <Button type="submit">Lưu thay đổi</Button>
        </div>
      </form>
    </section>
  )
}

function AddressModal({ initial, hasAddresses, onClose }) {
  const saveAddress = useAuthStore((s) => s.saveAddress)
  const [form, setForm] = useState(() => (initial ? { ...EMPTY_ADDRESS, ...initial } : EMPTY_ADDRESS))
  const [isDefault, setIsDefault] = useState(initial?.is_default ?? false)
  const [errors, setErrors] = useState({})

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors((err) => ({ ...err, [field]: undefined }))
  }

  const handleSave = () => {
    const found = validateAddress(form)
    setErrors(found)
    if (Object.keys(found).length) return

    saveAddress({
      id: initial?.id,
      recipient_name: form.recipient_name.trim(),
      phone: form.phone.trim(),
      province: form.province.trim(),
      district: form.district.trim(),
      ward: form.ward.trim(),
      street_address: form.street_address.trim(),
      // Địa chỉ đầu tiên luôn là mặc định
      is_default: isDefault || !hasAddresses,
    })
    notify({ title: initial ? 'Đã cập nhật địa chỉ' : 'Đã thêm địa chỉ' })
    onClose()
  }

  return (
    <Modal
      open
      title={initial ? 'Sửa địa chỉ' : 'Thêm địa chỉ'}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSave}>Lưu địa chỉ</Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Họ và tên người nhận" htmlFor="addr-name" required error={errors.recipient_name}>
          <input id="addr-name" value={form.recipient_name} onChange={update('recipient_name')} className={inputClass(!!errors.recipient_name)} />
        </FormField>
        <FormField label="Số điện thoại" htmlFor="addr-phone" required error={errors.phone}>
          <input id="addr-phone" inputMode="tel" value={form.phone} onChange={update('phone')} className={inputClass(!!errors.phone)} />
        </FormField>
        <FormField label="Tỉnh/thành phố" htmlFor="addr-province" required error={errors.province}>
          <input id="addr-province" value={form.province} onChange={update('province')} className={inputClass(!!errors.province)} />
        </FormField>
        <FormField label="Quận/huyện" htmlFor="addr-district" required error={errors.district}>
          <input id="addr-district" value={form.district} onChange={update('district')} className={inputClass(!!errors.district)} />
        </FormField>
        <FormField label="Phường/xã" htmlFor="addr-ward" required error={errors.ward}>
          <input id="addr-ward" value={form.ward} onChange={update('ward')} className={inputClass(!!errors.ward)} />
        </FormField>
        <FormField label="Địa chỉ cụ thể" htmlFor="addr-street" required error={errors.street_address} hint="Số nhà, tên đường, tòa nhà">
          <input id="addr-street" value={form.street_address} onChange={update('street_address')} className={inputClass(!!errors.street_address)} />
        </FormField>
        <label className="flex items-center gap-2 text-sm text-ink md:col-span-2">
          <input type="checkbox" className="accent-brand" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
          Đặt làm địa chỉ mặc định
        </label>
      </div>
    </Modal>
  )
}

function AddressSection({ user }) {
  const deleteAddress = useAuthStore((s) => s.deleteAddress)
  const setDefaultAddress = useAuthStore((s) => s.setDefaultAddress)
  const [editing, setEditing] = useState(null) // null | 'new' | địa chỉ đang sửa
  const [removing, setRemoving] = useState(null)
  const addresses = user.addresses ?? []

  const handleRemove = () => {
    deleteAddress(removing.id)
    notify({ title: 'Đã xóa địa chỉ' })
    setRemoving(null)
  }

  return (
    <section className="rounded-lg border border-line bg-white p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">Địa chỉ nhận hàng</h2>
        <Button variant="outline" size="sm" onClick={() => setEditing('new')}>
          <Plus size={16} aria-hidden="true" /> Thêm địa chỉ
        </Button>
      </div>

      {addresses.length === 0 ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-ink-muted">
          <MapPin size={16} aria-hidden="true" /> Bạn chưa có địa chỉ nào.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {addresses.map((a) => (
            <li key={a.id} className={`rounded-md border p-4 text-sm ${a.is_default ? 'border-brand bg-brand-soft' : 'border-line'}`}>
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-ink">
                  {a.recipient_name} <span className="font-normal text-ink-muted">· {a.phone}</span>
                </p>
                {a.is_default && (
                  <span className="shrink-0 rounded-sm bg-brand px-2 py-0.5 text-[11px] font-semibold text-white">Mặc định</span>
                )}
              </div>
              <p className="mt-1 text-ink-muted">{formatAddress(a)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="ghost" size="sm" onClick={() => setEditing(a)}>
                  <Pencil size={14} aria-hidden="true" /> Sửa
                </Button>
                {!a.is_default && (
                  <Button variant="ghost" size="sm" onClick={() => setDefaultAddress(a.id)}>
                    <Star size={14} aria-hidden="true" /> Đặt mặc định
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setRemoving(a)}>
                  <Trash2 size={14} aria-hidden="true" /> Xóa
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <AddressModal
          key={editing === 'new' ? 'new' : editing.id}
          initial={editing === 'new' ? null : editing}
          hasAddresses={addresses.length > 0}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(removing)}
        title="Xóa địa chỉ"
        message={removing ? `Xóa địa chỉ "${formatAddress(removing)}"?` : ''}
        confirmLabel="Xóa"
        danger
        onConfirm={handleRemove}
        onClose={() => setRemoving(null)}
      />
    </section>
  )
}

export default function Account() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  if (!user) return null

  // Trang này yêu cầu đăng nhập nên sau khi đăng xuất, RequireAuth sẽ đưa về trang đăng nhập.
  // Đăng nhập lại sẽ quay về đúng trang này.
  const handleLogout = () => {
    logout()
    notify({ title: 'Đã đăng xuất' })
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Tài khoản của tôi" description={`Xin chào, ${user.full_name}`} />

      <div className="flex flex-wrap gap-3">
        <Link
          to="/my-orders"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink hover:bg-surface"
        >
          <ClipboardList size={16} aria-hidden="true" /> Đơn hàng của tôi
        </Link>
        <Button variant="ghost" onClick={handleLogout}>
          <LogOut size={16} aria-hidden="true" /> Đăng xuất
        </Button>
      </div>

      <ProfileSection key={user.id} user={user} />
      <AddressSection user={user} />
    </div>
  )
}
