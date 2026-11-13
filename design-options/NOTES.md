# QuangDM portfolio — design options

Mở `design-options/index.html` bằng trình duyệt để xem gallery, sau đó chọn từng phương án. Mỗi homepage dùng cùng nội dung thật và tải `../../games_store.json`; khi mở trực tiếp bằng `file://` và trình duyệt chặn `fetch`, dữ liệu fallback tám game trong `design-options/app.js` sẽ tự động được dùng.

## 01 — Neon Arcade

- Mood: cyberpunk arcade, HUD góc cạnh, scanline và glow.
- Fonts: Orbitron + Chakra Petch.
- Palette: `#050610`, cyan `#00f6ff`, magenta `#ff2bd6`, lime `#bdff38`.
- Motion: vòng HUD quay, reveal nghiêng như tín hiệu vào màn hình.
- Art: `style-1-neon-arcade/art/cyber-grid.svg`.

## 02 — Sticker Playground

- Mood: cartoon vui nhộn, card bo tròn, nét viền chunky, sticker lệch tự nhiên.
- Fonts: Baloo 2 + Nunito.
- Palette: cream `#fff9e9`, pink `#ff6fae`, yellow `#ffd74a`, aqua `#6ed5e7`, green `#82dc91`.
- Motion: blob morph/wobble, card reveal xoay nhẹ.
- Art: `style-2-sticker-playground/art/sticker-doodles.svg`.

## 03 — Editorial Paper

- Mood: portfolio tạp chí tối giản, nhiều khoảng trắng và cấu trúc thông tin rõ.
- Fonts: Playfair Display + Manrope + DM Mono.
- Palette: paper `#f2f0ea`, ink `#151515`, editorial red `#d43d2f`.
- Motion: wipe reveal theo chiều ngang, ảnh từ monochrome sang màu khi hover.
- Art: `style-3-editorial-paper/art/editorial-lines.svg`.

## 04 — Pixel Console

- Mood: console 8-bit, khung pixel, UI như màn hình chọn game.
- Fonts: Pixelify Sans + VT323.
- Palette: navy `#171738`, cream `#fff1bf`, orange `#ff9f43`, green `#74e06d`, blue `#5cc8ff`.
- Motion: stepped reveal, sprite-like radial spinner và nút nhấn vật lý.
- Art: `style-4-pixel-console/art/pixel-sky.svg`.

## 05 — Aurora Glass

- Mood: hiện đại, premium, mềm và không gian; glassmorphism trên aurora sâu.
- Fonts: Space Grotesk + Outfit.
- Palette: deep `#080b19`, violet `#a98bff`, mint `#67f5cd`, pink `#ff7bc8`.
- Motion: blob morph chậm, reveal blur-to-focus và card float.
- Art: `style-5-aurora-glass/art/aurora-mesh.svg`.

## 07 — 3D World

- Mood: trạm không gian tương lai, chiều sâu kiểu hologram và một vòng gallery 3D tám mặt.
- Fonts: Outfit + Space Mono.
- Palette: space `#060816`, violet `#8b7cff`, cyan `#43e7e0`, pink `#ff6fcf`, lime `#c9ff66`.
- Navigation: dock, click panel, kéo/vuốt, phím mũi tên và mouse wheel theo từng trạm; toàn trang cố định trong `100dvh`, không có page scroll.
- Collections: Featured, store Android/iOS và Playable Ads dùng carousel/pagination trong trạm để luôn vừa màn hình.
- Accessibility: nội dung và link là DOM thật; có trạng thái focus, modal iframe, `prefers-reduced-motion` và flat paged fallback nếu CSS 3D không khả dụng.
- Art: `style-7-3d-world/art/starmap.svg`.

## Shared behavior

`base.css` cung cấp responsive foundation; `app.js` giữ nội dung và behavior chung để năm concept không lệch dữ liệu. Các trang có menu mobile, tab Android/iOS, modal playable ads, lazy-loaded thumbnail, focusable links/buttons và fallback store data khi chạy offline.

## Archive

- `style-0-original/` — thiết kế gốc của trang (trước lần làm mới đầu tiên), lưu lại để tham khảo.
- `style-6-ember-refresh/` — bản làm mới nhẹ giữ nhận diện cam–đen (từng là trang chính), kèm `NOTES.md` riêng.

## Trang chính hiện tại

Trang chính (`../index.html`) dùng style **Sticker Playground** (`style-2-sticker-playground/`), được gộp thành một file duy nhất; art nằm trong `../art/sticker-doodles.svg`.

## 08 — 3D Sticker

- Mood: Sticker Playground trong một căn phòng 3D sáng, với card giấy nổi, viền navy chunky và bóng đổ cứng.
- Fonts: Baloo 2 + Nunito.
- Palette: cream `#fff9e9`, ink `#252037`, pink `#ff6fae`, yellow `#ffd74a`, aqua `#6ed5e7`, green `#82dc91`.
- Navigation: vòng tám trạm 3D, dock sticker, panel lân cận có thể bấm, wheel từng bước, kéo/vuốt và phím mũi tên/Home/End; không có cuộn dọc trang.
- Collections: Featured, Android/iOS projects và Playable Ads có phân trang nội bộ; playable mở trong dialog hoặc tab toàn màn hình.
- Motion: chuyển trạm với easing nảy, doodle nhiều lớp có parallax; tự chuyển sang giao diện phẳng khi thiếu CSS 3D hoặc khi người dùng bật reduced motion.
- Responsive: toàn bộ nội dung nằm trong viewport, doodle luôn sau content và được ẩn/thu nhỏ trên màn hình hẹp.
- Art: `style-8-3d-sticker/art/cloud-sticker.svg` và `style-8-3d-sticker/art/world-doodles.svg`.
