/**
 * Chèn dữ liệu demo (người dùng, chuyên ngành, danh mục, khóa học, nội dung, đăng ký học).
 * Chạy từ thư mục gốc backend: npm run db:seed
 *
 * Xóa dữ liệu demo đã có rồi chèn lại: npm run db:seed -- --purge
 * Mật khẩu mặc định: Demo@123 (đổi bằng biến SEED_DEMO_PASSWORD trong .env)
 */
import bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import * as path from "path";
import { Client } from "pg";

const BACKEND_ROOT = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(BACKEND_ROOT, ".env") });

const PASSWORD_PLAIN =
    process.env.SEED_DEMO_PASSWORD?.trim() || "Demo@123";

const PREFIX = {
    adminUser: "usr-demo-admin",
    instructorUser: "usr-demo-trainer",
    studentUser: "usr-demo-student",
    enroll: "demo-enrollment",
    enroll2: "demo-enrollment2",
};

const IDS = {
    majorCs: "demo-major-cs",
    majorIt: "demo-major-it",
    catFrontend: "demo-cat-fe",
    catBackend: "demo-cat-be",
    courseWeb: "demo-course-web-fe",
    courseSql: "demo-course-sql-be",
    secWebIntro: "demo-sec-intro",
    secWebUi: "demo-sec-react",
    lesWebV1: "demo-les-welcome-video",
    lesWebDocs: "demo-les-react-docs",
    lesWebQuiz: "demo-les-js-quiz",
    secSqlBase: "demo-sec-sql",
    lesSqlDoc: "demo-les-sql-intro",
    lesSqlExam: "demo-les-sql-exam",
};

async function purgeDemo(client: Client): Promise<void> {
    console.log("Đang xóa dữ liệu demo (purge)…");

    await client.query(
        `DELETE FROM study_events WHERE user_id LIKE 'usr-demo-%'`,
    ).catch((e: { code?: string }) => {
        if (e.code !== "42P01") throw e;
    });
    await client.query(
        `DELETE FROM user_quiz_attempts WHERE user_id LIKE 'usr-demo-%' OR lesson_id LIKE 'demo-les-%'`,
    );
    await client.query(
        `DELETE FROM lesson_progress WHERE user_id LIKE 'usr-demo-%'`,
    );
    await client.query(
        `DELETE FROM course_enrollments WHERE id LIKE 'demo-enrollment%' OR user_id LIKE 'usr-demo-%'`,
    );

    await client.query(`DELETE FROM lessons WHERE id LIKE 'demo-les-%'`);
    await client.query(`DELETE FROM sections WHERE id LIKE 'demo-sec-%'`);

    await client.query(
        `DELETE FROM course_majors WHERE course_id LIKE 'demo-course-%'`,
    );
    await client.query(
        `DELETE FROM course_categories WHERE course_id LIKE 'demo-course-%'`,
    );
    await client.query(`DELETE FROM courses WHERE id LIKE 'demo-course-%'`);

    await client.query(`DELETE FROM categories WHERE id LIKE 'demo-cat-%'`);
    await client.query(`DELETE FROM major WHERE id LIKE 'demo-major-%'`);

    await client.query(
        `DELETE FROM sessions WHERE user_id LIKE 'usr-demo-%'`,
    );
    await client.query(`DELETE FROM user_roles WHERE user_id LIKE 'usr-demo-%'`);
    await client.query(`DELETE FROM users WHERE id LIKE 'usr-demo-%'`);

    console.log("Purge demo xong.");
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
        console.error("Thiếu DB_PASSWORD trong .env.");
        process.exit(1);
    }

    const purge =
        process.argv.includes("--purge") ||
        process.env.SEED_PURGE === "1" ||
        process.env.SEED_PURGE === "true";

    const client = new Client({ host, port, user, password, database });

    console.log(`Kết nối ${user}@${host}:${port}/${database}`);

    try {
        await client.connect();

        const passwordHash = await bcrypt.hash(PASSWORD_PLAIN, 10);

        if (purge) {
            await client.query("BEGIN");
            await purgeDemo(client);
            await client.query("COMMIT");
        }

        await client.query("BEGIN");

        await client.query(
            `
            INSERT INTO roles (id, role_name, description)
            VALUES
                ('role-admin', 'admin', 'Quản trị'),
                ('role-instructor', 'instructor', 'Giảng viên'),
                ('role-student', 'student', 'Sinh viên')
            ON CONFLICT (id) DO NOTHING
            `,
        );

        await client.query(
            `
            INSERT INTO users (
                id, code_unique, email, password_hash, first_name, last_name,
                status, email_verified, bio
            ) VALUES
            ($1,$2,$3,$4,$5,$6,'active',true,$7),
            ($8,$9,$10,$11,$12,$13,'active',true,$14),
            ($15,$16,$17,$18,$19,$20,'active',true,$21)
            ON CONFLICT (email) DO NOTHING
            `,
            [
                PREFIX.adminUser,
                "DEMOAD001",
                "admin.demo@lms.local",
                passwordHash,
                "Quản",
                "Trị",
                "Tài khoản quản trị demo",
                PREFIX.instructorUser,
                "DEMOINS01",
                "giangvien.demo@lms.local",
                passwordHash,
                "Kim",
                "Giảng",
                "Giảng viên minh họa",
                PREFIX.studentUser,
                "DEMOSTU01",
                "sinhvien.demo@lms.local",
                passwordHash,
                "Nam",
                "Sinh Viên",
                "Sinh viên minh họa",
            ],
        );

        await client.query(
            `
            INSERT INTO user_roles (user_id, role_id) VALUES
            ($1, 'role-admin'),
            ($2, 'role-instructor'),
            ($3, 'role-student')
            ON CONFLICT DO NOTHING
            `,
            [
                PREFIX.adminUser,
                PREFIX.instructorUser,
                PREFIX.studentUser,
            ],
        );

        await client.query(
            `
            INSERT INTO major (id, name, description) VALUES
                ($1, 'Khoa học máy tính', 'Chương trình demo LMS'),
                ($2, 'Công nghệ thông tin', 'Chương trình demo LMS')
            ON CONFLICT (id) DO NOTHING
            `,
            [IDS.majorCs, IDS.majorIt],
        );

        await client.query(
            `
            INSERT INTO categories (id, name, slug, description) VALUES
                ($1, N'Lập trình Web', $2, N'HTML, CSS, JavaScript, React'),
                ($3, N'Cơ sở dữ liệu', $4, N'SQL, PostgreSQL, thiết kế CSDL')
            ON CONFLICT (id) DO NOTHING
            `,
            [
                IDS.catFrontend,
                "demo-lap-trinh-web",
                IDS.catBackend,
                "demo-co-so-du-lieu",
            ],
        );

        await client.query(
            `
            INSERT INTO courses (
                id, title, slug, description, thumbnail_url,
                instructor_id, level, price, status, published_at, duration
            ) VALUES
                ($1,$2,$3,$4,$5,$6,$7,$8,'published',now(),450),
                ($9,$10,$11,$12,$13,$14,$15,$16,'draft',NULL,120)
            ON CONFLICT (id) DO NOTHING
            `,
            [
                IDS.courseWeb,
                "Lập trình Web hiện đại (demo)",
                "demo-lap-trinh-web-co-ban",
                "Khóa học demo: ôn kiến thức HTML/CSS/JS/React, có video, tài liệu, quiz và ôn cuối chương.",
                "https://picsum.photos/id/180/960/540",
                PREFIX.instructorUser,
                "beginner",
                0,
                IDS.courseSql,
                "PostgreSQL cho người mới (demo)",
                "demo-postgresql-co-ban",
                "Khóa nháp (draft): các bài SQL và bài kiểm tra nhỏ.",
                "https://picsum.photos/id/119/960/540",
                PREFIX.instructorUser,
                "intermediate",
                299000,
            ],
        );

        await client.query(
            `
            INSERT INTO course_majors (course_id, major_id) VALUES ($1,$2), ($3,$4)
            ON CONFLICT DO NOTHING`,
            [
                IDS.courseWeb,
                IDS.majorIt,
                IDS.courseSql,
                IDS.majorCs,
            ],
        );

        await client.query(
            `
            INSERT INTO course_categories (course_id, category_id) VALUES ($1,$2), ($3,$4)
            ON CONFLICT DO NOTHING`,
            [
                IDS.courseWeb,
                IDS.catFrontend,
                IDS.courseSql,
                IDS.catBackend,
            ],
        );

        await client.query(
            `
            INSERT INTO sections (id, course_id, title, position) VALUES
                ($1,$2,N'Giới thiệu & JavaScript',0),
                ($3,$2,N'Frontend với React',1),
                ($4,$5,N'Module SQL cơ bản',0)
            ON CONFLICT (id) DO NOTHING
            `,
            [
                IDS.secWebIntro,
                IDS.courseWeb,
                IDS.secWebUi,
                IDS.secSqlBase,
                IDS.courseSql,
            ],
        );

        const quizPayload = JSON.stringify({
            questions: [
                {
                    id: "dq1",
                    text: "const trong JavaScript nghĩa là gì?",
                    options: [
                        "Hằng gán được một lần",
                        "Biến toàn cục",
                        "Kiểu số học",
                        "Hàm vô danh",
                    ],
                    correctAnswer: "Hằng gán được một lần",
                    points: 2,
                },
            ],
            passingScore: 50,
        });

        const docsPayload = JSON.stringify({
            content:
                "## React và component\nComponent giúp tái sử dụng UI. Props truyền dữ liệu từ cha xuống con.",
        });

        const examPayload = JSON.stringify({
            questions: [
                {
                    id: "eq1",
                    text: "Câu lệnh SELECT dùng để làm gì?",
                    options: [
                        "Thêm hàng",
                        "Đọc dữ liệu",
                        "Xóa bảng",
                        "Đổi tên cột",
                    ],
                    correctAnswer: "Đọc dữ liệu",
                    points: 3,
                },
            ],
            passingScore: 60,
        });

        await client.query(
            `
            INSERT INTO lessons (
                id, section_id, title, description, lesson_type,
                video_url, video_duration, content_json, position, is_preview
            ) VALUES
                ($1,$2,N'Bài giới thiệu khóa',N'Clip ngắn minh họa','video',
                 'https://www.youtube.com/embed/dQw4w9WgXcQ',180,null,0,true),
                ($3,$4,N'Tóm tắt React Docs',N'Định dạng markdown','docs',
                 null,null,$5::jsonb,1,false),
                ($6,$7,N'Trắc nghiệm nhanh JavaScript','','quiz',
                 null,null,$8::jsonb,2,false),
                ($9,$10,N'Ghi chép SQL căn bản','','docs',
                 null,null,$11::jsonb,0,true),
                ($12,$13,N'Kiểm tra SQL (demo exam)','','exam',
                 null,null,$14::jsonb,1,false)
            ON CONFLICT (id) DO NOTHING
            `,
            [
                IDS.lesWebV1,
                IDS.secWebIntro,
                IDS.lesWebDocs,
                IDS.secWebUi,
                docsPayload,
                IDS.lesWebQuiz,
                IDS.secWebIntro,
                quizPayload,
                IDS.lesSqlDoc,
                IDS.secSqlBase,
                JSON.stringify({
                    content:
                        "```sql\nSELECT id, email FROM users WHERE status = 'active';\n```",
                }),
                IDS.lesSqlExam,
                IDS.secSqlBase,
                examPayload,
            ],
        );

        await client.query(
            `
            INSERT INTO course_enrollments (
                id, user_id, course_id, progress_percent
            ) VALUES ($1,$2,$3,$4), ($5,$2,$6,$7)
            ON CONFLICT (user_id, course_id) DO NOTHING
            `,
            [
                PREFIX.enroll,
                PREFIX.studentUser,
                IDS.courseWeb,
                25,
                PREFIX.enroll2,
                IDS.courseSql,
                5,
            ],
        );

        await client.query(
            `
            INSERT INTO lesson_progress (
                id, user_id, lesson_id, progress_percent, is_completed
            ) VALUES ($1,$2,$3,$4,$5)
            ON CONFLICT (user_id, lesson_id) DO NOTHING
            `,
            [
                "demo-progress-1",
                PREFIX.studentUser,
                IDS.lesWebV1,
                100,
                true,
            ],
        );

        await client.query("COMMIT");

        console.log("\nĐã seed dữ liệu demo (idempotent: ON CONFLICT bỏ qua bản ghi trùng).");
        console.log("--- Tài khoản (cùng mật khẩu) ---");
        console.log(`  Admin:      admin.demo@lms.local`);
        console.log(`  Giảng viên: giangvien.demo@lms.local`);
        console.log(`  Sinh viên:  sinhvien.demo@lms.local`);
        console.log(`  Mật khẩu:    ${PASSWORD_PLAIN}`);
        console.log("--- Khóa học ---");
        console.log(`  Published: ${IDS.courseWeb} / slug demo-lap-trinh-web-co-ban`);
        console.log(`  Draft:     ${IDS.courseSql} / slug demo-postgresql-co-ban`);
        console.log("\nGợi ý: npm run db:seed -- --purge nếu muốn xóa rồi chèn lại toàn bộ demo.");
    } catch (e) {
        await client.query("ROLLBACK").catch(() => {});
        console.error(e);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();
