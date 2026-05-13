--# SPLIT
CREATE TABLE IF NOT EXISTS study_events (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    course_id VARCHAR(100) REFERENCES courses (id) ON DELETE CASCADE,
    lesson_id VARCHAR(100) REFERENCES lessons (id) ON DELETE SET NULL,
    event_type VARCHAR(80) NOT NULL,
    duration_seconds INT,
    payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
--# SPLIT
CREATE INDEX IF NOT EXISTS idx_study_events_user_time ON study_events (user_id, created_at DESC);
--# SPLIT
CREATE INDEX IF NOT EXISTS idx_study_events_lesson ON study_events (lesson_id);
