--# SPLIT
CREATE OR REPLACE FUNCTION fn_get_profile (
    p_user_id VARCHAR
)
RETURNS TABLE (
    id VARCHAR,
    email VARCHAR,
    first_name VARCHAR,
    last_name VARCHAR,
    avatar_url VARCHAR,
    roles TEXT[],
    permissions TEXT[]
)
LANGUAGE plpgsql AS
$$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.avatar_url,
        COALESCE(array_agg(DISTINCT r.role_name)::TEXT[], '{}'::TEXT[]),
        COALESCE(array_agg(DISTINCT p.permission_code)::TEXT[], '{}'::TEXT[])
    FROM users u
    LEFT JOIN user_roles ur ON ur.user_id = u.id
    LEFT JOIN roles r ON r.id = ur.role_id
    LEFT JOIN role_permissions rp ON rp.role_id = r.id
    LEFT JOIN permissions p ON p.id = rp.permission_id
    WHERE u.id = p_user_id
    GROUP BY u.id;
END;
$$;
