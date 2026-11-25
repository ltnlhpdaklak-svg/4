// Các hàm tiện ích định dạng dùng chung. Không import gì từ dự án để tránh vòng lặp import.

export const formatVND = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value) || 0)

export const formatNumber = (value) => new Intl.NumberFormat('vi-VN').format(Number(value) || 0)

export const formatDateTime = (iso) =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))

export const formatDate = (iso) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso))

export const formatDayMonth = (iso) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(new Date(iso))

// Giá đang áp dụng: giá khuyến mãi nếu nhỏ hơn giá gốc, ngược lại là giá gốc
export const effectivePrice = (product) =>
  product.sale_price && product.sale_price < product.price ? product.sale_price : product.price

export const discountPercent = (product) => {
  const price = effectivePrice(product)
  return price < product.price ? Math.round((1 - price / product.price) * 100) : 0
}

export const slugify = (text = '') =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const formatAddress = (addr) =>
  [addr.street_address, addr.ward, addr.district, addr.province].filter(Boolean).join(', ')

export const localDateKey = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Chuẩn hóa chuỗi để tìm kiếm không phân biệt hoa thường và dấu tiếng Việt
export const normalizeText = (text = '') =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
