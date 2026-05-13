--# SPLIT
CREATE OR REPLACE FUNCTION fn_upsert_section (
    p_id VARCHAR(100),
    p_course_id VARCHAR(100),
    p_title VARCHAR(255),
    p_position INT
) RETURNS VOID AS
$$
BEGIN
    INSERT INTO sections (id, course_id, title, position)
    VALUES (p_id, p_course_id, p_title, p_position)
    ON CONFLICT (id) DO UPDATE
    SET title = EXCLUDED.title,
        position = EXCLUDED.position,
        course_id = EXCLUDED.course_id;
END;
$$ LANGUAGE plpgsql;
--# SPLIT
CREATE OR REPLACE FUNCTION fn_upsert_lesson (
    p_id VARCHAR(100),
    p_section_id VARCHAR(100),
    p_title VARCHAR(255),
    p_description VARCHAR,
    p_lesson_type lesson_type,
    p_position INT,
    p_video_url TEXT DEFAULT NULL,
    p_video_duration INT DEFAULT NULL,
    p_content_json JSONB DEFAULT NULL
) RETURNS VOID AS
$$
BEGIN
    INSERT INTO lessons (
        id,
        section_id,
        title,
        description,
        lesson_type,
        position,
        video_url,
        video_duration,
        content_json
    )
    VALUES (
        p_id,
        p_section_id,
        p_title,
        p_description,
        p_lesson_type,
        p_position,
        p_video_url,
        p_video_duration,
        p_content_json
    )
    ON CONFLICT (id) DO UPDATE
    SET title = EXCLUDED.title,
        position = EXCLUDED.position,
        description = EXCLUDED.description,
        lesson_type = EXCLUDED.lesson_type,
        section_id = EXCLUDED.section_id,
        video_url = EXCLUDED.video_url,
        video_duration = EXCLUDED.video_duration,
        content_json = EXCLUDED.content_json;
END;
$$ LANGUAGE plpgsql;
--# SPLIT
CREATE OR REPLACE FUNCTION fn_get_course_curriculum (p_course_id VARCHAR(100))
RETURNS TABLE (curriculum JSONB) AS
$$
BEGIN
    RETURN QUERY
    SELECT
        jsonb_build_object(
            'course_id', c.id,
            'course_title', c.title,
            'sections', COALESCE(
                (
                    SELECT jsonb_agg(s_final ORDER BY s_final.position)
                    FROM (
                        SELECT
                            s.id,
                            s.title,
                            s.position,
                            COALESCE(
                                (
                                    SELECT jsonb_agg(l_final ORDER BY l_final.position)
                                    FROM (
                                        SELECT
                                            l.id,
                                            l.title,
                                            l.description,
                                            l.lesson_type AS "type",
                                            l.position,
                                            l.video_url,
                                            l.video_duration,
                                            l.content_json AS "content"
                                        FROM lessons l
                                        WHERE l.section_id = s.id
                                    ) l_final
                                ),
                                '[]'::jsonb
                            ) AS lessons
                        FROM sections s
                        WHERE s.course_id = p_course_id
                    ) s_final
                ),
                '[]'::jsonb
            )
        )
    FROM courses c
    WHERE c.id = p_course_id;
END;
$$ LANGUAGE plpgsql;
