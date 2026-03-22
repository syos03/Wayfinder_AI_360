# 🌍 Wayfinder AI - Khám Phá Việt Nam Thông Minh

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-blue?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-orange?style=for-the-badge&logo=google-gemini)](https://ai.google.dev/)

**Wayfinder AI** là nền tảng du lịch hiện đại, kết hợp sức mạnh của trí tuệ nhân tạo (Google Gemini AI) để giúp người dùng lên kế hoạch, khám phá và trải nghiệm vẻ đẹp của Việt Nam một cách thông minh và tối ưu nhất.

---

## 🚀 Tính Năng Nổi Bật

### 🤖 1. AI Trip Planner (Gemini AI)
- Tự động lập lịch trình du lịch chi tiết chỉ trong vài giây.
- Gợi ý dựa trên sở thích cá nhân (ẩm thực, văn hóa, thiên nhiên, phiêu lưu).
- Tối ưu hóa ngân sách và thời gian di chuyển.
- Hỗ trợ lưu bản nháp và chỉnh sửa linh hoạt.

### 🔍 2. Khám Phá Thông Minh
- Hệ thống lọc nâng cao theo tỉnh thành, vùng miền, ngân sách và loại hình du lịch.
- Gợi ý địa điểm "Personalized" (Dành cho bạn) dựa trên hành vi người dùng.
- Mục "Trending" (Đang Hot) với hệ thống xếp hạng và chỉ số phổ biến thời gian thực.

### 🖼️ 3. Trải Nghiệm Thị Giác & AR
- Chế độ xem **AR 360° Scope** cho phép trải nghiệm thực tế ảo các điểm đến ngay trên trình duyệt.
- Thư viện hình ảnh chất lượng cao với tính năng **Performance Optimization** (Tự động tối ưu dung lượng, WebP, Lazy Load).
- Giao diện **Premium Uniform Style** với chủ đề màu xanh chuyên nghiệp, hiện đại.

### 📱 4. Progressive Web App (PWA)
- Cài đặt như ứng dụng di động trên iOS/Android.
- Trải nghiệm mượt mà, hỗ trợ offline cơ bản và thông báo.

---

## 🛠️ Công Nghệ Sử Dụng

| Thành phần | Công nghệ |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), Tailwind CSS 4, Framer Motion |
| **Backend** | Next.js API Routes, Node.js |
| **Database** | MongoDB Atlas, Mongoose |
| **AI Engine** | Google Gemini 1.5 Pro/Flash |
| **Giao diện** | Lucide Icons, Shadcn UI components |
| **Tiện ích** | PostHog (Analytics), Resend (Transactional Email), Cloudinary (Images) |

---

## 🛠️ Hướng Dẫn Cài Đặt

### 1. Clone repository
```bash
git clone https://github.com/your-repo/wayfinder-web.git
cd wayfinder-web
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình biến môi trường
Tạo file `.env.local` và thêm các thông tin sau:
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_maps_key
RESEND_API_KEY=your_resend_key
```

### 4. Chạy ứng dụng
```bash
npm run dev
```
Truy cập: `http://localhost:3001`

---

## ⚡ Tối Ưu Hiệu Năng
Dự án sử dụng giải pháp **SafeImage** tùy chỉnh:
- Tự động chuyển đổi sang định dạng WebP.
- Resize ảnh phù hợp với thiết bị.
- Cơ chế Fallback thông minh khi nguồn ảnh bên ngoài gặp sự cố.
- Ưu tiên hiển thị (Priority loading) cho các nội dung quan trọng.

---

## 📧 Liên Hệ
Nếu bạn có bất kỳ câu hỏi hoặc đóng góp nào, vui lòng liên hệ:
- **Email**: [hancfm@gmail.com]
- **Website**: [wayfinder.vn](https://localhost:3001)

---
*Phát triển bởi đội ngũ Wayfinder AI - Chúc bạn có những chuyến đi tuyệt vời!* 🇻🇳
