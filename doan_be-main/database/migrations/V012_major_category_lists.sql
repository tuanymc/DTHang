--# SPLIT
CREATE OR REPLACE FUNCTION fn_get_major_list (
    p_search TEXT DEFAULT NULL,
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
    FROM major m
    WHERE (p_search IS NULL OR m.name ILIKE '%' || p_search || '%');

    SELECT jsonb_build_object(
        'data', COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', m.id,
                    'name', m.name,
                    'description', m.description,
                    'created_at', m.created_at
                )
                ORDER BY m.created_at DESC
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
        FROM major m
        WHERE (p_search IS NULL OR m.name ILIKE '%' || p_search || '%')
        ORDER BY m.created_at DESC
        LIMIT p_page_size
        OFFSET offset_val
    ) m;

    RETURN result;
END;
$$;
--# SPLIT
CREATE OR REPLACE FUNCTION fn_get_categories_list (
    p_search TEXT DEFAULT NULL,
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
    FROM categories c
    WHERE (p_search IS NULL OR c.name ILIKE '%' || p_search || '%');

    SELECT jsonb_build_object(
        'data', COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', c.id,
                    'name', c.name,
                    'slug', c.slug,
                    'description', c.description,
                    'created_at', c.created_at
                )
                ORDER BY c.created_at DESC
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
        FROM categories c
        WHERE (p_search IS NULL OR c.name ILIKE '%' || p_search || '%')
        ORDER BY c.created_at DESC
        LIMIT p_page_size
        OFFSET offset_val
    ) c;

    RETURN result;
END;
$$;
