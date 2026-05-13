--# SPLIT
CREATE OR REPLACE FUNCTION fn_create_role(
    p_role_id VARCHAR,
    p_role_name VARCHAR,
    p_description VARCHAR
)
RETURNS TABLE (
    role_id VARCHAR,
    role_name VARCHAR
)
LANGUAGE plpgsql AS
$$
BEGIN
    IF EXISTS (SELECT 1 FROM roles r WHERE r.role_name = p_role_name) THEN
        RAISE EXCEPTION 'ROLE_ALREADY_EXISTS';
    END IF;

    INSERT INTO roles (id, role_name, description)
    VALUES (p_role_id, p_role_name, p_description);

    RETURN QUERY
    SELECT p_role_id, p_role_name;
END;
$$;
--# SPLIT
CREATE OR REPLACE FUNCTION fn_update_role(
    p_role_id VARCHAR,
    p_role_name VARCHAR,
    p_description VARCHAR
)
RETURNS VOID
LANGUAGE plpgsql AS
$$
BEGIN
    UPDATE roles
    SET
        role_name = p_role_name,
        description = p_description
    WHERE id = p_role_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'ROLE_NOT_FOUND';
    END IF;
END;
$$;
--# SPLIT
CREATE OR REPLACE FUNCTION fn_delete_role(
    p_role_id VARCHAR
)
RETURNS VOID
LANGUAGE plpgsql AS
$$
DECLARE
    v_count INT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM roles WHERE id = p_role_id) THEN
        RAISE EXCEPTION 'ROLE_NOT_FOUND';
    END IF;

    SELECT COUNT(*) INTO v_count FROM user_roles WHERE role_id = p_role_id;

    IF v_count > 0 THEN
        RAISE EXCEPTION 'ROLE_IN_USE_CANNOT_DELETE';
    END IF;

    DELETE FROM roles WHERE id = p_role_id;
END;
$$;
--# SPLIT
CREATE OR REPLACE FUNCTION fn_get_roles ()
RETURNS TABLE (
    id VARCHAR,
    role_name VARCHAR,
    description VARCHAR
)
LANGUAGE plpgsql AS
$$
BEGIN
    RETURN QUERY
    SELECT r.id, r.role_name, r.description
    FROM roles r
    ORDER BY r.role_name;
END;
$$;
