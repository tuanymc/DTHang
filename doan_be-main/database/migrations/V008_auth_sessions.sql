--# SPLIT
CREATE OR REPLACE FUNCTION fn_get_user_by_email(
    p_email VARCHAR
)
RETURNS TABLE (
    id VARCHAR,
    email VARCHAR,
    password_hash VARCHAR,
    status VARCHAR,
    email_verified BOOLEAN,
    roles TEXT[]
)
LANGUAGE plpgsql AS
$$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.email,
        u.password_hash,
        u.status,
        u.email_verified,
        COALESCE(array_agg(r.role_name)::TEXT[], '{}'::TEXT[]) AS roles
    FROM users u
    LEFT JOIN user_roles ur ON ur.user_id = u.id
    LEFT JOIN roles r ON r.id = ur.role_id
    WHERE u.email = p_email
    GROUP BY u.id;
END;
$$;
--# SPLIT
CREATE OR REPLACE FUNCTION auth_register_user(
    p_user_id VARCHAR,
    p_code_unique VARCHAR,
    p_email TEXT,
    p_password_hash TEXT,
    p_first_name TEXT,
    p_last_name TEXT,
    p_role_id VARCHAR
)
RETURNS TABLE (
    user_id VARCHAR,
    code_unique VARCHAR,
    email TEXT
)
LANGUAGE plpgsql AS
$$
BEGIN
    IF EXISTS (
        SELECT 1 FROM users u WHERE u.email = p_email
    ) THEN
        RAISE EXCEPTION 'EMAIL_ALREADY_EXISTS';
    END IF;

    INSERT INTO users (
        id,
        code_unique,
        email,
        password_hash,
        first_name,
        last_name,
        status,
        email_verified
    )
    VALUES (
        p_user_id,
        p_code_unique,
        p_email,
        p_password_hash,
        p_first_name,
        p_last_name,
        'active',
        FALSE
    );

    INSERT INTO user_roles (user_id, role_id)
    VALUES (p_user_id, p_role_id);

    RETURN QUERY
    SELECT p_user_id, p_code_unique, p_email;
END;
$$;
--# SPLIT
CREATE OR REPLACE FUNCTION fn_create_session(
    p_session_id VARCHAR,
    p_user_id VARCHAR,
    p_refresh_token_hash VARCHAR,
    p_device_info TEXT,
    p_ip_address VARCHAR,
    p_expires_at TIMESTAMPTZ
)
RETURNS VOID AS
$$
BEGIN
    INSERT INTO sessions (
        id,
        user_id,
        refresh_token_hash,
        device_info,
        ip_address,
        expires_at
    )
    VALUES (
        p_session_id,
        p_user_id,
        p_refresh_token_hash,
        p_device_info,
        p_ip_address,
        p_expires_at
    );
END;
$$ LANGUAGE plpgsql;
--# SPLIT
CREATE OR REPLACE FUNCTION fn_get_session_by_refresh_token(
    p_refresh_token_hash VARCHAR
)
RETURNS TABLE (
    id VARCHAR,
    user_id VARCHAR,
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ
) AS
$$
BEGIN
    RETURN QUERY
    SELECT s.id, s.user_id, s.expires_at, s.revoked_at
    FROM sessions s
    WHERE refresh_token_hash = p_refresh_token_hash;
END;
$$ LANGUAGE plpgsql;
--# SPLIT
CREATE OR REPLACE FUNCTION fn_rotate_refresh_token(
    p_session_id VARCHAR,
    p_new_refresh_hash VARCHAR,
    p_new_exp TIMESTAMPTZ
)
RETURNS VOID AS
$$
BEGIN
    UPDATE sessions
    SET
        refresh_token_hash = p_new_refresh_hash,
        expires_at = p_new_exp
    WHERE id = p_session_id AND revoked_at IS NULL;
END;
$$ LANGUAGE plpgsql;
--# SPLIT
CREATE OR REPLACE FUNCTION fn_revoke_session(
    p_session_id VARCHAR
)
RETURNS VOID AS
$$
BEGIN
    UPDATE sessions
    SET revoked_at = NOW()
    WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql;
--# SPLIT
CREATE OR REPLACE FUNCTION fn_revoke_all_sessions(
    p_user_id VARCHAR
)
RETURNS VOID AS
$$
BEGIN
    UPDATE sessions
    SET revoked_at = NOW()
    WHERE user_id = p_user_id AND revoked_at IS NULL;
END;
$$ LANGUAGE plpgsql;
