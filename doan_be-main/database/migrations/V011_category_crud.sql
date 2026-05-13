--# SPLIT
CREATE OR REPLACE FUNCTION create_category (
    p_id VARCHAR,
    p_name VARCHAR,
    p_slug VARCHAR,
    p_description VARCHAR
)
RETURNS TABLE (
    id VARCHAR,
    name VARCHAR,
    slug VARCHAR,
    description VARCHAR,
    created_at TIMESTAMPTZ
) AS
$$
BEGIN
    INSERT INTO categories (id, name, slug, description)
    VALUES (p_id, p_name, p_slug, p_description);

    RETURN QUERY
    SELECT c.id, c.name, c.slug, c.description, c.created_at FROM categories c WHERE c.id = p_id;
END;
$$ LANGUAGE plpgsql;
--# SPLIT
CREATE OR REPLACE FUNCTION update_category (
    p_id VARCHAR,
    p_name VARCHAR,
    p_slug VARCHAR,
    p_description VARCHAR
)
RETURNS TABLE (
    id VARCHAR,
    name VARCHAR,
    slug VARCHAR,
    description VARCHAR,
    created_at TIMESTAMPTZ
) AS
$$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM categories c WHERE c.id = p_id) THEN
        RAISE EXCEPTION 'Category not found';
    END IF;

    UPDATE categories c
    SET
        name = COALESCE(p_name, c.name),
        slug = COALESCE(p_slug, c.slug),
        description = COALESCE(p_description, c.description)
    WHERE c.id = p_id;

    RETURN QUERY
    SELECT c.id, c.name, c.slug, c.description, c.created_at FROM categories c WHERE c.id = p_id;
END;
$$ LANGUAGE plpgsql;
--# SPLIT
CREATE OR REPLACE FUNCTION delete_category (
    p_id VARCHAR
)
RETURNS BOOLEAN AS
$$
BEGIN
    DELETE FROM categories WHERE id = p_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
