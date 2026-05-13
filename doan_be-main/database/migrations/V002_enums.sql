-- Kiểu bài học (video/docs/quiz/exam)
DO $$
BEGIN
    CREATE TYPE lesson_type AS ENUM ('video', 'docs', 'quiz', 'exam');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
