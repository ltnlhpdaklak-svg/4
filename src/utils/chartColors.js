// Bảng màu biểu đồ: màu thương hiệu và các màu trung tính, đọc rõ trên nền trắng
export const CHART = {
  brand: '#EE4D2D',
  ink: '#171717',
  muted: '#737373',
  grid: '#E5E5E5',
  blue: '#2563EB',
  green: '#16A34A',
  amber: '#D97706',
  violet: '#7C3AED',
  neutral: '#A3A3A3',
}

export const STATUS_COLORS = {
  'Chờ xác nhận': CHART.amber,
  'Đã xác nhận': CHART.blue,
  'Đang giao hàng': CHART.violet,
  'Đã giao hàng': CHART.green,
  'Đã hủy': CHART.neutral,
}

// Rút gọn tên dài cho nhãn biểu đồ
export const shortenLabel = (text = '', max = 24) => (text.length > max ? `${text.slice(0, max - 1)}…` : text)
