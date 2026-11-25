# 4EYEWEAR

Cửa hàng kính mắt trực tuyến: khách xem sản phẩm, đặt hàng COD và gửi tin nhắn hỗ trợ. Admin quản lý sản phẩm, danh mục, đơn hàng, tài khoản, liên hệ và thống kê.

## Chạy locally

```bash
npm install
cp .env.example .env.local  # điền URL và anon key của project Supabase
npm run dev
```

## Supabase

1. Tạo project Supabase mới.
2. Mở **SQL Editor**, dán toàn bộ nội dung `supabase/schema.sql` rồi chạy. File này tạo bảng, RLS và chỉ seed danh mục + sản phẩm — **không có đơn hàng hay khách hàng giả**.
3. Vào **Authentication → Users → Add user**, tạo tài khoản admin bằng email và mật khẩu bạn muốn. Sau đó chạy lệnh này trong SQL Editor (thay email bằng email bạn vừa tạo):

   ```sql
   update public.profiles set role = 'admin' where email = 'admin@cuaHang.com';
   ```

   Nếu bảng `products` vẫn trống, chạy thêm `supabase/seed.sql`.
4. Giữ nguyên các khóa `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` trong `.env.local` (chỉ dùng anon public key, không đưa service_role vào frontend).

## Đăng nhập

- Khách: tự đăng ký tại `/register`.
- Admin: dùng tài khoản đã tạo ở bước trên, vào `/admin`.

## Liên hệ nhóm 4

- Trang `/contact`: khách gửi tin nhắn, xem link Zalo/Facebook/email/hotline.
- `/admin/contacts`: đổi các link này, đọc tin nhắn, lưu phản hồi và xóa tin.

## Deploy

Deploy lên Vercel/Netlify, thêm 2 biến môi trường `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` trong phần Environment Variables. Mọi thiết lập liên hệ và dữ liệu được lưu chung trên Supabase nên cả lớp dùng chung một bản.

## Scripts

- `npm run dev` — chạy dev server
- `npm run build` — build production
- `npm run preview` — xem bản build
