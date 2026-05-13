CREATE OR REPLACE FUNCTION fn_get_courses_list (
    p_search TEXT DEFAULT NULL,
    p_status VARCHAR DEFAULT NULL,
    p_level VARCHAR DEFAULT NULL,
    p_major_ids VARCHAR[] DEFAULT NULL,
    p_category_ids VARCHAR[] DEFAULT NULL,
    p_page INT DEFAULT 1,
    p_page_size INT DEFAULT 10,
    p_user_id VARCHAR DEFAULT NULL,
    p_roles TEXT[] DEFAULT NULL
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
    FROM courses c
    WHERE (p_status IS NULL OR c.status = p_status)
      AND (p_level IS NULL OR c.level = p_level)
      AND (
          p_roles IS NULL OR 'admin' = ANY (p_roles) OR c.instructor_id = p_user_id
      )
      AND (
          p_major_ids IS NULL OR EXISTS (
              SELECT 1 FROM course_majors cm
              WHERE cm.course_id = c.id AND cm.major_id = ANY (p_major_ids)
          )
      )
      AND (
          p_category_ids IS NULL OR EXISTS (
              SELECT 1 FROM course_categories cc
              WHERE cc.course_id = c.id AND cc.category_id = ANY (p_category_ids)
          )
      )
      AND (
          p_search IS NULL
          OR c.title ILIKE '%' || p_search || '%'
          OR EXISTS (
              SELECT 1 FROM course_majors cm JOIN major m ON m.id = cm.major_id
              WHERE cm.course_id = c.id AND m.name ILIKE '%' || p_search || '%'
          )
          OR EXISTS (
              SELECT 1 FROM course_categories cc
              JOIN categories cat ON cat.id = cc.category_id
              WHERE cc.course_id = c.id AND cat.name ILIKE '%' || p_search || '%'
          )
      );

    SELECT jsonb_build_object(
        'data', COALESCE(
            jsonb_agg(course_item ORDER BY course_item.created_at DESC),
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
        SELECT
            c.*,

            jsonb_build_object(
                'id', u.id,
                'first_name', u.first_name,
                'last_name', u.last_name,
                'email', u.email
            ) AS instructor,

            (
                SELECT COALESCE(jsonb_agg(
                    jsonb_build_object(
                        'id', m.id,
                        'name', m.name
                    )
                ), '[]'::jsonb)
                FROM course_majors cm
                JOIN major m ON m.id = cm.major_id
                WHERE cm.course_id = c.id
            ) AS majors,

            (
                SELECT COALESCE(jsonb_agg(
                    jsonb_build_object(
                        'id', cat.id,
                        'name', cat.name
                    )
                ), '[]'::jsonb)
                FROM course_categories cc
                JOIN categories cat ON cat.id = cc.category_id
                WHERE cc.course_id = c.id
            ) AS categories

        FROM courses c
        LEFT JOIN users u ON u.id = c.instructor_id

        WHERE (p_status IS NULL OR c.status = p_status)
          AND (p_level IS NULL OR c.level = p_level)
          AND (
              p_roles IS NULL OR 'admin' = ANY (p_roles) OR c.instructor_id = p_user_id
          )
          AND (
              p_major_ids IS NULL OR EXISTS (
                  SELECT 1 FROM course_majors cm
                  WHERE cm.course_id = c.id AND cm.major_id = ANY (p_major_ids)
              )
          )
          AND (
              p_category_ids IS NULL OR EXISTS (
                  SELECT 1 FROM course_categories cc
                  WHERE cc.course_id = c.id AND cc.category_id = ANY (p_category_ids)
              )
          )
          AND (
              p_search IS NULL
              OR c.title ILIKE '%' || p_search || '%'
              OR EXISTS (
                  SELECT 1 FROM course_majors cm JOIN major m ON m.id = cm.major_id
                  WHERE cm.course_id = c.id AND m.name ILIKE '%' || p_search || '%'
              )
              OR EXISTS (
                  SELECT 1 FROM course_categories cc
                  JOIN categories cat ON cat.id = cc.category_id
                  WHERE cc.course_id = c.id AND cat.name ILIKE '%' || p_search || '%'
              )
          )

        ORDER BY c.created_at DESC
        LIMIT p_page_size OFFSET offset_val
    ) course_item;

    RETURN result;
END;
$$;
