--# SPLIT
CREATE OR REPLACE FUNCTION create_major (
    p_id VARCHAR,
    p_name VARCHAR,
    p_description VARCHAR
)
RETURNS TABLE (
    id VARCHAR,
    name VARCHAR,
    description VARCHAR,
    created_at TIMESTAMPTZ
) AS
$$
BEGIN
    INSERT INTO major (id, name, description)
    VALUES (p_id, p_name, p_description);

    RETURN QUERY
    SELECT m.id, m.name, m.description, m.created_at
    FROM major m WHERE m.id = p_id;
END;
$$ LANGUAGE plpgsql;
--# SPLIT
CREATE OR REPLACE FUNCTION update_major (
    p_id VARCHAR,
    p_name VARCHAR,
    p_description VARCHAR
)
RETURNS TABLE (
    id VARCHAR,
    name VARCHAR,
    description VARCHAR,
    created_at TIMESTAMPTZ
) AS
$$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM major m WHERE m.id = p_id) THEN
        RAISE EXCEPTION 'Major not found';
    END IF;

    UPDATE major m
    SET
        name = COALESCE(p_name, m.name),
        description = COALESCE(p_description, m.description)
    WHERE m.id = p_id;

    RETURN QUERY
    SELECT m.id, m.name, m.description, m.created_at FROM major m WHERE m.id = p_id;
END;
$$ LANGUAGE plpgsql;
--# SPLIT
CREATE OR REPLACE FUNCTION delete_major (
    p_id VARCHAR
)
RETURNS BOOLEAN AS
$$
BEGIN
    DELETE FROM major WHERE id = p_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
