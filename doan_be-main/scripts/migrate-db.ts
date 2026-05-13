/**
 * Áp các file SQL trong database/migrations theo thứ tự tên file.
 * Kết nối từ biến môi trường trong .env (thư mục gốc backend).
 *
 * Usage (tại thư mục doan_be-main): npm run db:migrate
 */
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { Client } from "pg";

const BACKEND_ROOT = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(BACKEND_ROOT, ".env") });

function splitStatements(sql: string): string[] {
    const trimmed = sql.replace(/^\uFEFF/, "").trim();
    if (!trimmed.includes("--# SPLIT")) {
        return trimmed ? [trimmed] : [];
    }
    return trimmed
        .split(/\r?\n--# SPLIT\r?\n/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
}

async function ensureMigrationsTable(client: Client): Promise<void> {
    await client.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            version VARCHAR(255) PRIMARY KEY NOT NULL,
            applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
}

async function isApplied(client: Client, version: string): Promise<boolean> {
    const { rows } = await client.query(
        `SELECT 1 FROM schema_migrations WHERE version = $1`,
        [version],
    );
    return rows.length > 0;
}

async function markApplied(client: Client, version: string): Promise<void> {
    await client.query(
        `INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT (version) DO NOTHING`,
        [version],
    );
}

async function main(): Promise<void> {
    const host = process.env.DB_HOST ?? "localhost";
    const port = Number(process.env.DB_PORT ?? 5432);
    const user = process.env.DB_USERNAME ?? process.env.DB_USER ?? "postgres";
    const password =
        process.env.DB_PASSWORD ??
        process.env.DB_PASS ??
        process.env.POSTGRES_PASSWORD;
    const database = process.env.DB_NAME ?? "postgres";

    if (password == null || password === "") {
        console.error(
            "Thiếu DB_PASSWORD (hoặc DB_PASS) trong .env — không thể kết nối.",
        );
        process.exit(1);
    }

    const migrationsDir = path.join(BACKEND_ROOT, "database", "migrations");
    if (!fs.existsSync(migrationsDir)) {
        console.error("Không tìm thấy thư mục migrations:", migrationsDir);
        process.exit(1);
    }

    const files = fs
        .readdirSync(migrationsDir)
        .filter((f) => f.endsWith(".sql"))
        .sort((a, b) => a.localeCompare(b));

    const client = new Client({
        host,
        port,
        user,
        password,
        database,
    });

    console.log(`Kết nối PostgreSQL: ${user}@${host}:${port}/${database}`);

    try {
        await client.connect();
        await ensureMigrationsTable(client);

        for (const file of files) {
            const abs = path.join(migrationsDir, file);
            const already = await isApplied(client, file);
            if (already) {
                console.log(`[bỏ qua] Đã chạy: ${file}`);
                continue;
            }

            const sqlRaw = fs.readFileSync(abs, "utf8");
            const statements = splitStatements(sqlRaw);
            console.log(`[chạy] ${file} (${statements.length} lệnh)`);

            await client.query("BEGIN");
            try {
                for (let i = 0; i < statements.length; i++) {
                    await client.query(statements[i]);
                }
                await markApplied(client, file);
                await client.query("COMMIT");
            } catch (e) {
                await client.query("ROLLBACK");
                console.error(`Lỗi khi áp migration ${file} (statement block):`);
                throw e;
            }
        }

        console.log("Hoàn tất migration.");
    } finally {
        await client.end();
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
