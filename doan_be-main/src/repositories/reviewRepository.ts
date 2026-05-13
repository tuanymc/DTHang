import { injectable } from "tsyringe";
import { Database } from "../config/database";
import { v4 as uuidv4 } from "uuid";

@injectable()
export class ReviewRepository {
    constructor(private db: Database) {}

    async aggregateForCourse(courseId: string): Promise<{
        avg_rating: number;
        count: number;
    }> {
        const r = await this.db.query(
            `
            SELECT
                ROUND(COALESCE(AVG(rating::numeric), 0), 2)::float AS avg_rating,
                COUNT(*)::INT AS count
            FROM course_reviews
            WHERE course_id = $1
            `,
            [courseId],
        );
        const row = r.rows[0] as { avg_rating: number; count: number };
        return {
            avg_rating: Number(row?.avg_rating ?? 0),
            count: Number(row?.count ?? 0),
        };
    }

    async listByCourse(
        courseId: string,
        limit: number,
        offset: number,
    ): Promise<
        {
            id: string;
            rating: number;
            comment: string | null;
            created_at: string;
            first_name: string | null;
            last_name: string | null;
        }[]
    > {
        const r = await this.db.query(
            `
            SELECT cr.id::text AS id,
                   cr.rating::INT AS rating,
                   cr.comment::text AS comment,
                   cr.created_at::text AS created_at,
                   u.first_name::text AS first_name,
                   u.last_name::text AS last_name
            FROM course_reviews cr
            JOIN users u ON u.id = cr.user_id
            WHERE cr.course_id = $1
            ORDER BY cr.created_at DESC
            LIMIT $2 OFFSET $3
            `,
            [courseId, limit, offset],
        );
        return r.rows as {
            id: string;
            rating: number;
            comment: string | null;
            created_at: string;
            first_name: string | null;
            last_name: string | null;
        }[];
    }

    async upsertReview(params: {
        userId: string;
        courseId: string;
        rating: number;
        comment: string | null;
    }): Promise<void> {
        const { userId, courseId, rating, comment } = params;
        await this.db.query(
            `
            INSERT INTO course_reviews (id, user_id, course_id, rating, comment)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (user_id, course_id) DO UPDATE
            SET rating = EXCLUDED.rating,
                comment = EXCLUDED.comment,
                updated_at = NOW()
            `,
            [uuidv4(), userId, courseId, rating, comment],
        );
    }

    async hasUserReview(userId: string, courseId: string): Promise<boolean> {
        const r = await this.db.query(
            `SELECT 1 FROM course_reviews WHERE user_id = $1 AND course_id = $2 LIMIT 1`,
            [userId, courseId],
        );
        return r.rows.length > 0;
    }
}
