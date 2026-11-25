import { useEffect, useMemo, useState } from 'react'
import { Search, Trash2, UserCog } from 'lucide-react'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import { inputClass } from '../../components/common/FormField.jsx'
import PageHeader from '../../components/common/PageHeader.jsx'
import StatCard from '../../components/admin/StatCard.jsx'
import { useAuthStore } from '../../store/authStore.js'
import { notify } from '../../store/uiStore.js'
import { formatDate, formatNumber, normalizeText } from '../../utils/format.js'

const ROLE_LABEL = { admin: 'Quản trị viên', customer: 'Khách hàng' }

export default function AdminUsers() {
  const users = useAuthStore((s) => s.users)
  const loadUsers = useAuthStore((s) => s.loadUsers)
  const setUserRole = useAuthStore((s) => s.setUserRole)
  const setUserStatus = useAuthStore((s) => s.setUserStatus)
  const deleteUser = useAuthStore((s) => s.deleteUser)
  const [query, setQuery] = useState('')
  const [confirmId, setConfirmId] = useState(null)

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const list = useMemo(() => {
    const q = normalizeText(query)
    return users
      .filter((u) => !q || [u.full_name, u.email].some((v) => normalizeText(v).includes(q)))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [users, query])

  const adminCount = users.filter((u) => u.role === 'admin').length
  const customerCount = users.length - adminCount

  const changeRole = async (u) => {
    const next = u.role === 'admin' ? 'customer' : 'admin'
    const { error } = await setUserRole(u.id, next)
    notify(error ? { type: 'error', title: 'Không đổi được', description: error } : { title: 'Đã cập nhật vai trò' })
  }

  const toggleStatus = async (u) => {
    const next = u.status === 'Hoạt động' ? 'Khóa' : 'Hoạt động'
    const { error } = await setUserStatus(u.id, next)
    notify(error ? { type: 'error', title: 'Không đổi được', description: error } : { title: 'Đã cập nhật trạng thái' })
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Tài khoản hệ thống"
        description="Quản lý toàn bộ tài khoản đăng ký trên website."
      />

      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <StatCard label="Tổng tài khoản" value={formatNumber(users.length)} />
        <StatCard label="Quản trị viên" value={formatNumber(adminCount)} />
        <StatCard label="Khách hàng" value={formatNumber(customerCount)} />
      </div>

      <div className="relative md:w-80">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo tên hoặc email..."
          aria-label="Tìm tài khoản"
          className={`${inputClass()} pl-9`}
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-line bg-surface text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Họ và tên</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Vai trò</th>
              <th className="px-4 py-3 font-semibold">Trạng thái</th>
              <th className="px-4 py-3 font-semibold">Ngày tạo</th>
              <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((u) => (
              <tr key={u.id} className="hover:bg-surface/60">
                <td className="px-4 py-3 font-medium text-ink">{u.full_name || '—'}</td>
                <td className="px-4 py-3 text-ink-muted">{u.email}</td>
                <td className="px-4 py-3">
                  <button type="button" onClick={() => changeRole(u)} title="Nhấn để đổi vai trò">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      u.role === 'admin' ? 'bg-ink text-white' : 'bg-brand-soft text-brand'
                    }`}>
                      {ROLE_LABEL[u.role] ?? u.role}
                    </span>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button type="button" onClick={() => toggleStatus(u)} className="text-xs hover:text-brand">
                    {u.status ?? 'Hoạt động'}
                  </button>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-muted">{formatDate(u.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <button type="button" onClick={() => setConfirmId(u.id)} aria-label="Xóa tài khoản" className="rounded p-2 text-ink-muted hover:bg-red-50 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && (
          <div className="p-8">
            <EmptyState icon={UserCog} title="Không có tài khoản phù hợp" description="Thử từ khóa khác." />
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(confirmId)}
        title="Xóa tài khoản này?"
        message="Hồ sơ và dữ liệu liên quan sẽ bị xóa vĩnh viễn."
        confirmLabel="Xóa"
        danger
        onClose={() => setConfirmId(null)}
        onConfirm={async () => {
          await deleteUser(confirmId)
          setConfirmId(null)
        }}
      />
    </div>
  )
}
