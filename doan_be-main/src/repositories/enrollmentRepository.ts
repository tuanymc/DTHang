import { injectable } from "tsyringe";
import { Database } from "../config/database";
import { v4 as uuidv4 } from "uuid";
import { PurchaseRepository } from "./purchaseRepository";
import { CertificateRepository } from "./certificateRepository";

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
    access_kind?: string | null;
}

@injectable()
export class EnrollmentRepository {
    constructor(
        private db: Database,
        private purchaseRepository: PurchaseRepository,
        private certificateRepository: CertificateRepository,
    ) {}

    async getCoursePriceAndTrial(courseId: string): Promise<{
        price: number;
        allows_trial: boolean;
        status: string;
    }> {
        const r = await this.db.query(
            `
            SELECT COALESCE(c.price::float8, 0) AS price,
                   COALESCE(c.allows_trial, TRUE) AS allows_trial,
                   c.status::text AS status
            FROM courses c
            WHERE c.id = $1
            `,
            [courseId],
        );
        const row = r.rows[0] as
            | { price: number; allows_trial: boolean; status: string }
            | undefined;
        if (!row) throw new Error("Không tìm thấy khóa học");
        return {
            price: Number(row.price ?? 0),
            allows_trial: Boolean(row.allows_trial),
            status: String(row.status ?? ""),
        };
    }

    async getAccessKind(
        userId: string | undefined | null,
        courseId: string,
    ): Promise<"trial" | "full" | null> {
        if (!userId) return null;
        const r = await this.db.query(
            `
            SELECT access_kind::text AS access_kind
            FROM course_enrollments
            WHERE user_id = $1 AND course_id = $2
            LIMIT 1
            `,
            [userId, courseId],
        );
        const k = r.rows[0]?.access_kind as string | undefined;
        if (k === "trial" || k === "full") return k;
        return null;
    }

    async canViewFullCurriculum(
        userId: string,
        courseId: string,
    ): Promise<boolean> {
        const r = await this.db.query(
            `
            SELECT EXISTS (
                SELECT 1 FROM courses c
                WHERE c.id = $2 AND c.instructor_id = $1
            )
            OR EXISTS (
                SELECT 1 FROM course_enrollments e
                WHERE e.user_id = $1 AND e.course_id = $2 AND e.access_kind = 'full'
            )
            OR EXISTS (
                SELECT 1
                FROM user_roles ur
                JOIN roles r ON r.id = ur.role_id
                WHERE ur.user_id = $1
                  AND LOWER(TRIM(r.role_name)) = 'admin'
            ) AS ok
            `,
            [userId, courseId],
        );
        return Boolean(r.rows[0]?.ok);
    }

    async enrollFull(
        userId: string,
        courseId: string,
        options?: { bypassPurchaseCheck?: boolean },
    ): Promise<boolean> {
        const meta = await this.getCoursePriceAndTrial(courseId);
        if (meta.status !== "published") {
            throw new Error("Chỉ đăng ký được khóa học đang xuất bản");
        }

        const paid =
            await this.purchaseRepository.hasPaidCoursePurchase(
                userId,
                courseId,
            );
        if (meta.price > 0 && !options?.bypassPurchaseCheck && !paid) {
            throw new Error(
                "Khóa học trả phí: vui lòng thanh toán (mua khóa) trước khi học đầy đủ.",
            );
        }

        await this.db.query(
            `
            INSERT INTO course_enrollments (
                id, user_id, course_id, progress_percent, access_kind
            )
            VALUES ($1, $2, $3, 0, 'full')
            ON CONFLICT (user_id, course_id)
            DO UPDATE SET
                access_kind = 'full',
                enrolled_at = course_enrollments.enrolled_at
            `,
            [uuidv4(), userId, courseId],
        );
        return true;
    }

    async startTrial(userId: string, courseId: string): Promise<void> {
        const meta = await this.getCoursePriceAndTrial(courseId);
        if (meta.status !== "published") {
            throw new Error("Chỉ học thử được khóa đang xuất bản");
        }
        if (!meta.allows_trial) {
            throw new Error("Khóa học không bật học thử.");
        }

        const existing = await this.getAccessKind(userId, courseId);
        if (existing === "full") {
            throw new Error("Bạn đã học đầy đủ khóa này.");
        }
        if (existing === "trial") {
            return;
        }

        await this.db.query(
            `
            INSERT INTO course_enrollments (
                id, user_id, course_id, progress_percent, access_kind
            )
            VALUES ($1, $2, $3, 0, 'trial')
            `,
            [uuidv4(), userId, courseId],
        );
    }

    async enrollFreePublished(userId: string, courseId: string): Promise<void> {
        const meta = await this.getCoursePriceAndTrial(courseId);
        if (meta.status !== "published") {
            throw new Error("Chỉ đăng ký được khóa học đang xuất bản");
        }
        if (meta.price > 0) {
            throw new Error("Vui lòng mua khóa học để được ghi danh đầy đủ.");
        }
        await this.enrollFull(userId, courseId, {
            bypassPurchaseCheck: true,
        });
    }

    async enroll(userId: string, courseId: string): Promise<boolean> {
        await this.enrollFreePublished(userId, courseId);
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
                   e.access_kind::text AS access_kind,
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

    async enrollmentSnapshot(userId: string, courseId: string): Promise<{
        progress_percent: number;
        completed_at: string | null;
        access_kind: "trial" | "full";
    } | null> {
        if (!userId) return null;
        const r = await this.db.query(
            `
            SELECT
                COALESCE(progress_percent::float8, 0) AS pct,
                completed_at::text AS completed_at,
                access_kind::text AS access_kind
            FROM course_enrollments
            WHERE user_id = $1 AND course_id = $2
            LIMIT 1
            `,
            [userId, courseId],
        );
        const row = r.rows[0] as
            | {
                  pct: number;
                  completed_at?: string | null;
                  access_kind: string;
              }
            | undefined;
        if (!row) return null;
        const ak =
            row.access_kind === "trial" || row.access_kind === "full"
                ? row.access_kind
                : ("full" as const);
        return {
            progress_percent: Number(row.pct ?? 0),
            completed_at: row.completed_at ?? null,
            access_kind: ak,
        };
    }

    async recomputeEnrollmentProgress(
        userId: string,
        courseId: string,
    ): Promise<void> {
        const access = await this.getAccessKind(userId, courseId);
        if (!access) return;

        const filterPreview = access === "trial";

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
                            / NULLIF(COUNT(l.id)::numeric, 0)
                        ),
                        2
                    )
                END AS pct
            FROM lessons l
            JOIN sections s ON s.id = l.section_id AND s.course_id = $2
            LEFT JOIN lesson_progress lp
                ON lp.lesson_id = l.id AND lp.user_id = $1
            WHERE (
                $3::boolean IS NOT TRUE
                OR COALESCE(l.is_preview, FALSE) = TRUE
            )
            `,
            [userId, courseId, filterPreview],
        );
        const pct = Number(r.rows[0]?.pct ?? 0);

        await this.db.query(
            `
            UPDATE course_enrollments
            SET
                progress_percent = $3,
                completed_at = CASE
                    WHEN $3 >= 100 AND access_kind = 'full' THEN COALESCE(completed_at, NOW())
                    ELSE completed_at
                END
            WHERE user_id = $1 AND course_id = $2
            `,
            [userId, courseId, pct],
        );

        if (pct >= 100 && access === "full") {
            await this.certificateRepository.ensureCertificate(userId, courseId);
        }
    }

    async ensureEligibleForCourseReview(
        userId: string,
        courseId: string,
    ): Promise<void> {
        const r = await this.db.query(
            `
            SELECT
                COALESCE(progress_percent::float8, 0) AS pct,
                access_kind::text AS access_kind,
                completed_at
            FROM course_enrollments
            WHERE user_id = $1 AND course_id = $2
            LIMIT 1
            `,
            [userId, courseId],
        );
        const row = r.rows[0] as
            | { pct: number; access_kind: string; completed_at?: string | null }
            | undefined;
        if (!row || row.access_kind !== "full") {
            throw new Error(
                "Chỉ đánh giá sau khi hoàn thành khóa (học đầy đủ).",
            );
        }
        const pct = Number(row.pct ?? 0);
        const doneByDate = !!row.completed_at;
        if (!doneByDate && pct < 99)
            throw new Error(
                "Hoàn thành khóa (tiến độ ~100%) để được đánh giá.",
            );
    }
}
