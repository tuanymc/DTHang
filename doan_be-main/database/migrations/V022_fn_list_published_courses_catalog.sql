CREATE OR REPLACE FUNCTION fn_list_published_courses (
    p_search TEXT DEFAULT NULL,
    p_major_ids VARCHAR[] DEFAULT NULL,
    p_category_ids VARCHAR[] DEFAULT NULL,
    p_page INT DEFAULT 1,
    p_page_size INT DEFAULT 12
)
RETURNS JSON
LANGUAGE plpgsql STABLE AS
$$
DECLARE
    offset_val INT;
    lim INT;
    pg INT;
    total_count INT;
    items_json JSON;
    result_json JSON;
    search_trim TEXT;
BEGIN
    pg := GREATEST(COALESCE(p_page, 1), 1);
    lim := LEAST(GREATEST(COALESCE(NULLIF(p_page_size, 0), 12), 1), 100);
    offset_val := (pg - 1) * lim;
    search_trim := TRIM(COALESCE(p_search, ''));

    SELECT COUNT(*)::INT INTO total_count
    FROM courses c
    WHERE c.status = 'published'
      AND (
          COALESCE(cardinality(p_major_ids), 0) = 0
          OR EXISTS (
              SELECT 1 FROM course_majors cm
              WHERE cm.course_id = c.id AND cm.major_id = ANY(p_major_ids)
          )
      )
      AND (
          COALESCE(cardinality(p_category_ids), 0) = 0
          OR EXISTS (
              SELECT 1 FROM course_categories cc
              WHERE cc.course_id = c.id AND cc.category_id = ANY(p_category_ids)
          )
      )
      AND (
          search_trim = ''
          OR c.title ILIKE '%' || search_trim || '%'
          OR COALESCE(c.description, '') ILIKE '%' || search_trim || '%'
          OR EXISTS (
              SELECT 1 FROM course_majors cm
              JOIN major m ON m.id = cm.major_id
              WHERE cm.course_id = c.id AND m.name ILIKE '%' || search_trim || '%'
          )
          OR EXISTS (
              SELECT 1 FROM course_categories cc
              JOIN categories cat ON cat.id = cc.category_id
              WHERE cc.course_id = c.id AND cat.name ILIKE '%' || search_trim || '%'
          )
      );

    SELECT COALESCE(
        json_agg(
            inner_obj.obj
            ORDER BY inner_obj.ecnt DESC NULLS LAST, inner_obj.pa DESC NULLS LAST, inner_obj.ua DESC
        ), '[]'::json
    ) INTO items_json
    FROM (
        SELECT json_build_object(
            'id', pr.id,
            'title', pr.title,
            'slug', pr.slug,
            'description', pr.description,
            'thumbnail_url', pr.thumbnail_url,
            'level', pr.level,
            'price', pr.price,
            'duration', pr.duration,
            'enrollment_count', pr.ecnt,
            'instructor', json_build_object(
                'first_name', pr.ins_fn,
                'last_name', pr.ins_ln,
                'email', pr.ins_em,
                'name', trim(BOTH FROM concat_ws(' ', pr.ins_fn, pr.ins_ln))
            )
        ) AS obj,
        pr.ecnt,
        pr.pa,
        pr.ua
        FROM (
            SELECT
                c.id,
                c.title,
                c.slug,
                c.description,
                c.thumbnail_url,
                c.level,
                c.price,
                c.duration,
                COALESCE(en.cnt, 0)::INT AS ecnt,
                c.published_at AS pa,
                c.updated_at AS ua,
                u.first_name AS ins_fn,
                u.last_name AS ins_ln,
                u.email AS ins_em
            FROM courses c
            LEFT JOIN (
                SELECT course_id, COUNT(*)::INT AS cnt FROM course_enrollments GROUP BY course_id
            ) en ON en.course_id = c.id
            LEFT JOIN users u ON u.id = c.instructor_id
            WHERE c.status = 'published'
              AND (
                  COALESCE(cardinality(p_major_ids), 0) = 0
                  OR EXISTS (
                      SELECT 1 FROM course_majors cm2
                      WHERE cm2.course_id = c.id AND cm2.major_id = ANY(p_major_ids)
                  )
              )
              AND (
                  COALESCE(cardinality(p_category_ids), 0) = 0
                  OR EXISTS (
                      SELECT 1 FROM course_categories cc2
                      WHERE cc2.course_id = c.id AND cc2.category_id = ANY(p_category_ids)
                  )
              )
              AND (
                  search_trim = ''
                  OR c.title ILIKE '%' || search_trim || '%'
                  OR COALESCE(c.description, '') ILIKE '%' || search_trim || '%'
                  OR EXISTS (
                      SELECT 1 FROM course_majors cm3
                      JOIN major m3 ON m3.id = cm3.major_id
                      WHERE cm3.course_id = c.id AND m3.name ILIKE '%' || search_trim || '%'
                  )
                  OR EXISTS (
                      SELECT 1 FROM course_categories cc3
                      JOIN categories cat3 ON cat3.id = cc3.category_id
                      WHERE cc3.course_id = c.id AND cat3.name ILIKE '%' || search_trim || '%'
                  )
              )
            ORDER BY ecnt DESC, pa DESC NULLS LAST, ua DESC
            LIMIT lim OFFSET offset_val
        ) pr
    ) inner_obj;

    SELECT json_build_object(
        'items', COALESCE(items_json, '[]'::json),
        'pagination', json_build_object(
            'total', total_count,
            'page', pg,
            'page_size', lim,
            'total_pages',
                CASE
                    WHEN lim > 0 AND total_count > 0 THEN CEIL(total_count::NUMERIC / lim)::INT
                    ELSE 0
                END
        )
    ) INTO result_json;

    RETURN result_json;
END;
$$;
