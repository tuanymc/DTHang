--# SPLIT
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    code_unique VARCHAR(100) UNIQUE,
    email VARCHAR(200) UNIQUE NOT NULL,
    password_hash VARCHAR(300),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url VARCHAR(500),
    dob DATE,
    bio VARCHAR(500),
    status VARCHAR(100),
    email_verified BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
--# SPLIT
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(100) PRIMARY KEY,
    role_name VARCHAR(200),
    description VARCHAR(500)
);
--# SPLIT
CREATE TABLE IF NOT EXISTS permissions (
    id VARCHAR(100) PRIMARY KEY,
    permission_code VARCHAR(300),
    description VARCHAR(500)
);
--# SPLIT
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id VARCHAR(100) REFERENCES roles (id) ON UPDATE CASCADE ON DELETE CASCADE,
    permission_id VARCHAR(100) REFERENCES permissions (id) ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);
--# SPLIT
CREATE TABLE IF NOT EXISTS user_roles (
    user_id VARCHAR(100) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE,
    role_id VARCHAR(100) REFERENCES roles (id) ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);
--# SPLIT
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE,
    refresh_token_hash VARCHAR(500),
    device_info TEXT,
    ip_address VARCHAR(100),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);
--# SPLIT
CREATE TABLE IF NOT EXISTS major (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
--# SPLIT
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
--# SPLIT
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    thumbnail_url TEXT,
    instructor_id VARCHAR(100) REFERENCES users (id),
    level VARCHAR(20),
    price NUMERIC(10, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    duration NUMERIC(8, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
--# SPLIT
CREATE TABLE IF NOT EXISTS course_majors (
    course_id VARCHAR(100) REFERENCES courses (id) ON DELETE CASCADE,
    major_id VARCHAR(100) REFERENCES major (id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, major_id)
);
--# SPLIT
CREATE TABLE IF NOT EXISTS course_categories (
    course_id VARCHAR(100) REFERENCES courses (id) ON DELETE CASCADE,
    category_id VARCHAR(100) REFERENCES categories (id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, category_id)
);
--# SPLIT
-- Nhiều section/khối cho một khóa học; thứ tự UNIQUE theo (course_id, position)
CREATE TABLE IF NOT EXISTS sections (
    id VARCHAR(100) PRIMARY KEY,
    course_id VARCHAR(100) NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
    title VARCHAR(255),
    position INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (course_id, position)
);
--# SPLIT
CREATE TABLE IF NOT EXISTS lessons (
    id VARCHAR(100) PRIMARY KEY,
    section_id VARCHAR(100) REFERENCES sections (id) ON DELETE CASCADE,
    title VARCHAR(255),
    description TEXT,
    lesson_type lesson_type NOT NULL,
    video_url TEXT,
    video_duration INT,
    content_json JSONB,
    position INT DEFAULT 0,
    is_preview BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
--# SPLIT
CREATE TABLE IF NOT EXISTS course_enrollments (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) REFERENCES users (id) ON DELETE CASCADE,
    course_id VARCHAR(100) REFERENCES courses (id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    progress_percent NUMERIC(5, 2) DEFAULT 0,
    UNIQUE (user_id, course_id)
);
--# SPLIT
CREATE TABLE IF NOT EXISTS lesson_progress (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) REFERENCES users (id) ON DELETE CASCADE,
    lesson_id VARCHAR(100) REFERENCES lessons (id) ON DELETE CASCADE,
    progress_percent NUMERIC(5, 2) DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, lesson_id)
);
--# SPLIT
-- Cho phép nhiều lần làm quiz/exam (không ràng UNIQUE user+lesson trên toàn bảng)
CREATE TABLE IF NOT EXISTS user_quiz_attempts (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) REFERENCES users (id) ON DELETE CASCADE,
    lesson_id VARCHAR(100) REFERENCES lessons (id) ON DELETE CASCADE,
    score INT,
    max_score INT,
    passed BOOLEAN,
    answers JSONB,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
