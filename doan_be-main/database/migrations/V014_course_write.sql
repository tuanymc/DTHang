--# SPLIT
CREATE OR REPLACE FUNCTION fn_create_course (
    p_id VARCHAR,
    p_title VARCHAR,
    p_slug VARCHAR,
    p_description TEXT,
    p_thumbnail_url TEXT,
    p_instructor_id VARCHAR,
    p_level VARCHAR,
    p_price NUMERIC,
    p_status VARCHAR,
    p_major_ids VARCHAR[],
    p_category_ids VARCHAR[]
)
RETURNS TABLE (
    id VARCHAR,
    title VARCHAR,
    slug VARCHAR,
    status VARCHAR
)
LANGUAGE plpgsql AS
$$
BEGIN
    IF EXISTS (SELECT 1 FROM courses c WHERE c.slug = p_slug) THEN
        RAISE EXCEPTION 'Slug already exists';
    END IF;

    IF p_major_ids IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM unnest(p_major_ids) m_id
            LEFT JOIN major m ON m.id = m_id
            WHERE m.id IS NULL
        ) THEN
            RAISE EXCEPTION 'Invalid major_id detected';
        END IF;
    END IF;

    IF p_category_ids IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM unnest(p_category_ids) c_id
            LEFT JOIN categories c ON c.id = c_id
            WHERE c.id IS NULL
        ) THEN
            RAISE EXCEPTION 'Invalid category_id detected';
        END IF;
    END IF;

    INSERT INTO courses (
        id,
        title,
        slug,
        description,
        thumbnail_url,
        instructor_id,
        level,
        price,
        status,
        duration,
        created_at,
        updated_at
    )
    VALUES (
        p_id,
        p_title,
        p_slug,
        p_description,
        p_thumbnail_url,
        p_instructor_id,
        p_level,
        COALESCE(p_price, 0),
        COALESCE(p_status, 'draft'),
        0,
        NOW(),
        NOW()
    );

    IF p_major_ids IS NOT NULL THEN
        INSERT INTO course_majors (course_id, major_id)
        SELECT p_id, unnest(p_major_ids);
    END IF;

    IF p_category_ids IS NOT NULL THEN
        INSERT INTO course_categories (course_id, category_id)
        SELECT p_id, unnest(p_category_ids);
    END IF;

    RETURN QUERY
    SELECT c.id, c.title, c.slug, c.status
    FROM courses c
    WHERE c.id = p_id;
END;
$$;
--# SPLIT
CREATE OR REPLACE FUNCTION fn_update_course (
    p_id VARCHAR,
    p_title VARCHAR,
    p_slug VARCHAR,
    p_description TEXT,
    p_thumbnail_url TEXT,
    p_level VARCHAR,
    p_price NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql AS
$$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM courses c WHERE c.id = p_id) THEN
        RAISE EXCEPTION 'COURSE_NOT_FOUND';
    END IF;

    IF p_slug IS NOT NULL AND EXISTS (
        SELECT 1 FROM courses c
        WHERE c.slug = p_slug AND c.id <> p_id
    ) THEN
        RAISE EXCEPTION 'COURSE_SLUG_EXISTS';
    END IF;

    UPDATE courses c
    SET
        title = COALESCE(p_title, c.title),
        slug = COALESCE(p_slug, c.slug),
        description = COALESCE(p_description, c.description),
        thumbnail_url = COALESCE(p_thumbnail_url, c.thumbnail_url),
        level = COALESCE(p_level, c.level),
        price = COALESCE(p_price, c.price),
        updated_at = NOW()
    WHERE c.id = p_id;
END;
$$;
--# SPLIT
CREATE OR REPLACE FUNCTION fn_publish_course (
    p_course_id VARCHAR
)
RETURNS VOID
LANGUAGE plpgsql AS
$$
BEGIN
    UPDATE courses
    SET status = 'published', published_at = NOW()
    WHERE id = p_course_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'COURSE_NOT_FOUND';
    END IF;
END;
$$;
--# SPLIT
CREATE OR REPLACE FUNCTION fn_archive_course (
    p_course_id VARCHAR
)
RETURNS VOID
LANGUAGE plpgsql AS
$$
BEGIN
    UPDATE courses
    SET status = 'archived'
    WHERE id = p_course_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'COURSE_NOT_FOUND';
    END IF;
END;
$$;
--# SPLIT
CREATE OR REPLACE FUNCTION fn_delete_course (
    p_course_id VARCHAR
)
RETURNS VOID
LANGUAGE plpgsql AS
$$
BEGIN
    DELETE FROM courses WHERE id = p_course_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'COURSE_NOT_FOUND';
    END IF;
END;
$$;
