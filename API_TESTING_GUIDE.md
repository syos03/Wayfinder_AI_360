# Hướng Dẫn Kỹ Thuật: Automation API Testing (Playwright)

Tài liệu này hướng dẫn chi tiết cách vận hành, bảo trì và viết mới các kịch bản kiểm thử tự động (Automation Test) cho hệ thống API của dự án Wayfinder sử dụng **Playwright**.

---

## 1. Cấu Trúc Thư Mục Testing

Toàn bộ source code phục vụ kiểm thử nằm trong thư mục `tests/api/`:

```text
wayfinder-web/
 ├── playwright.config.ts        # File cấu hình chính của Playwright (Timeout, Parallel Workers, WebServer...)
 └── tests/
      └── api/
           ├── .auth/            # (Tự sinh) Chứa file session token json của global-setup
           ├── global-setup.ts   # Kịch bản chạy 1 lần duy nhất trước khi test để khởi tạo User rác
           ├── test-helper.ts    # Các hàm tiện ích dùng chung (Lấy Token, Tìm ID...)
           ├── 01-auth.spec.ts   # Test kịch bản Đăng ký, Đăng nhập
           ├── 02-destinations...# Test danh sách Điểm đến
           └── ...               # Các file test module khác (được đánh số thứ tự)
```

---

## 2. Cách Chạy Test

Để chạy bộ kiểm thử, bạn mở Terminal (Command Prompt / PowerShell / VS Code Terminal) tại thư mục gốc của dự án (`wayfinder-web`) và dùng các lệnh sau:

### Chạy toàn bộ Test E2E (Chế độ ẩn - Headless)
```bash
npm run test:e2e
```
*Lệnh này sẽ tự động bật Next.js server (`npm run dev`) ở background (nếu chưa chạy) và bắn request kiểm tra 50+ kịch bản cùng lúc.*

### Chạy Test có giao diện theo dõi (UI Mode)
```bash
npx playwright test --ui
```
*Giao diện UI của Playwright sẽ hiện ra, cho phép bạn bấm chạy từng luồng, xem chi tiết Request/Response Body, Header và Console log của từng Test Case.*

### Chạy 1 file Test cụ thể
Nếu bạn chỉ đang sửa module Favorites và không muốn chạy toàn bộ 50 Test Cases, hãy chỉ định tên file:
```bash
npx playwright test tests/api/03-favorites.spec.ts
```

---

## 3. Quy Tắc Viết Code Test Mới

Dự án Wayfinder Backend sử dụng **Strict HTTP-Only Cookie** cho việc xác thực (Authentication). Do đó, Playwright **không thể** nhồi trực tiếp Header `Authorization: Bearer <token>` vào request mà bắt buộc API Context phải lưu được Cookie `auth-token`.

Khi viết Test Case mới cho 1 API yêu cầu Đăng Nhập, bạn **bắt buộc** phải tuân thủ pattern sau:

### Pattern Chuẩn (Import Token Helper)

Sử dụng hàm `getAuthToken()` (cho User thường) hoặc `getAdminToken()` (cho Admin User) từ file `test-helper.ts`.

```typescript
import { test, expect } from '@playwright/test';
import { getAuthToken } from './test-helper';

test.describe('Module Name', () => {

    test('Tên Test Case - VD: Tạo mới Item', async ({ request }) => {
        // 1. Phải Get Token trước để Playwright RequestContext tự động "ngậm" Cookie
        const authToken = await getAuthToken(request);
        
        // 2. Kiểm tra điều kiện tiên quyết (Nếu không lấy được token thì skip test)
        test.skip(!authToken, 'Không thể lấy Auth Token');

        // 3. Gọi API thực tế (Không cần truyền Bearer Header, Cookie đã tự đính kèm)
        const response = await request.post('/api/your-module', {
            data: { 
                title: "Test Item", 
                content: "Data" 
            }
        });

        // 4. Kiểm tra kết quả
        expect(response.status()).toBe(201); // Hoặc 200
        const body = await response.json();
        expect(body.success).toBe(true);
    });

});
```

---

## 4. Những Lưu Ý Quan Trọng (Troubleshooting)

Trong quá trình bảo trì Test Script, nếu bạn gặp lỗi Fail (`400`, `401`, `404`, `500`), hãy kiểm tra các nguyên nhân phổ biến sau:

### Lỗi 401 Unauthorized (Dù đã Get Token)
- **Nguyên nhân:** Quá trình gọi API có thể làm Context bị mất Cookie. Ví dụ: Bạn gọi 1 API `public` (không cần auth) ngay TRƯỚC khi gọi API `private`. Hành động gọi public GET có thể reset HTTP Client Cookie.
- **Cách fix:** Luôn gọi `getAuthToken(request)` ngay sát phía trên (TRƯỚC) lệnh gọi API private để bảo vệ Session Cookie.

### Lỗi Concurrency VersionError của Mongoose (Database)
- **Nguyên nhân:** Playwright mặc định chia 6 luồng worker chạy song song. Nếu tất cả cùng login vào `admin@wayfinder.ai` cùng 1 mili-giây, MongoDB sẽ khóa bản ghi do hàm login có thực hiện lưu `lastLogin = new Date()`.
- **Cách fix:** Hàm `getAdminToken` trong `test-helper.ts` đã được thiết kế vòng lặp Retry x3 lần với Delay ngẫu nhiên để chống nghẽn. Không nên tự viết lại logic Login cho cấu hình Admin.

### Sai Route HTTP Method
- Lỗi `404 Not Found` thường xảy ra do gọi sai Method hoặc sai tham số đường dẫn.
- **Lưu ý định dạng API Của Wayfinder:** Rất nhiều Route thao tác Update trạng thái như: Ban người dùng (`/api/admin/users/[id]`), Duyệt Review (`/api/admin/reviews/[id]`), Update Destination... đều sử dụng Method **`PATCH`** thay vì `PUT`.

### Lỗi Quota Timeout (AI Planner)
- Khai thác AI Route qua Gemini cần thời gian phản hồi API Server rất lâu (trên 15 giây).
- **Cách fix:** Luôn cấu hình quá thời gian Timeout cục bộ ở đầu test case AI bằng lệnh: `test.setTimeout(60000); // 60 giây`. Tùy chọn accept cả code `500` vì Gemini API thỉnh thoảng sẽ bị Google chặn do Rate Limit tài khoản miễn phí.

---

Chúc bạn có những luồng kiểm thử mượt mà và chất lượng Xanh 100%! 🚀
