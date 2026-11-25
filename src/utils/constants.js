// Trạng thái đơn hàng theo đúng yêu cầu của dự án
export const ORDER_STATUSES = ['Chờ xác nhận', 'Đã xác nhận', 'Đang giao hàng', 'Đã giao hàng', 'Đã hủy']

// Thứ tự các bước giao hàng để hiển thị thanh tiến trình
export const STATUS_FLOW = ['Chờ xác nhận', 'Đã xác nhận', 'Đang giao hàng', 'Đã giao hàng']

// Chỉ đơn ở trạng thái này mới được khách tự hủy
export const CUSTOMER_CANCELLABLE_STATUS = 'Chờ xác nhận'

export const PAYMENT_METHOD_LABEL = 'Thanh toán khi nhận hàng (COD)'
