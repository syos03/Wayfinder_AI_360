# 🚀 Hướng dẫn Triển khai Wayfinder AI lên Vercel

Vì dự án đã được đẩy lên GitHub, việc triển khai lên Vercel sẽ rất đơn giản và tự động đồng bộ mỗi khi bạn push code mới.

## 1. Các bước thực hiện trên Dashboard Vercel

1. **Truy cập**: [vercel.com](https://vercel.com) và đăng nhập bằng tài khoản GitHub.
2. **Import Project**: 
   - Nhấn **"Add New"** -> **"Project"**.
   - Tìm repository `Wayfinder_AI_360` và nhấn **"Import"**.
3. **Cấu hình Framework**: Vercel sẽ tự động nhận diện đây là dự án **Next.js**. Giữ nguyên các thiết lập mặc định.
4. **Cấu hình Biến môi trường (Environment Variables)**: Đây là bước quan trọng nhất. Hãy copy các giá trị từ file `.env.local` của bạn vào mục **Environment Variables** trên Vercel.

## 2. Danh sách Biến môi trường cần thiết

Bạn cần thêm các biến sau vào mục **Environment Variables** trong quá trình cấu hình trên Vercel:

| Key | Value (Lấy từ .env.local) | Ghi chú |
| :--- | :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://...` | Kết nối cơ sở dữ liệu MongoDB Atlas |
| `JWT_SECRET` | `W1+m...` | Khóa bảo mật cho token đăng nhập |
| `GEMINI_API_KEY` | `AIzaSy...` | API Key cho AI Trip Planner |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | `AIzaSy...` | API Key cho bản đồ và AR 360 |
| `RESEND_API_KEY` | `re_...` | API Key để gửi email |
| `RESEND_FROM_EMAIL` | `hancfm@gmail.com` | Email gửi đi |
| `NEXT_PUBLIC_POSTHOG_KEY` | `phc_...` | Key cho Analytics (nếu dùng) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `1703...` | Google Client ID cho đăng nhập |
| `NEXT_PUBLIC_APP_URL` | `https://your-app-name.vercel.app` | URL trang web của bạn sau khi deploy |

## 3. Lưu ý Quan trọng

- **MongoDB Atlas Whitelist**: Bạn cần vào trang quản trị MongoDB Atlas -> **Network Access** -> Thêm `0.0.0.0/0` (Allow access from anywhere) để Vercel có thể kết nối tới Database (vì Vercel sử dụng IP động).
- **Node.js Version**: Vercel sẽ tự động chọn phiên bản phù hợp dựa trên `package.json`.
- **Build Command**: Vercel sẽ tự chạy `npm run build`.

## 4. Kiểm tra sau khi Deploy
Sau khi nhấn **"Deploy"**, đợi khoảng 2-3 phút. Khi hoàn tất, Vercel sẽ cung cấp cho bạn một URL (ví dụ: `wayfinder-ai-360.vercel.app`). Hãy truy cập và kiểm tra:
1. Đăng nhập/Đăng ký.
2. Tạo kế hoạch bằng AI.
3. Xem các điểm đến và ảnh 360.

---
*Nếu gặp bất kỳ lỗi nào trong quá trình Build, hãy kiểm tra tab **Logs** trên Vercel để xem chi tiết nhé!*
