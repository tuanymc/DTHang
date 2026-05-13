--# SPLIT
CREATE OR REPLACE FUNCTION get_featured_courses (p_limit INT DEFAULT 12)
RETURNS JSONB
LANGUAGE sql STABLE AS
$$
    WITH enroll AS (
        SELECT course_id, COUNT(*) AS cnt FROM course_enrollments GROUP BY course_id
    ),
    ranked AS (
        SELECT
            c.id AS cid,
            c.title,
            c.slug,
            c.description,
            c.thumbnail_url,
            c.level,
            c.price,
            c.duration,
            COALESCE(e.cnt, 0)::INT AS enrollment_count,
            u.first_name,
            u.last_name,
            u.email,
            ROW_NUMBER() OVER (
                ORDER BY
                    COALESCE(e.cnt, 0) DESC,
                    c.published_at DESC NULLS LAST,
                    c.updated_at DESC
            ) AS rn
        FROM courses c
        LEFT JOIN enroll e ON e.course_id = c.id
        LEFT JOIN users u ON u.id = c.instructor_id
        WHERE c.status = 'published'
    )
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id', cid,
                'title', title,
                'slug', slug,
                'description', description,
                'thumbnail_url', thumbnail_url,
                'level', level,
                'price', price,
                'duration', duration,
                'enrollment_count', enrollment_count,
                'instructor', jsonb_build_object(
                    'first_name', first_name,
                    'last_name', last_name,
                    'email', email,
                    'name', trim(BOTH FROM concat_ws(' ', first_name, last_name))
                )
            )
            ORDER BY rn
        ),
        '[]'::jsonb
    )
    FROM ranked
    WHERE rn <= COALESCE(NULLIF(p_limit, 0), 12);
$$;
--# SPLIT
CREATE OR REPLACE FUNCTION fn_get_course_detail (p_course_id VARCHAR)
RETURNS TABLE (fn_get_course_detail JSONB)
LANGUAGE plpgsql STABLE AS
$$
DECLARE
    cur JSONB;
    inst RECORD;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM courses WHERE id = p_course_id) THEN
        RETURN;
    END IF;

    SELECT fc.curriculum INTO cur
    FROM fn_get_course_curriculum(p_course_id) AS fc
    LIMIT 1;

    SELECT
        u.first_name,
        u.last_name,
        u.email,
        u.avatar_url,
        u.bio
    INTO inst
    FROM courses c
    LEFT JOIN users u ON u.id = c.instructor_id
    WHERE c.id = p_course_id;

    RETURN QUERY
    SELECT
        jsonb_build_object(
            'id', c.id,
            'title', c.title,
            'subtitle', '',
            'headline',
            COALESCE(split_part(NULLIF(trim(BOTH FROM c.description), ''), E'\n', 1), c.title),
            'description', COALESCE(c.description, ''),
            'thumbnail',
            regexp_replace(COALESCE(c.thumbnail_url, ''), '^https?://', '', 'gi'),
            'thumbnail_url', COALESCE(c.thumbnail_url, ''),
            'slug', COALESCE(c.slug, ''),
            'price', COALESCE(c.price::FLOAT, 0),
            'rating', 4.8,
            'totalReviews', 0,
            'totalStudents',
            (SELECT COUNT(*)::INT FROM course_enrollments ce WHERE ce.course_id = c.id),
            'lastUpdated',
            to_char(GREATEST(c.updated_at, c.published_at, c.created_at), 'Mon DD, YYYY'),
            'language', 'Vietnamese',
            'totalHours',
            ROUND(COALESCE(c.duration::NUMERIC / 3600::NUMERIC, 0)::NUMERIC, 2),
            'totalArticles', (
                SELECT COUNT(*)::INT
                FROM lessons l
                JOIN sections s ON s.id = l.section_id
                WHERE s.course_id = c.id AND l.lesson_type = 'docs'
            ),
            'totalResources', 0,
            'totalLectures', (
                SELECT COUNT(*)::INT
                FROM lessons l
                JOIN sections s ON s.id = l.section_id
                WHERE s.course_id = c.id
            ),
            'level',
            CASE
                WHEN c.level IS NULL THEN 'All Levels'::TEXT
                ELSE initcap(lower(c.level))
            END::TEXT,
            'certificate', TRUE,
            'whatYouWillLearn', '[]'::JSONB,
            'requirements', '[]'::JSONB,
            'targetAudience', '[]'::JSONB,
            'featuredReview', NULL::JSONB,
            'promoVideo', '',
            'chapters', COALESCE(cur #> '{sections}', '[]'::JSONB),
            'instructor',
            COALESCE(
                jsonb_strip_nulls(
                    jsonb_build_object(
                        'name',
                        trim(BOTH FROM concat_ws(' ', inst.first_name, inst.last_name)),
                        'title', '',
                        'avatar', COALESCE(inst.avatar_url, ''),
                        'bio', COALESCE(inst.bio, ''),
                        'students',
                        COALESCE(
                            (
                                SELECT COUNT(DISTINCT ce.user_id)::INT
                                FROM course_enrollments ce
                                JOIN courses co ON co.id = ce.course_id
                                WHERE co.instructor_id = c.instructor_id
                            ),
                            0
                        ),
                        'courses',
                        COALESCE(
                            (SELECT COUNT(*)::INT FROM courses co WHERE co.instructor_id = c.instructor_id),
                            0
                        ),
                        'rating', 4.9,
                        'reviews', 0
                    )
                ),
                '{}'::JSONB
            ),
            'relatedCourses', (
                SELECT COALESCE(jsonb_agg(sq.obj ORDER BY sq.ord), '[]'::JSONB)
                FROM (
                    SELECT
                        ROW_NUMBER() OVER () AS ord,
                        jsonb_build_object(
                            'id', co2.id,
                            'title', co2.title,
                            'thumbnail', COALESCE(co2.thumbnail_url, ''),
                            'price', COALESCE(co2.price::FLOAT, 0),
                            'rating', 4.7,
                            'instructor',
                            trim(BOTH FROM concat_ws(' ', ux.first_name, ux.last_name)),
                            'totalReviews', 0
                        ) AS obj
                    FROM courses co2
                    LEFT JOIN users ux ON ux.id = co2.instructor_id
                    WHERE co2.id <> c.id AND co2.status = 'published'
                    ORDER BY random()
                    LIMIT 4
                ) sq
            )
        )
    FROM courses c
    WHERE c.id = p_course_id;
END;
$$;
