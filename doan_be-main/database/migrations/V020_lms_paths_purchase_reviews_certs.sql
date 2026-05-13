--# SPLIT
-- Học thử (trial) vs full; mua lẻ; combo lộ trình; chứng chỉ; đánh giá
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS allows_trial BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE course_enrollments
ADD COLUMN IF NOT EXISTS access_kind VARCHAR(16) NOT NULL DEFAULT 'full';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'course_enrollments_access_kind_check'
    ) THEN
        ALTER TABLE course_enrollments
            ADD CONSTRAINT course_enrollments_access_kind_check CHECK (access_kind IN ('trial', 'full'));
    END IF;
END $$;

COMMENT ON COLUMN course_enrollments.access_kind IS 'trial = chỉ bài học thử is_preview; full = học đầy đủ';

--# SPLIT
CREATE TABLE IF NOT EXISTS course_purchases (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    course_id VARCHAR(100) NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(8) NOT NULL DEFAULT 'VND',
    status VARCHAR(20) NOT NULL DEFAULT 'paid',
    payment_ref VARCHAR(200),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_purchases_user ON course_purchases (user_id DESC);

CREATE UNIQUE INDEX IF NOT EXISTS uq_course_purchase_paid
ON course_purchases (user_id, course_id)
WHERE status = 'paid';

--# SPLIT
CREATE TABLE IF NOT EXISTS learning_paths (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(300),
    description TEXT,
    audience_tag VARCHAR(200),
    bundle_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'published',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learning_path_items (
    path_id VARCHAR(100) NOT NULL REFERENCES learning_paths (id) ON DELETE CASCADE,
    course_id VARCHAR(100) NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
    position INT NOT NULL DEFAULT 0,
    PRIMARY KEY (path_id, course_id),
    UNIQUE (path_id, position)
);

CREATE TABLE IF NOT EXISTS path_purchases (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    path_id VARCHAR(100) NOT NULL REFERENCES learning_paths (id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(8) NOT NULL DEFAULT 'VND',
    status VARCHAR(20) NOT NULL DEFAULT 'paid',
    payment_ref VARCHAR(200),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_path_purchase_paid
ON path_purchases (user_id, path_id)
WHERE status = 'paid';

CREATE INDEX IF NOT EXISTS idx_learning_path_items_path ON learning_path_items (path_id, position);

--# SPLIT
CREATE TABLE IF NOT EXISTS certificates (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    course_id VARCHAR(100) NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
    certificate_code VARCHAR(80) NOT NULL UNIQUE,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates (user_id DESC);

--# SPLIT
CREATE TABLE IF NOT EXISTS course_reviews (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    course_id VARCHAR(100) NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_course_reviews_course ON course_reviews (course_id);

--# SPLIT
CREATE OR REPLACE FUNCTION fn_get_course_curriculum (p_course_id VARCHAR(100))
RETURNS TABLE (curriculum JSONB) AS
$$
BEGIN
    RETURN QUERY
    SELECT
        jsonb_build_object(
            'course_id', c.id,
            'course_title', c.title,
            'sections', COALESCE(
                (
                    SELECT jsonb_agg(s_final ORDER BY s_final.position)
                    FROM (
                        SELECT
                            s.id,
                            s.title,
                            s.position,
                            COALESCE(
                                (
                                    SELECT jsonb_agg(l_final ORDER BY l_final.position)
                                    FROM (
                                        SELECT
                                            l.id,
                                            l.title,
                                            l.description,
                                            l.lesson_type AS "type",
                                            l.position,
                                            l.video_url,
                                            l.video_duration,
                                            l.content_json AS "content",
                                            COALESCE(l.is_preview, FALSE) AS "is_preview"
                                        FROM lessons l
                                        WHERE l.section_id = s.id
                                    ) l_final
                                ),
                                '[]'::jsonb
                            ) AS lessons
                        FROM sections s
                        WHERE s.course_id = p_course_id
                    ) s_final
                ),
                '[]'::jsonb
            )
        )
    FROM courses c
    WHERE c.id = p_course_id;
END;
$$ LANGUAGE plpgsql;
