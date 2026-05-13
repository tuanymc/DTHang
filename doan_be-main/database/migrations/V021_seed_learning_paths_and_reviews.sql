-- Dữ liệu mẫu: combo lộ trình + đánh giá khóa (gắn với các id do `npm run db:seed` tạo nếu đã có).
-- Idempotent: ON CONFLICT bỏ qua khi đã chèn.

DO $$
BEGIN
    /* -------- Learning paths -------- */
    IF EXISTS (SELECT 1 FROM courses WHERE id = 'demo-course-web-fe')
       AND EXISTS (SELECT 1 FROM courses WHERE id = 'demo-course-sql-be')
    THEN
        INSERT INTO learning_paths (
            id, title, slug, description, audience_tag, bundle_price, status
        )
        VALUES (
            'demo-path-fullstack-cntt',
            N'Lộ trình Full-stack cho sinh viên CNTT',
            'demo-lo-trinh-fullstack-cntt',
            N'Combo gồm khóa Web hiện đại (published) và PostgreSQL (demo trong seed): học tuần tự được gợi ý.',
            N'Sinh viên CNTT',
            399000,
            'published'
        )
        ON CONFLICT (id) DO NOTHING;

        INSERT INTO learning_path_items (path_id, course_id, position)
        VALUES
            ('demo-path-fullstack-cntt', 'demo-course-web-fe', 0),
            ('demo-path-fullstack-cntt', 'demo-course-sql-be', 1)
        ON CONFLICT (path_id, course_id) DO NOTHING;
    END IF;

    IF EXISTS (SELECT 1 FROM courses WHERE id = 'demo-course-web-fe')
    THEN
        INSERT INTO learning_paths (
            id, title, slug, description, audience_tag, bundle_price, status
        )
        VALUES (
            'demo-path-web-ngan-han',
            N'Gói Web căn bản',
            'demo-goi-web-co-ban',
            N'Tập trung một khóa Web (demo): phù hợp ôn hoặc bắt đầu nhanh.',
            N'Người đi làm / tự học',
            99000,
            'published'
        )
        ON CONFLICT (id) DO NOTHING;

        INSERT INTO learning_path_items (path_id, course_id, position)
        VALUES ('demo-path-web-ngan-han', 'demo-course-web-fe', 0)
        ON CONFLICT (path_id, course_id) DO NOTHING;
    END IF;

    /* -------- Course reviews (đủ user + khóa) -------- */
    IF EXISTS (SELECT 1 FROM users WHERE id = 'usr-demo-student')
       AND EXISTS (SELECT 1 FROM courses WHERE id = 'demo-course-web-fe')
    THEN
        INSERT INTO course_reviews (id, user_id, course_id, rating, comment)
        VALUES (
            'demo-review-sv-web',
            'usr-demo-student',
            'demo-course-web-fe',
            5,
            N'Khóa demo có video, docs và quiz rõ ràng; phù hợp ôn web hiện đại.'
        )
        ON CONFLICT (user_id, course_id) DO NOTHING;
    END IF;

    IF EXISTS (SELECT 1 FROM users WHERE id = 'usr-demo-admin')
       AND EXISTS (SELECT 1 FROM courses WHERE id = 'demo-course-web-fe')
    THEN
        INSERT INTO course_reviews (id, user_id, course_id, rating, comment)
        VALUES (
            'demo-review-adm-web',
            'usr-demo-admin',
            'demo-course-web-fe',
            4,
            N'Cấu trúc bài bản, nên bổ sung thêm bài assignment thực hành.'
        )
        ON CONFLICT (user_id, course_id) DO NOTHING;
    END IF;

    IF EXISTS (SELECT 1 FROM users WHERE id = 'usr-demo-student')
       AND EXISTS (SELECT 1 FROM courses WHERE id = 'demo-course-sql-be')
    THEN
        INSERT INTO course_reviews (id, user_id, course_id, rating, comment)
        VALUES (
            'demo-review-sv-sql',
            'usr-demo-student',
            'demo-course-sql-be',
            4,
            N'Phần SQL dễ hiểu; mong khi publish sẽ có thêm bài tập nâng cao.'
        )
        ON CONFLICT (user_id, course_id) DO NOTHING;
    END IF;

    IF EXISTS (SELECT 1 FROM users WHERE id = 'usr-demo-trainer')
       AND EXISTS (SELECT 1 FROM courses WHERE id = 'demo-course-sql-be')
    THEN
        INSERT INTO course_reviews (id, user_id, course_id, rating, comment)
        VALUES (
            'demo-review-ins-sql',
            'usr-demo-trainer',
            'demo-course-sql-be',
            5,
            N'Nội dung demo phù hợp người mới với PostgreSQL.'
        )
        ON CONFLICT (user_id, course_id) DO NOTHING;
    END IF;
END $$;
