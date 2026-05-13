# Chức năng & màn hình — LMS DTHang

Tài liệu mô tả **luồng người dùng**, **URL**, **chức năng chính** của SPA (`doan_fe-main`) và **nhóm API** hỗ trợ (`doan_be-main`). Base API mặc định: `/api` (ví dụ `http://localhost:8096/api`).

---

## 1. Vai trò & bảo vệ route

| Vai trò | Điều kiện | Ghi chú |
|--------|-----------|---------|
| **Khách** | Chưa đăng nhập | Xem trang chủ, giới thiệu, chi tiết khóa học (public). |
| **Học viên / đã đăng nhập** | Cookie session + `/auth/me` | Dashboard học viên, khóa của tôi, wishlist, hồ sơ, học trực tuyến. |
| **Admin** | Đăng nhập + role `admin` trong profile | Toàn bộ `/admin/*`. |

**Guard frontend:**

- `ProtectedRoute`: chưa đăng nhập → `/auth/login` (kèm `state.from`).
- `AdminProtectedRoute`: chưa đăng nhập → `/auth/admin/login`; không đủ quyền → `/auth/admin/login` với `state.forbidden`.

---

## 2. Khu vực công khai (Main layout)

Layout: header/footer site (`MainLayout`). Không yêu cầu đăng nhập trừ các route được đánh dấu.

| URL | Màn hình | Chức năng chính |
|-----|---------|------------------|
| `/` | **Trang chủ** (`HomePage`) | Hero/carousel, khóa nổi bật, giới thiệu ngắn, điều hướng tới khóa học. |
| `/about` | **Giới thiệu** (`AboutPage`) | Nội dung giới thiệu nền tảng/khoa. |
| `/learning-paths` | **Lộ trình / combo** (`LearningPaths`) | Danh sách gói `learning_paths` (theo nhóm đối tượng); mua combo ghi danh đầy đủ các khóa trong gói (demo thanh toán). |
| `/courses` | **Danh sách khóa** (`CoursesCatalog`) | Catalogue công khai, phân trang + tìm kiếm server qua `catalog-published` (chỉ khóa đã xuất bản). |
| `/courses/:course_id` | **Chi tiết khóa** (`CourseDetail`) | Thông tin khóa; **miễn phí** ghi danh **full** / **khóa trả phí**: **mua**, **học thử** (bài Preview), wishlist; **tiến độ** và **Hoàn thành** trong enrollment-meta; tab **Đánh giá** (danh sách + gửi review khi có quyền học đầy đủ hoặc khóa free). Curriculum theo trial/full (API `getCurriculum` + enrollment). |

---

## 3. Xác thực học viên

| URL | Màn hình | Chức năng |
|-----|---------|-----------|
| `/auth/login` | **Đăng nhập** (`AuthPage`) | Đăng nhập email/mật khẩu, JWT cookie, redirect về `state.from` hoặc site. |

*(Đăng ký nếu có thể triển khai qua API `/auth/register` — kiểm tra UI project.)*

---

## 4. Học viên (đã đăng nhập, Main layout)

| URL | Màn hình | Chức năng |
|-----|---------|-----------|
| `/dashboard` | **Bảng điều khiển học viên** (`DashboardPage`) | Chào user, thống kê nhanh (đăng ký, tiến độ), tiếp tục học, wishlist rút gọn, **chứng chỉ** (mới nhất), gợi ý khóa nổi bật. |
| `/my-courses` | **Khóa của tôi** (`MyCourses`) | Danh sách đã ghi danh, **tag Học thử / Đầy đủ** (`access_kind`), lọc đang học/hoàn thành, tìm kiếm, tiến độ %, vào học. |
| `/my-courses/wishlist` | **Wishlist** (`Wishlist`) | Khóa đã lưu, tìm kiếm, xem chi tiết. |
| `/profile` | **Hồ sơ** (`Profile`) | Thông tin cá nhân / cập nhật profile (theo API hiện có). |

**Menu:** Header có **Lộ trình / Combo** (`/learning-paths`, công khai). Khi đã login: Bảng điều khiển, Khóa học của tôi, Yêu thích (`MainLayout`).

---

## 5. Học trực tuyến (full màn hình, có login)

| URL | Màn hình | Chức năng |
|-----|---------|-----------|
| `/learning?courseId=…` | **Học khóa** (`CourseLearningPage`) | Sidebar chương/bài; nội dung bài: video, tài liệu, quiz/exam; lưu tiến độ bài/quiz; header điều hướng. |

Phụ thuộc API: curriculum, `my-lesson-progress`, `update-lesson-progress`, `submit-quiz-attempt`, v.v.

---

## 6. Quản trị (Admin layout)

Layout: sidebar + header (`AdminLayout`). **Chỉ role admin.**

| URL | Màn hình | Chức năng |
|-----|---------|-----------|
| `/admin` | *(redirect)* | → `/admin/dashboard` |
| `/admin/dashboard` | **Tổng quan admin** (`AdminDashboard`) | Thống kê (khóa, user, ngành, danh mục), đường tắt, bảng khóa cập nhật gần đây. |
| `/admin/v1` | *(redirect)* | → `/admin/v1/courses` |
| `/admin/v1/courses` | **Quản lý khóa học** (`CourseManagement`) | CRUD khóa, trạng thái draft/published, upload thumbnail, gắn danh mục/chuyên ngành. |
| `/admin/v1/lesson-management` | **Chọn khóa / bài giảng** (`CourseContentPage`) | Chọn khóa, vào chỉnh nội dung curriculum. |
| `/admin/v1/lesson-detail` | **Chi tiết bài** (legacy route) (`CourseContentManagement`) | Quản lý nội dung theo khóa (tuỳ luồng). |
| `/admin/v1/courses/:courseId/contents` | **Nội dung khóa** (`CourseContentManagement`) | Section/lesson: video, doc, quiz/exam; đồng bộ curriculum. |
| `/admin/v1/user-management` | **Người dùng** (`UserManagement`) | Danh sách user (API list-user), modal/lọc (theo UI). |
| `/admin/v1/role-management` | **Vai trò** (`RoleManagement`) | Quản lý role (API list-role / tích hợp admin). |
| `/admin/v1/major-management` | **Chuyên ngành** (`MajorManagement`) | CRUD chuyên ngành. |
| `/admin/v1/category-management` | **Danh mục** (`CategoryManagement`) | CRUD danh mục. |
| `/admin/v1/profile` | **Hồ sơ admin** (`AdminProfile`) | Thông tin admin. |

### Đăng nhập admin

| URL | Màn hình | Chức năng |
|-----|---------|-----------|
| `/auth/admin/login` | **Admin login** (`AuthAdmin`) | Đăng nhập; kiểm tra role admin; không đủ quyền thì logout + thông báo; redirect `/admin/dashboard`. |

---

## 7. Nhóm API backend (tham chiếu chức năng)

Prefix: `/api`.

### `/api/auth`

- `login`, `register`, `refresh`, `logout`, `logout-all`, `me`, `list-user`, `list-role`, `create-role` (chi tiết quyền theo middleware từng route).

### `/api/course`

- Quản trị (thường cần auth): tạo/sửa/xóa khóa, publish/archive, upload video, `get-curriculums`, `sync-curriculum`, `list-course`.
- Catalog / học viên: **`catalog-published`** (công khai, phân trang + lọc/tìm chỉ khóa `published`; body: `search`, `major_ids`, `category_ids`, `page`, `page_size`, tối đa 100/item trang), `get-popular-course`, `course-detail`, `enroll`, `purchase-course`, `start-trial`, `purchase-bundle`, `list-learning-paths`, `course-reviews`, `submit-review`, `my-certificates`, `my-enrollments`, `enrollment-status` (optional auth), wishlist add/remove/list, curriculum theo trial/full, `update-lesson-progress`, `submit-quiz-attempt`, `my-lesson-progress`.

### `/api/major`, `/api/category`

- Danh sách / tạo / sửa / xóa chuyên ngành và danh mục (theo router tương ứng).

---

## 8. Luồng sử dụng tóm tắt

1. **Khách** → Trang chủ / **Lộ trình & combo** / xem chi tiết khóa → Đăng nhập → Ghi danh miễn phí / **mua / học thử** / wishlist.
2. **Học viên** → Dashboard (tiến độ, **chứng chỉ**) → Khóa của tôi (**thẻ Học thử / Đầy đủ**) → **Học** (`/learning?courseId=…`) → Tiến độ được lưu (trial chỉ bài preview).
3. **Admin** → `/auth/admin/login` → `/admin/dashboard` → Quản lý khóa → Nội dung khóa (`…/courses/:id/contents`) → Người dùng / ngành / danh mục.

---

## 9. File định tuyến chính (frontend)

- `doan_fe-main/src/routes/index.tsx` — định nghĩa toàn bộ URL và guard.

*Tài liệu phản ánh kiến trúc hiện tại của repo; khi thêm route hoặc API mới, nên cập nhật song song mục tương ứng trong file này.*
