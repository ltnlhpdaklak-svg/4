-- Chạy file này trong Supabase SQL Editor nếu bạn đã chạy schema.sql nhưng bảng sản phẩm trống.
-- Nó chỉ tạo lại danh mục + sản phẩm. KHÔNG tạo đơn hàng hay khách giả.

insert into public.categories (id, name, slug, icon, description) values
  ('cat-kinh-ram', 'Kính râm', 'kinh-ram', 'Sun', 'Bảo vệ mắt khỏi nắng, phong cách thời trang.'),
  ('cat-kinh-can', 'Kính cận', 'kinh-can', 'Eye', 'Gọng và tròng cận, cắt theo độ.'),
  ('cat-gong-kinh', 'Gọng kính', 'gong-kinh', 'Glasses', 'Gọng kính thời trang cho mọi khuôn mặt.'),
  ('cat-kinh-the-thao', 'Kính thể thao', 'kinh-the-thao', 'Dumbbell', 'Kính ôm sát khi chạy bộ, đạp xe.'),
  ('cat-kinh-tre-em', 'Kính trẻ em', 'kinh-tre-em', 'Baby', 'Gọng dẻo, an toàn cho bé.'),
  ('cat-phu-kien', 'Phụ kiện', 'phu-kien', 'Sparkles', 'Hộp đựng, dây đeo và phụ kiện kính.')
on conflict (id) do nothing;

insert into public.products (id, category_id, name, slug, description, price, sale_price, image_url, stock, is_active) values
  ('p1', 'cat-kinh-ram', 'Kính râm Aviator gọng vàng', 'kinh-ram-aviator-vang', 'Gọng kim loại mạ vàng, tròng phân cực giảm chói.', 1290000, 990000, '/products/p1.svg', 25, true),
  ('p2', 'cat-kinh-ram', 'Kính râm Wayfarer đen', 'kinh-ram-wayfarer-den', 'Gọng nhựa dẻo nhẹ, chống tia UV400.', 890000, null, '/products/p2.svg', 40, true),
  ('p3', 'cat-kinh-ram', 'Kính râm tròn retro nâu', 'kinh-ram-tron-retro-nau', 'Gọng tròn phong cách retro, tròng nâu gradient.', 790000, 590000, '/products/p3.svg', 18, true),
  ('p4', 'cat-gong-kinh', 'Gọng kính vuông titan bạc', 'gong-kinh-vuong-titan-bac', 'Titan siêu nhẹ, đeo lâu không mỏi.', 1190000, null, '/products/p4.svg', 30, true),
  ('p5', 'cat-gong-kinh', 'Gọng kính tròn acetate xanh navy', 'gong-kinh-tron-acetate-xanh-navy', 'Acetate cao cấp, màu xanh navy trầm.', 690000, 549000, '/products/p5.svg', 12, true),
  ('p6', 'cat-gong-kinh', 'Gọng kính vuông acetate đỏ rượu', 'gong-kinh-vuong-acetate-do-ruou', 'Gọng acetate đỏ rượu, dáng vuông cá tính.', 850000, null, '/products/p6.svg', 0, false),
  ('p7', 'cat-kinh-can', 'Kính cận wayfarer hồng pastel', 'kinh-can-wayfarer-hong-pastel', 'Gọng nhẹ màu hồng pastel, cắt tròng theo độ.', 720000, 650000, '/products/p7.svg', 22, true),
  ('p8', 'cat-kinh-can', 'Kính cận vuông đen mỏng', 'kinh-can-vuong-den-mong', 'Gọng kim loại đen mỏng, tròng chống ánh sáng xanh.', 560000, null, '/products/p8.svg', 35, true),
  ('p9', 'cat-kinh-the-thao', 'Kính thể thao ôm sát xanh dương', 'kinh-the-thao-om-sat-xanh-duong', 'Thiết kế ôm sát khi chạy bộ và đạp xe.', 1490000, 1190000, '/products/p9.svg', 14, true),
  ('p10', 'cat-kinh-tre-em', 'Kính trẻ em tròn dẻo xanh lá', 'kinh-tre-em-tron-deo-xanh-la', 'Gọng silicone dẻo, có dây đeo điều chỉnh.', 350000, 290000, '/products/p10.svg', 50, true),
  ('p11', 'cat-kinh-tre-em', 'Kính trẻ em vuông vàng', 'kinh-tre-em-vuong-vang', 'Gọng nhựa dẻo màu vàng tươi.', 320000, null, '/products/p11.svg', 3, true),
  ('p12', 'cat-phu-kien', 'Hộp đựng kính cứng', 'hop-dung-kinh-cung', 'Hộp cứng chống va đập, lót nỉ mềm.', 120000, 99000, '/products/p12.svg', 60, true)
on conflict (id) do nothing;

-- Đặt lại bộ đếm về 0 (chưa có khách mua nào).
update public.products set sold_count = 0, view_count = 0;
