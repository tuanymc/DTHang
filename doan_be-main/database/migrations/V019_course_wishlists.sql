-- Danh sách yêu thích (user đăng nhập → khóa học public)
CREATE TABLE IF NOT EXISTS course_wishlists (
    user_id VARCHAR(100) NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    course_id VARCHAR(100) NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_course_wishlists_user ON course_wishlists (user_id DESC);
