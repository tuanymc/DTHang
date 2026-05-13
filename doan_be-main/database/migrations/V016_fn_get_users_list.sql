CREATE OR REPLACE FUNCTION fn_get_users_list (
    p_search TEXT DEFAULT NULL,
    p_role TEXT DEFAULT NULL,
    p_page INT DEFAULT 1,
    p_page_size INT DEFAULT 10
)
RETURNS JSON
LANGUAGE plpgsql AS
$$
DECLARE
    result JSON;
    total_count INT;
    offset_val INT;
BEGIN
    offset_val := (p_page - 1) * p_page_size;

    SELECT COUNT(*) INTO total_count
    FROM users u
    WHERE
        (
            p_search IS NULL
            OR u.email ILIKE '%' || p_search || '%'
            OR u.first_name ILIKE '%' || p_search || '%'
            OR u.last_name ILIKE '%' || p_search || '%'
            OR (u.first_name || ' ' || u.last_name) ILIKE '%' || p_search || '%'
        )
        AND (
            p_role IS NULL
            OR EXISTS (
                SELECT 1 FROM user_roles ur
                JOIN roles r ON r.id = ur.role_id
                WHERE ur.user_id = u.id
                  AND r.role_name ILIKE '%' || p_role || '%'
            )
        );

    SELECT jsonb_build_object(
        'data', COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', u.id,
                    'email', u.email,
                    'first_name', u.first_name,
                    'last_name', u.last_name,
                    'avatar_url', u.avatar_url,
                    'status', u.status,
                    'email_verified', u.email_verified,
                    'created_at', u.created_at,
                    'roles', COALESCE(
                        (
                            SELECT jsonb_agg(r.role_name)
                            FROM user_roles ur
                            JOIN roles r ON r.id = ur.role_id
                            WHERE ur.user_id = u.id
                        ),
                        '[]'::jsonb
                    )
                )
                ORDER BY u.created_at DESC
            ),
            '[]'::jsonb
        ),
        'pagination', jsonb_build_object(
            'total', total_count,
            'page', p_page,
            'page_size', p_page_size,
            'total_pages', CEIL(total_count::FLOAT / NULLIF(p_page_size, 0))
        )
    )
    INTO result
    FROM (
        SELECT *
        FROM users u
        WHERE
            (
                p_search IS NULL
                OR u.email ILIKE '%' || p_search || '%'
                OR u.first_name ILIKE '%' || p_search || '%'
                OR u.last_name ILIKE '%' || p_search || '%'
                OR (u.first_name || ' ' || u.last_name) ILIKE '%' || p_search || '%'
            )
            AND (
                p_role IS NULL
                OR EXISTS (
                    SELECT 1 FROM user_roles ur
                    JOIN roles r ON r.id = ur.role_id
                    WHERE ur.user_id = u.id
                      AND r.role_name ILIKE '%' || p_role || '%'
                )
            )
        ORDER BY u.created_at DESC
        LIMIT p_page_size OFFSET offset_val
    ) u;

    RETURN result;
END;
$$;
