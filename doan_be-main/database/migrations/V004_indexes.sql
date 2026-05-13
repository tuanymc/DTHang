--# SPLIT
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses (status);
--# SPLIT
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses (instructor_id);
--# SPLIT
CREATE INDEX IF NOT EXISTS idx_enroll_user ON course_enrollments (user_id);
--# SPLIT
CREATE INDEX IF NOT EXISTS idx_enroll_course ON course_enrollments (course_id);
--# SPLIT
CREATE INDEX IF NOT EXISTS idx_sections_course ON sections (course_id);
--# SPLIT
CREATE INDEX IF NOT EXISTS idx_lessons_section ON lessons (section_id);
--# SPLIT
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress (user_id);
--# SPLIT
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id);
--# SPLIT
CREATE INDEX IF NOT EXISTS idx_sessions_refresh ON sessions (refresh_token_hash);
