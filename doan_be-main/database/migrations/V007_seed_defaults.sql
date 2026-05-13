INSERT INTO roles (id, role_name, description)
VALUES
    ('role-admin', 'admin', 'Quản trị'),
    ('role-instructor', 'instructor', 'Giảng viên'),
    ('role-student', 'student', 'Sinh viên')
ON CONFLICT (id) DO NOTHING;
