# LMS — Khóa luận / Đồ án

Dự án gồm **backend REST API** (`doan_be-main`) và **SPA React** (`doan_fe-main`) cho học LMS: khóa học, enrollment, curriculum, học trực tuyến, tiến độ và kết quả quiz.

## Kiến trúc

| Thành phần | Công nghệ |
|------------|-----------|
| Backend | Node.js, Express 5, TypeScript, PostgreSQL (`pg`), tsyringe, JWT + cookie (`access_token`, `refresh_token`) |
| Frontend | React 19, Vite, TypeScript, Ant Design 6, Tailwind 4, Zustand |
| Storage (tùy chọn) | MinIO — ảnh khóa học, upload video |

- API gốc: `http://localhost:8096/api` (đổi theo biến `PORT`).
- Giao diện dev Vite (mặc định): `http://localhost:5173`.

## Cấu trúc thư mục

```
DTHang/
├── package.json           # (tuỳ chọn) ủy quyền db:migrate / db:seed vào doan_be-main
├── doan_be-main/          # Backend
│   ├── database/migrations/
│   ├── scripts/           # migrate-db.ts, seed-demo.ts
│   └── src/
├── doan_fe-main/          # Frontend
│   └── src/
└── README.md
```

## Yêu cầu môi trường

- Node.js 20+ (ưu tiên LTS đã cài trong máy dự án; Vite 6 chạy được với các bản 20.11+, không yêu cầu đúng 20.19 như Vite 8)
- PostgreSQL 14+
- MinIO (nếu dùng upload thumbnail / video theo cấu hình hiện tại)

## Backend (`doan_be-main`)

### Cài đặt

```powershell
cd doan_be-main
npm install
```

### Biến môi trường

Tạo file `.env` trong **`doan_be-main`** (script migrate/seed đọc từ đây).Tham khảo các biến sau (điền giá trị thật của bạn, không commit mật khẩu):

| Biến | Mô tả |
|------|------|
| `PORT` | Cổng HTTP (mặc định `8096`) |
| `DB_HOST`, `DB_PORT`, `DB_NAME` | Postgres |
| `DB_USER` / `DB_USERNAME` | User DB (ưu tiên `DB_USERNAME`, fallback `DB_USER`) |
| `DB_PASSWORD` | Mật khẩu DB |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Ký JWT |
| `JWT_REFRESH_SECRET` và các JWT khác | Theo `config.ts` |
| `MINIO_ENDPOINT`, `MINIO_PORT` (API lưu trữ **9000**, khác Postgres), `MINIO_ACCESS_KEY`, … | MinIO |

`MINIO_DISABLED=true` để **không kết nối MinIO** (server vẫn chạy; upload ảnh/video sẽ lỗi nếu gọi API upload).

> **Lưu ý:** `src/app.ts` dùng `dotenv.config({ path: "../.env" })` (thư mục cha của `doan_be-main`). Đặt một file `.env` tương thích với đường dẫn đó khi chạy `npm start`, hoặc chỉnh `path` trỏ tới `./.env` trong `doan_be-main` cho thống nhất với migration.

### Cơ sở dữ liệu

Từ **`D:\DTHang`** (nếu đã có `package.json` gốc) hoặc từ **`doan_be-main`**:

```powershell
# Cách 1 — từ gốc repo DTHang (sau khi npm install trong doan_be-main)
cd D:\DTHang
npm run db:migrate
npm run db:seed

# Cách 2 — trực tiếp backend
cd doan_be-main
npm run db:migrate
npm run db:seed
```

Migration `V021_seed_learning_paths_and_reviews.sql` chèn combo lộ trình + đánh giá mẫu **nếu** các khóa/tài khoản demo đã có; script seed (`npm run db:seed`) đọc cùng file đó sau khi chèn khóa demo để luôn có dữ liệu đúng thứ tự. Script seed còn thêm **5 khóa** chủ đề kỹ năng học, kỹ năng mềm, chuẩn bị nghề, định hướng nghề, kỹ năng số & AI (đều `published`, giá 0). Seed có thể `--purge`/mật khẩu demo — xem `scripts/seed-demo.ts`.

Migration `V022_fn_list_published_courses_catalog.sql` thêm hàm SQL `fn_list_published_courses` phục vụ API công khai **`POST /course/catalog-published`** (phân trang danh khóa `published`).
### Chạy server

```powershell
cd doan_be-main
npm start
```

CORS được cấu hình cho các origin localhost Vite trong `src/app.ts`; khi deploy, cập nhật danh sách origin cho khớp domain FE.

---

## Frontend (`doan_fe-main`)

### Cài đặt

```powershell
cd doan_fe-main
npm install
```

### Biến môi trường

Tạo `.env` (hoặc `.env.local`) với ví dụ:

```env
VITE_API_URL=http://localhost:8096/api
```

Nếu không đặt, client mặc định `http://localhost:8096/api` trong `apiClient.service.ts`.

Đăng nhập dùng cookie HTTP-only từ API; FE gọi axios với `withCredentials: true`.

### Dev / build

```powershell
cd doan_fe-main
npm run dev
npm run build
npm run preview
```

- **`npm run build`** chạy `tsc -b` trước `vite build`. Nếu TypeScript báo lỗi (unused imports, v.v.) nhưng bạn chỉ cần bản đóng gói để demo, có thể dùng **`npm run build:bundle`** (chỉ Vite, không chạy `tsc`).
- Dự án dùng **Vite 6** để tránh yêu cầu Node 20.19+ của Vite 8; Node **20 LTS** như **20.11.x** có thể dùng bình thường (`vite build`, `vite preview`).

**Trang quản trị:** `http://localhost:5173/admin` (tự chuyển tới `/admin/v1/courses`) hoặc đăng nhập admin tại `/auth/admin/login`.

## Luồng nghiệp vụ chính (ôn nhanh)

- Danh mục & chi tiết khóa, enroll, wishlist.
- Curriculum: đồng bộ và hiển thị trên trang học `/learning?courseId=…`.
- Tiến độ: API `POST /course/update-lesson-progress`, làm quiz/exam: `POST /course/submit-quiz-attempt`, tải trạng thái đã học: `POST /course/my-lesson-progress` (cần JWT + đã enroll).

Đầy đủ định nghĩa route nằm trong `doan_be-main/src/routes/`.

---

## Troubleshooting

- **Không nhận được cookie đăng nhập:** Kiểm tra CORS (`credentials`, origin), và domain/port khớp giữa FE và BE.
- **Migration lỗi kết nối:** Kiểm tra `.env` trong `doan_be-main` và quyền user Postgres.
- **Lỗi `ETIMEDOUT ... port 9000`:** đó là **MinIO**, không phải Postgres (PostgreSQL là **5432**). Firewall / VPS chưa mở 9000, MinIO không chạy, hoặc đặt `MINIO_DISABLED=true` khi chỉ dev API + DB không cần upload.
---

## Giấy phép / tác giả

Theo đồ án của nhóm của bạn (cập nhật họ tên, mã đề khi làm báo cáo).
