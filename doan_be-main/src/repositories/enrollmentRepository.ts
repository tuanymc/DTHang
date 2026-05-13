import { injectable } from "tsyringe";
import { Database } from "../config/database";
import { v4 as uuidv4 } from "uuid";

export interface EnrollmentRow {
    id: string;
    progress_percent: string | number | null;
    enrolled_at: string;
    completed_at?: string | null;
    course_id: string;
    title: string;
    description?: string | null;
    thumbnail_url?: string | null;
    level?: string | null;
    status?: string | null;
    duration?: string | number | null;
    inst_fn?: string | null;
    inst_ln?: string | null;
    inst_email?: string | null;
}

@injectable()
export class EnrollmentRepository {
    constructor(private db: Database) {}

    async enroll(userId: string, courseId: string): Promise<boolean> {
        const found = await this.db.query(
            `SELECT status FROM courses WHERE id = $1`,
            [courseId],
        );
        if (!found.rows[0])
            throw new Error("Không tìm thấy khóa học");
        if (found.rows[0].status !== "published") {
            throw new Error(
                "Chỉ đăng ký được khóa học đang xuất bản",
            );
        }

        await this.db.query(
            `
            INSERT INTO course_enrollments (id, user_id, course_id, progress_percent)
            VALUES ($1, $2, $3, 0)
            ON CONFLICT (user_id, course_id) DO UPDATE SET enrolled_at = course_enrollments.enrolled_at
            `,
            [uuidv4(), userId, courseId],
        );
        return true;
    }

    async isEnrolled(
        userId: string | undefined | null,
        courseId: string,
    ): Promise<boolean> {
        if (!userId) return false;
        const r = await this.db.query(
            `
            SELECT 1 FROM course_enrollments e
            WHERE e.user_id = $1 AND e.course_id = $2 LIMIT 1
            `,
            [userId, courseId],
        );
        return r.rows.length > 0;
    }

    async listByUser(userId: string): Promise<EnrollmentRow[]> {
        const r = await this.db.query(
            `
            SELECT e.id::text AS id,
                   e.progress_percent::text AS progress_percent,
                   e.enrolled_at::text AS enrolled_at,
                   e.completed_at::text AS completed_at,
                   c.id AS course_id,
                   c.title,
                   c.description,
                   c.thumbnail_url,
                   c.level,
                   c.status,
                   c.duration,
                   u.first_name AS inst_fn,
                   u.last_name AS inst_ln,
                   u.email AS inst_email
            FROM course_enrollments e
            JOIN courses c ON c.id = e.course_id
            LEFT JOIN users u ON u.id = c.instructor_id
            WHERE e.user_id = $1
            ORDER BY e.enrolled_at DESC
            `,
            [userId],
        );
        return r.rows as EnrollmentRow[];
    }

    async recomputeEnrollmentProgress(
        userId: string,
        courseId: string,
    ): Promise<void> {
        const r = await this.db.query(
            `
            SELECT
                CASE
                    WHEN COUNT(l.id) = 0 THEN 0::numeric
                    ELSE ROUND(
                        (
                            100.0
                            * COUNT(*) FILTER (
                                WHERE COALESCE(lp.is_completed, FALSE)
                            )::numeric
                            / COUNT(l.id)::numeric
                        ),
                        2
                    )
                END AS pct
            FROM lessons l
            JOIN sections s ON s.id = l.section_id AND s.course_id = $2
            LEFT JOIN lesson_progress lp
                ON lp.lesson_id = l.id AND lp.user_id = $1
            `,
            [userId, courseId],
        );
        const pct = Number(r.rows[0]?.pct ?? 0);

        await this.db.query(
            `
            UPDATE course_enrollments
            SET
                progress_percent = $3,
                completed_at = CASE
                    WHEN $3 >= 100 THEN COALESCE(completed_at, NOW())
                    ELSE completed_at
                END
            WHERE user_id = $1 AND course_id = $2
            `,
            [userId, courseId, pct],
        );
    }
}
