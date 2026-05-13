require("dotenv").config();

export const config = {
    port: process.env.PORT || 8096,
    limit_size: process.env.LIMIT_SIZE || 3145728,
    db: {
        host: process.env.DB_HOST || "postgres_db",
        port: Number(process.env.DB_PORT || 5432),
        username:
            process.env.DB_USERNAME || process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "123456",
        database: process.env.DB_NAME || "mydb",
    },
    jwt: {
        secret: process.env.JWT_SECRET || "this is the graduation project",
        expiresIn: process.env.JWT_EXPIRES_IN || "2d",
    },
};

export const authConfig = {
    jwtSecret: process.env.JWT_SECRET || "this is a secret key",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
    cookieName: "auth_token",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "sao lai refresh",
    refreshExpiresIn: "7d",
    refreshCookieName: "refresh_token",
    emailVerificationExpires: "1d",
    passwordResetExpires: "1h",
};

export const rateLimitConfig = {
    login: {
        windowMs: 24 * 60 * 60 * 1000,
        max: 100
    }
}