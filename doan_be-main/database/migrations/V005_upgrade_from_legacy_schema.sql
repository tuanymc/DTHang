--# SPLIT
DO $$
BEGIN
    ALTER TABLE sections DROP CONSTRAINT IF EXISTS sections_course_id_key;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;
--# SPLIT
-- Gán lại position nếu thiếu/khớp khóa (course_id, position)
UPDATE sections s
SET position = r.rn::INT - 1
FROM (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY course_id
            ORDER BY created_at ASC NULLS LAST, id ASC
        ) AS rn
    FROM sections
) r
WHERE s.id = r.id;
--# SPLIT
DO $$
BEGIN
    ALTER TABLE sections ALTER COLUMN position SET DEFAULT 0;
EXCEPTION
    WHEN undefined_column THEN NULL;
END $$;
--# SPLIT
DO $$
BEGIN
    ALTER TABLE sections ALTER COLUMN position SET NOT NULL;
EXCEPTION
    WHEN others THEN NULL;
END $$;
--# SPLIT
DO $$
BEGIN
    ALTER TABLE sections ADD CONSTRAINT sections_course_position_key UNIQUE (course_id, position);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
--# SPLIT
ALTER TABLE user_quiz_attempts DROP CONSTRAINT IF EXISTS user_quiz_attempts_user_id_lesson_id_key;
--# SPLIT
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_lesson ON user_quiz_attempts (user_id, lesson_id);
--# SPLIT
DO $$
BEGIN
    ALTER TABLE sessions
        ADD CONSTRAINT sessions_user_id_fkey
            FOREIGN KEY (user_id)
            REFERENCES users (id)
            ON UPDATE CASCADE
            ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'sessions FK: có bản ghi user_id không khớp users — làm sạch data rồi chạy lại.';
END $$;
