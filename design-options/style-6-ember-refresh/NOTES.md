# QuangDM Portfolio — Design Demo Notes

## Phạm vi

- Demo độc lập tại `design-demo/index.html`; không sửa `../index.html` hoặc bất kỳ tài nguyên hiện có nào.
- Mở trực tiếp bằng double-click (`file://`) được. `games_store.json` được fetch khi chạy qua HTTP; nếu trình duyệt chặn fetch local, demo tự dùng bản dữ liệu inline giống hệt file nguồn.
- Giữ nguyên cấu trúc thông tin, nội dung tiếng Việt, đường dẫn store, thông tin liên hệ, 8 game và 6 playable ads.

## Thay đổi thiết kế theo section

### Navigation

- Thanh điều hướng dạng floating glass, gọn hơn và có active state theo section.
- Menu mobile có thể mở/đóng, CTA liên hệ được giữ ở desktop.

### Hero

- Chuyển sang bố cục editorial hai cột với headline display lớn và key art Arcane Hunter.
- Bổ sung vòng orbit, lưới kỹ thuật, release label và trạng thái sẵn sàng hợp tác.
- CTA, social links và vai trò hiện tại được gom thành hierarchy rõ ràng hơn.

### Về tôi

- Thêm statement ngắn để nối phần giới thiệu với ba trụ cột Game Development / Mobile / Product.
- Card đánh số lớn mờ, border nhẹ và spacing rộng hơn.

### Dự án nổi bật

- Bố cục cinematic 1 card lớn + 2 card phụ, dùng chính thumbnail hiện có.
- Gradient overlay và hover zoom nhẹ giúp chữ luôn đọc rõ trên key art.

### Dự án đã tham gia

- Grid sản phẩm 4/2/1 cột theo desktop/tablet/mobile.
- Android/iOS tabs, số lượng theo nền tảng và fallback local cho `games_store.json`.
- Giữ nguyên đủ 8 sản phẩm và toàn bộ link store.

### Kỹ năng

- Chuyển từ tile nhỏ thành danh sách capability có mô tả ngữ cảnh và badge loại công cụ.
- Giữ nguyên Unity, Cocos Creator và Cloudflare Workers.

### Kinh nghiệm

- Timeline dọc rõ ràng hơn, ưu tiên khả năng đọc trên cả desktop và mobile.
- Vị trí hiện tại có trạng thái `Current` và điểm nhấn màu cam.

### Playable Ads

- Giữ đủ 6 playable và nội dung mô tả thật.
- Mỗi item có khung điện thoại; chỉ load iframe khi người dùng bấm và tự dừng khi ra khỏi viewport, tránh nhiều audio chạy cùng lúc.

### CTA, liên hệ và footer

- CTA có studio mark riêng, nền gradient tinh tế và headline mạnh hơn.
- Contact card đồng nhất, giữ nguyên LinkedIn, Facebook, điện thoại và Gmail.
- Footer tối giản, giữ copyright 2026.

## Art mới

- `art/studio-grid.svg`: lưới kỹ thuật radial trong nền hero.
- `art/studio-mark.svg`: biểu tượng studio hình học dùng làm watermark trong CTA.

Hai file đều là SVG nhẹ, không phụ thuộc dịch vụ ngoài và có thể chỉnh màu trực tiếp trong source.

## CSS tokens để port

### Màu

```css
--ink: #0b0908;
--ink-2: #100d0b;
--panel: #17120f;
--panel-2: #1d1713;
--paper: #f7f2eb;
--muted: #a89c91;
--line: rgba(255,255,255,.1);
--orange: #ff7214;
--amber: #ffad42;
--red: #e84632;
```

### Typography

```css
--display: 'Barlow Condensed', Impact, sans-serif;
--body: 'Be Vietnam Pro', system-ui, sans-serif;
```

- Display: 600/700/800/900; dùng uppercase, line-height 0.78–1.08.
- Body: 300–700; body mặc định 15px/1.65.

### Layout và spacing

```css
--wrap: 1240px;
--radius: 24px;
--ease: cubic-bezier(.2,.75,.25,1);
```

- Container desktop: `min(100% - 48px, 1240px)`; mobile: `100% - 30px`.
- Section desktop: `112px 0`; mobile: `78px 0`.
- Card gaps chính: 10–18px; khoảng cách khối lớn: 42–80px.
- Breakpoints: 980px và 680px.

### Motion và accessibility

- Reveal dùng opacity + translateY 28px, duration 700ms.
- Hover card tối đa translateY 6px; thumbnail scale 1.045–1.05.
- Có `prefers-reduced-motion: reduce`, focusable native controls, heading hierarchy, alt text, `aria-live` cho grid và label cho menu/play buttons.
