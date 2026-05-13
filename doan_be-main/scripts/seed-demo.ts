/**
 * Chèn dữ liệu demo (người dùng, chuyên ngành, danh mục, khóa học, nội dung, đăng ký học).
 * Chạy từ thư mục gốc backend: npm run db:seed — gồm 5 khóa kỹ năng CNTT demo + bộ khóa hướng nghiệp
 * (`demo-course-hn-0001` …, theo nhóm: khám phá bản thân, chọn ngành, kỹ năng 21, phát triển nghề, công nghệ tương lai, phụ huynh/GV, chủ đề nổi bật).
 *
 * Xóa dữ liệu demo đã có rồi chèn lại: npm run db:seed -- --purge
 * Mật khẩu mặc định: Demo@123 (đổi bằng biến SEED_DEMO_PASSWORD trong .env)
 */
import bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import * as fs from "fs";
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
    majorHuongNghiep: "demo-major-huong-nghiep",
    catFrontend: "demo-cat-fe",
    catBackend: "demo-cat-be",
    catKyNangHocTap: "demo-cat-ky-nang-hoc-tap",
    catKyNangMem: "demo-cat-ky-nang-mem",
    catNgheNghiep: "demo-cat-nghe-nghiep",
    catDinhHuongNghe: "demo-cat-dinh-huong-nghe",
    catSoVaAi: "demo-cat-so-va-ai",
    catKhamPhaBanThan: "demo-cat-kham-pha-ban-than",
    catChonNganhTruong: "demo-cat-chon-nganh-truong",
    catCareerRoadmapNganh: "demo-cat-career-roadmap-nganh",
    catKyNangTheKy21: "demo-cat-ky-nang-the-ky-21",
    catPhatTrienNghe: "demo-cat-phat-trien-nghe-nghiep",
    catCongNgheTuongLai: "demo-cat-cong-nghe-nghe-tuong-lai",
    catPhHuynhGiaoVien: "demo-cat-phu-huynh-giao-vien",
    catChuDeNoiBat: "demo-cat-chu-de-noi-bat",
    courseWeb: "demo-course-web-fe",
    courseSql: "demo-course-sql-be",
    courseKnHocTap: "demo-course-kn-hoc-tap",
    courseKnMem: "demo-course-kn-mem",
    courseNgheNghiep: "demo-course-nghe-nghiep",
    courseDinhHuongNghe: "demo-course-dinh-huong-nghe",
    courseSoVaAi: "demo-course-so-va-ai",
    secKnHocTap: "demo-sec-kn-hoc-tap",
    secKnMem: "demo-sec-kn-mem",
    secNgheNghiep: "demo-sec-nghe-nghiep",
    secDinhHuongNghe: "demo-sec-dinh-huong-nghe",
    secSoVaAi: "demo-sec-so-va-ai",
    lesKnHocTap: "demo-les-kn-hoc-tap",
    lesKnMem: "demo-les-kn-mem",
    lesNgheNghiep: "demo-les-nghe-nghiep",
    lesDinhHuongNghe: "demo-les-dinh-huong-nghe",
    lesSoVaAi: "demo-les-so-va-ai",
    secWebIntro: "demo-sec-intro",
    secWebUi: "demo-sec-react",
    lesWebV1: "demo-les-welcome-video",
    lesWebDocs: "demo-les-react-docs",
    lesWebQuiz: "demo-les-js-quiz",
    secSqlBase: "demo-sec-sql",
    lesSqlDoc: "demo-les-sql-intro",
    lesSqlExam: "demo-les-sql-exam",
};

/** Khóa bổ trợ: kỹ năng học/công việc, CSDL seed idempotent (`demo-course-*`). */
const SOFT_SKILL_CATALOG: {
    id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail: string;
    categoryId: string;
    secId: string;
    lesId: string;
    lessonMd: string;
}[] = [
    {
        id: IDS.courseKnHocTap,
        title: "Kỹ năng học tập hiệu quả",
        slug: "ky-nang-hoc-tap-trong-dai-hoc",
        description:
            "Xây thói quen ôn luyện, ghi chép, đọc tài liệu và tự học — nền cho mọi môn CNTT.",
        thumbnail: "https://picsum.photos/id/48/960/540",
        categoryId: IDS.catKyNangHocTap,
        secId: IDS.secKnHocTap,
        lesId: IDS.lesKnHocTap,
        lessonMd:
            `## Buổi mở đầu

- **Mục tiêu** rõ từng tuần, chia nhỏ việc.
- **Cornell/Pomodoro** áp dụng linh hoạt.
- **Ôn tập gợi nhớ** (active recall) thay vì chỉ đọc lại.`,
    },
    {
        id: IDS.courseKnMem,
        title: "Kỹ năng mềm cho sinh viên CNTT",
        slug: "ky-nang-mem-giao-tiep-tu-duy-thoi-gian",
        description:
            "Giao tiếp thuyết trình, tư duy phản biện, quản lý thời gian và phối hợp nhóm — phục vụ đồ án và thực tập.",
        thumbnail: "https://picsum.photos/id/827/960/540",
        categoryId: IDS.catKyNangMem,
        secId: IDS.secKnMem,
        lesId: IDS.lesKnMem,
        lessonMd:
            `## Nội dung chính

1. **Giao tiếp**: thông điệp rõ, lắng nghe phản hồi.
2. **Tư duy**: phân tích giả định, evidence-based.
3. **Thời gian**: ưu tiên Eisenhower, hạn chế đa nhiệm.
4. **Nhóm**: vai trò, cam kết, họp ngắn có biên bản.`,
    },
    {
        id: IDS.courseNgheNghiep,
        title: "Chuẩn bị nghề nghiệp: CV, phỏng vấn & portfolio",
        slug: "chuan-bi-nghe-nghiep-cv-phong-van-portfolio",
        description:
            "Viết CV/LinkedIn tiếng Việt & tiếng Anh, ôn STAR, demo GitHub/portfolio dự án — hướng tới fresher và thực tập.",
        thumbnail: "https://picsum.photos/id/1060/960/540",
        categoryId: IDS.catNgheNghiep,
        secId: IDS.secNgheNghiep,
        lesId: IDS.lesNgheNghiep,
        lessonMd:
            `## Lộ trình ngắn

- **CV 1 trang**, metrics rõ (repo, testcase, KPI).
- **STAR** cho phỏng vấn hành vi.
- **Portfolio**: README có hình gif, luồng chạy, tech stack.`,
    },
    {
        id: IDS.courseDinhHuongNghe,
        title: "Định hướng nghề chuyên sâu trong CNTT",
        slug: "dinh-huong-nghe-chuyen-sau-cntt",
        description:
            "Khung lựa chọn: backend/front/data/security/DevOps/QA; chứng chỉ và lộ trình học không chùng chồng.",
        thumbnail: "https://picsum.photos/id/366/960/540",
        categoryId: IDS.catDinhHuongNghe,
        secId: IDS.secDinhHuongNghe,
        lesId: IDS.lesDinhHuongNghe,
        lessonMd:
            `## Gợi ý khảo sát

So sánh **mô tả JD** phổ biến, **skill tree** và **portfolio** khớp vai. Thử mentorship/tech talk 90 ngày để củng cố hướng.`,
    },
    {
        id: IDS.courseSoVaAi,
        title: "Kỹ năng số — Khai phá và ứng dụng AI có trách nhiệm",
        slug: "ky-nang-so-va-ai-co-trach-nhiem",
        description:
            "Nền an toàn & quyền riêng tư online, prompts hiệu quả, làm việc với LLM, đạo đức và xác minh kết quả.",
        thumbnail: "https://picsum.photos/id/201/960/540",
        categoryId: IDS.catSoVaAi,
        secId: IDS.secSoVaAi,
        lesId: IDS.lesSoVaAi,
        lessonMd:
            `## Kỹ năng số & AI

- **Bản quyền & dữ liệu**: không nhập ẩn học vào ChatGPT không rõ điều khoản.
- **Prompt**: vai trò, ngữ cảnh, ví dụ, định dạng đầu ra.
- **Đối chứng kết luận** LLM — luôn kiểm tra nguồn và chạy thử.`,
    },
];

function slugifyVi(raw: string): string {
    const s = raw.replace(/[–—]/g, "-").normalize("NFD");
    const noMarks = s.replace(/\p{M}+/gu, "");
    const ascii = noMarks.replace(/đ/g, "d").replace(/Đ/g, "d").toLowerCase();
    return ascii
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 88);
}

type CareerSeedRow = { title: string; catId: string; audienceHint?: string };

/** Khóa hướng nghiệp / kỹ năng — id `demo-course-hn-XXXX` (thứ tự cố định cho combo lộ trình). */
function buildCareerCatalog(): CareerSeedRow[] {
    const rows: CareerSeedRow[] = [];
    const push = (
        catId: string,
        titles: string[],
        audienceHint?: string,
    ): void => {
        for (const title of titles) {
            rows.push({ title, catId, audienceHint });
        }
    };

    push(
        IDS.catKhamPhaBanThan,
        [
            "Khám phá bản thân bằng MBTI",
            "Ứng dụng Holland (RIASEC) trong chọn ngành nghề",
            "Ikigai – Tìm điểm giao giữa đam mê và nghề nghiệp",
            "Khám phá giá trị nghề nghiệp cá nhân",
            "Hiểu tính cách để chọn nghề phù hợp",
            "Xác định điểm mạnh – điểm yếu cá nhân",
            "Tư duy phát triển (Growth Mindset) cho học sinh",
            "Xây dựng sự tự tin và động lực học tập",
            "Kỹ năng quản trị cảm xúc tuổi học đường",
            'Thiết kế "bản đồ tương lai" cá nhân',
        ],
        "Nhóm Khám phá bản thân — học sinh THCS/THPT, sinh viên năm nhất.",
    );

    push(
        IDS.catChonNganhTruong,
        [
            "Chọn ngành học phù hợp với năng lực",
            "Top ngành nghề tương lai đến 2035",
            "Ngành AI, Data, Cybersecurity có phù hợp với bạn?",
            "Học kinh tế hay công nghệ?",
            "Hướng nghiệp cho học sinh khối A/B/C/D",
            "Chọn trường đại học thông minh",
            "Phân tích phổ điểm và cơ hội xét tuyển",
            "Kỹ năng đọc đề án tuyển sinh đại học",
            "Du học hay học trong nước?",
            "Nghề nghiệp không cần đại học vẫn thu nhập cao",
        ],
        "Học sinh lớp 9–12 — chọn ngành, chọn trường.",
    );

    push(
        IDS.catCareerRoadmapNganh,
        [
            "Career Roadmap: CNTT",
            "Career Roadmap: Marketing",
            "Career Roadmap: Thiết kế đồ họa",
            "Career Roadmap: Logistics",
            "Career Roadmap: Y dược",
            "Career Roadmap: Luật",
            "Career Roadmap: Sư phạm",
            "Career Roadmap: Ngôn ngữ",
            "Career Roadmap: Kỹ thuật bán dẫn",
            "Career Roadmap: AI & Robotics",
        ],
        "Roadmap gợi ý theo từng ngành.",
    );

    push(
        IDS.catKyNangTheKy21,
        [
            "Kỹ năng giao tiếp hiệu quả",
            "Thuyết trình và nói trước đám đông",
            "Tư duy phản biện (Critical Thinking)",
            "Giải quyết vấn đề sáng tạo",
            "Kỹ năng làm việc nhóm",
            "Quản lý thời gian cho học sinh – sinh viên",
            "Kỹ năng tự học trong thời đại AI",
            "Kỹ năng nghiên cứu và tìm kiếm thông tin",
            "Kỹ năng viết email và giao tiếp chuyên nghiệp",
            "Kỹ năng xây dựng thương hiệu cá nhân",
            "AI cho học sinh THPT",
            "Sử dụng ChatGPT để học tập hiệu quả",
            "Kỹ năng Prompt Engineering cơ bản",
            "Digital Literacy cho Gen Z",
        ],
        "Kỹ năng thế kỷ 21 — học sinh, sinh viên và người đi làm trẻ.",
    );

    push(
        IDS.catPhatTrienNghe,
        [
            "Viết CV chuyên nghiệp",
            "Xây dựng LinkedIn cá nhân",
            "Kỹ năng phỏng vấn xin việc",
            "Career Planning cho sinh viên",
            "Kỹ năng networking",
            "Quản trị mục tiêu nghề nghiệp",
            "Kỹ năng làm việc trong môi trường doanh nghiệp",
            "Kỹ năng quản lý công việc cá nhân",
            "Tư duy lãnh đạo trẻ",
            "Làm freelance từ con số 0",
            "Career Bootcamp — Tổng quan lộ trình",
            "Từ sinh viên đến nhân viên chuyên nghiệp",
            "First Job Success — Nền tảng cho công việc đầu tiên",
        ],
        "Sinh viên và người mới đi làm.",
    );

    push(
        IDS.catCongNgheTuongLai,
        [
            "AI sẽ thay đổi nghề nghiệp như thế nào?",
            "Các nghề nghiệp mới trong thời đại số",
            "Data Science cho người mới bắt đầu",
            "AI Literacy cho học sinh",
            "Blockchain và nghề nghiệp tương lai",
            "Kỹ năng số cho công dân tương lai",
            "Cybersecurity Awareness",
            "Tư duy công nghệ cho Gen Z",
            "Làm quen với lập trình cho học sinh",
            "Xây dựng portfolio số cá nhân",
        ],
        "Công nghệ & định hướng nghề tương lai.",
    );

    push(
        IDS.catPhHuynhGiaoVien,
        [
            "Đồng hành cùng con trong chọn ngành nghề",
            "Phụ huynh hiểu đúng về hướng nghiệp hiện đại",
            "Phát hiện năng lực nổi trội của con",
            "Tâm lý tuổi teen và định hướng nghề nghiệp",
            "Giáo viên chủ nhiệm với công tác hướng nghiệp",
            "Ứng dụng AI trong tư vấn học sinh",
            "Xây dựng hồ sơ năng lực cho học sinh THPT",
        ],
        "Phụ huynh và giáo viên.",
    );

    push(
        IDS.catChuDeNoiBat,
        [
            "AI có thay thế nghề của bạn không?",
            "Chọn sai ngành phải trả giá thế nào?",
            "Top ngành lương cao đến 2035",
            "Ngành học phù hợp với MBTI của bạn",
            "Học sinh dùng ChatGPT đúng cách",
            "10 nghề sẽ biến mất trong tương lai",
            "Làm sao biết mình phù hợp nghề gì?",
            "Roadmap từ học sinh đến kỹ sư AI",
            "Không giỏi Toán có học CNTT được không?",
            "Học đại học hay học nghề?",
        ],
        "Chủ đề viral / mở rộng.",
    );

    return rows;
}

const CAREER_CATALOG = buildCareerCatalog();

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

    await client.query(
        `DELETE FROM course_reviews WHERE course_id LIKE 'demo-course-%' OR id LIKE 'demo-review-%'`,
    );
    await client.query(`DELETE FROM path_purchases WHERE path_id LIKE 'demo-path-%'`);
    await client.query(`DELETE FROM learning_path_items WHERE path_id LIKE 'demo-path-%'`);
    await client.query(`DELETE FROM learning_paths WHERE id LIKE 'demo-path-%'`);

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
                ($2, 'Công nghệ thông tin', 'Chương trình demo LMS'),
                ($3, N'Hướng nghiệp & phát triển kỹ năng', N'Danh mục khóa định hướng nghề nghiệp, kỹ năng mềm và Công nghệ — seed demo')
            ON CONFLICT (id) DO NOTHING
            `,
            [IDS.majorCs, IDS.majorIt, IDS.majorHuongNghiep],
        );

        await client.query(
            `
            INSERT INTO categories (id, name, slug, description) VALUES
                ($1, N'Lập trình Web', $2, N'HTML, CSS, JavaScript, React'),
                ($3, N'Cơ sở dữ liệu', $4, N'SQL, PostgreSQL, thiết kế CSDL'),
                ($5, N'Kỹ năng học tập', $6, N'Phương pháp học, ghi chép, quản lý kiến thức'),
                ($7, N'Kỹ năng mềm', $8, N'Giao tiếp, tư duy phản biện, quản lý thời gian, làm việc nhóm'),
                ($9, N'Chuẩn bị nghề nghiệp', $10, N'CV, thư xin việc, phỏng vấn, portfolio'),
                ($11, N'Định hướng nghề chuyên sâu', $12, N'Khám phá lộ trình nghề, kỹ năng và chứng chỉ'),
                ($13, N'Kỹ năng số & AI', $14, N'Công dân số, công cụ, khai thác và ứng dụng AI trong học tập và công việc')
            ON CONFLICT (id) DO NOTHING
            `,
            [
                IDS.catFrontend,
                "demo-lap-trinh-web",
                IDS.catBackend,
                "demo-co-so-du-lieu",
                IDS.catKyNangHocTap,
                "demo-ky-nang-hoc-tap",
                IDS.catKyNangMem,
                "demo-ky-nang-mem",
                IDS.catNgheNghiep,
                "demo-chuan-bi-nghe-nghiep",
                IDS.catDinhHuongNghe,
                "demo-dinh-huong-nghe-chuyen-sau",
                IDS.catSoVaAi,
                "demo-ky-nang-so-va-ai",
            ],
        );

        await client.query(
            `
            INSERT INTO categories (id, name, slug, description) VALUES
                ($1, N'Khám phá bản thân', $2, N'Entry-level — MBTI, giá trị, mindset (seed demo hướng nghiệp)'),
                ($3, N'Chọn ngành – chọn trường', $4, N'Tuyển sinh ĐH, phổ điểm, định hướng khối A/B/C/D (seed demo)'),
                ($5, N'Career roadmap theo ngành', $6, N'Lộ trình gợi ý CNTT, Marketing, Y dược… (seed demo)'),
                ($7, N'Kỹ năng thế kỷ 21', $8, N'Giao tiếp, AI literacy, học tập & làm việc hiện đại (seed demo)'),
                ($9, N'Phát triển nghề nghiệp', $10, N'CV, LinkedIn, phỏng vấn, bootcamp (seed demo)'),
                ($11, N'Công nghệ & nghề tương lai', $12, N'AI, Data, an ninh mạng, portfolio số (seed demo)'),
                ($13, N'Phụ huynh & giáo viên', $14, N'Đồng hành con, tư vấn trong trường (seed demo)'),
                ($15, N'Chủ đề nổi bật', $16, N'Các chủ đề viral / thảo luận (seed demo)')
            ON CONFLICT (id) DO NOTHING
            `,
            [
                IDS.catKhamPhaBanThan,
                "demo-kham-pha-ban-than",
                IDS.catChonNganhTruong,
                "demo-chon-nganh-chon-truong",
                IDS.catCareerRoadmapNganh,
                "demo-career-roadmap-nganh",
                IDS.catKyNangTheKy21,
                "demo-ky-nang-the-ky-21",
                IDS.catPhatTrienNghe,
                "demo-phat-trien-nghe-nghiep",
                IDS.catCongNgheTuongLai,
                "demo-cong-nghe-nghe-tuong-lai",
                IDS.catPhHuynhGiaoVien,
                "demo-phu-huynh-giao-vien",
                IDS.catChuDeNoiBat,
                "demo-chu-de-noi-bat",
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

        for (const sc of SOFT_SKILL_CATALOG) {
            await client.query(
                `
                INSERT INTO courses (
                    id, title, slug, description, thumbnail_url,
                    instructor_id, level, price, status, published_at, duration
                )
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'published',now(),$9)
                ON CONFLICT (id) DO NOTHING`,
                [
                    sc.id,
                    sc.title,
                    sc.slug,
                    sc.description,
                    sc.thumbnail,
                    PREFIX.instructorUser,
                    "beginner",
                    0,
                    180,
                ],
            );
        }

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
            ON CONFLICT DO NOTHING
            `,
            [
                IDS.courseWeb,
                IDS.catFrontend,
                IDS.courseSql,
                IDS.catBackend,
            ],
        );

        for (const sc of SOFT_SKILL_CATALOG) {
            await client.query(
                `
                INSERT INTO course_majors (course_id, major_id)
                VALUES ($1,$2), ($1,$3)
                ON CONFLICT DO NOTHING`,
                [sc.id, IDS.majorIt, IDS.majorCs],
            );

            await client.query(
                `
                INSERT INTO course_categories (course_id, category_id)
                VALUES ($1,$2)
                ON CONFLICT DO NOTHING`,
                [sc.id, sc.categoryId],
            );
        }

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

        for (const sc of SOFT_SKILL_CATALOG) {
            await client.query(
                `
                INSERT INTO sections (id, course_id, title, position)
                VALUES ($1, $2, N'Tổng quan khóa', 0)
                ON CONFLICT (id) DO NOTHING`,
                [sc.secId, sc.id],
            );
        }

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

        for (const sc of SOFT_SKILL_CATALOG) {
            const introPayload = JSON.stringify({ content: sc.lessonMd });
            await client.query(
                `
                INSERT INTO lessons (
                    id, section_id, title, description, lesson_type,
                    video_url, video_duration, content_json, position, is_preview
                ) VALUES (
                    $1,$2,N'Tổng quan & tài liệu mở đầu',N'Minh họa nội dung chủ đề','docs',
                    null,null,$3::jsonb,0,true
                )
                ON CONFLICT (id) DO NOTHING`,
                [sc.lesId, sc.secId, introPayload],
            );
        }

        const hnCourseId = (n: number) =>
            `demo-course-hn-${String(n).padStart(4, "0")}`;
        const careerFreemiumNote =
            "**Mô hình gợi ý (freemium):** trắc nghiệm / mini-course / webinar miễn phí; career roadmap, coaching hoặc báo cáo chuyên sâu có thể triển khai trả phí sau.";

        for (let i = 0; i < CAREER_CATALOG.length; i++) {
            const row = CAREER_CATALOG[i];
            const num = String(i + 1).padStart(4, "0");
            const courseId = `demo-course-hn-${num}`;
            const secId = `demo-sec-hn-${num}`;
            const lesId = `demo-les-hn-${num}`;
            const slug = `${slugifyVi(row.title)}-hn-${num}`;
            const thumbId = 110 + ((i * 11) % 880);
            const durationMin = 120 + (i % 8) * 15;
            const description = [
                row.audienceHint ??
                    "Khóa minh họa LMS — định hướng nghề nghiệp và kỹ năng.",
                careerFreemiumNote,
            ].join("\n\n");

            await client.query(
                `
                INSERT INTO courses (
                    id, title, slug, description, thumbnail_url,
                    instructor_id, level, price, status, published_at, duration
                )
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'published',now(),$9)
                ON CONFLICT (id) DO NOTHING`,
                [
                    courseId,
                    row.title,
                    slug,
                    description,
                    `https://picsum.photos/id/${thumbId}/960/540`,
                    PREFIX.instructorUser,
                    "beginner",
                    0,
                    durationMin,
                ],
            );

            await client.query(
                `
                INSERT INTO course_majors (course_id, major_id)
                VALUES ($1,$2)
                ON CONFLICT DO NOTHING`,
                [courseId, IDS.majorHuongNghiep],
            );

            await client.query(
                `
                INSERT INTO course_categories (course_id, category_id)
                VALUES ($1,$2)
                ON CONFLICT DO NOTHING`,
                [courseId, row.catId],
            );

            await client.query(
                `
                INSERT INTO sections (id, course_id, title, position)
                VALUES ($1, $2, N'Tổng quan khóa', 0)
                ON CONFLICT (id) DO NOTHING`,
                [secId, courseId],
            );

            const lessonMd =
                `## ${row.title}\n\n` +
                (row.audienceHint ?
                    `**Gợi ý đối tượng:** ${row.audienceHint}\n\n`
                :   "") +
                `${careerFreemiumNote}\n\n` +
                `- Có thể bổ sung video, quiz và tài liệu tải về trong các bản cập nhật sau.\n`;

            await client.query(
                `
                INSERT INTO lessons (
                    id, section_id, title, description, lesson_type,
                    video_url, video_duration, content_json, position, is_preview
                ) VALUES (
                    $1,$2,N'Mini bài mở đầu',N'Nội dung tổng quan (seed demo)','docs',
                    null,null,$3::jsonb,0,true
                )
                ON CONFLICT (id) DO NOTHING`,
                [lesId, secId, JSON.stringify({ content: lessonMd })],
            );
        }

        await client.query(
            `
            INSERT INTO learning_paths (
                id, title, slug, description, audience_tag, bundle_price, status
            ) VALUES
                (
                    'demo-path-combo-thpt-huong-nghiep',
                    N'Combo THPT — Hướng nghiệp',
                    'combo-thpt-huong-nghiep',
                    N'MBTI + Holland + chọn ngành theo năng lực + quản lý thời gian học tập.',
                    N'Học sinh THPT',
                    0,
                    'published'
                ),
                (
                    'demo-path-combo-sinh-vien-nghe',
                    N'Combo Sinh viên — Vào nghề',
                    'combo-sinh-vien-vao-nghe',
                    N'CV + LinkedIn + phỏng vấn + ChatGPT học tập.',
                    N'Sinh viên',
                    0,
                    'published'
                ),
                (
                    'demo-path-combo-phu-huynh',
                    N'Combo Phụ huynh',
                    'combo-phu-huynh-huong-nghiep',
                    N'Đồng hành con + hiểu hướng nghiệp + tâm lý tuổi teen.',
                    N'Phụ huynh',
                    0,
                    'published'
                )
            ON CONFLICT (id) DO NOTHING`,
        );

        await client.query(
            `
            INSERT INTO learning_path_items (path_id, course_id, position) VALUES
                ('demo-path-combo-thpt-huong-nghiep', $1, 0),
                ('demo-path-combo-thpt-huong-nghiep', $2, 1),
                ('demo-path-combo-thpt-huong-nghiep', $3, 2),
                ('demo-path-combo-thpt-huong-nghiep', $4, 3),
                ('demo-path-combo-sinh-vien-nghe', $5, 0),
                ('demo-path-combo-sinh-vien-nghe', $6, 1),
                ('demo-path-combo-sinh-vien-nghe', $7, 2),
                ('demo-path-combo-sinh-vien-nghe', $8, 3),
                ('demo-path-combo-phu-huynh', $9, 0),
                ('demo-path-combo-phu-huynh', $10, 1),
                ('demo-path-combo-phu-huynh', $11, 2)
            ON CONFLICT (path_id, course_id) DO NOTHING`,
            [
                hnCourseId(1),
                hnCourseId(2),
                hnCourseId(11),
                hnCourseId(36),
                hnCourseId(45),
                hnCourseId(46),
                hnCourseId(47),
                hnCourseId(42),
                hnCourseId(68),
                hnCourseId(69),
                hnCourseId(71),
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

        const pathsSeedPath = path.join(
            BACKEND_ROOT,
            "database",
            "migrations",
            "V021_seed_learning_paths_and_reviews.sql",
        );
        if (fs.existsSync(pathsSeedPath)) {
            const pathsSql = fs.readFileSync(pathsSeedPath, "utf8").trim();
            if (pathsSql.length > 0)
                await client.query(pathsSql);
        }

        await client.query("COMMIT");

        console.log("\nĐã seed dữ liệu demo (idempotent: ON CONFLICT bỏ qua bản ghi trùng).");
        console.log("Đã áp thêm lộ trình + đánh giá mẫu (V021) nếu có file SQL.");
        console.log("--- Tài khoản (cùng mật khẩu) ---");
        console.log(`  Admin:      admin.demo@lms.local`);
        console.log(`  Giảng viên: giangvien.demo@lms.local`);
        console.log(`  Sinh viên:  sinhvien.demo@lms.local`);
        console.log(`  Mật khẩu:    ${PASSWORD_PLAIN}`);
        console.log("--- Khóa học ---");
        console.log(`  Published: ${IDS.courseWeb} / slug demo-lap-trinh-web-co-ban`);
        console.log(`  Draft:     ${IDS.courseSql} / slug demo-postgresql-co-ban`);
        console.log(
            "  Kỹ năng & nghề (published, miễn phí): " +
                SOFT_SKILL_CATALOG.map((x) => `"${x.title}"`).join(", "),
        );
        console.log(
            `  Hướng nghiệp & kỹ năng (published): ${CAREER_CATALOG.length} khóa — id demo-course-hn-0001 … hn-${String(CAREER_CATALOG.length).padStart(4, "0")}; combo lộ trình demo-path-combo-thpt-huong-nghiep / combo-sinh-vien-nghe / combo-phu-huynh.`,
        );
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
