import { injectable } from "tsyringe";
import { Database } from "../config/database";

export interface WishlistRow {
    course_id: string;
    title: string;
    thumbnail_url: string | null;
    price: string | number | null;
    level: string | null;
    inst_fn?: string | null;
    inst_ln?: string | null;
    enrolled_count: string | number | null;
    created_at_wish?: string | null;
}

@injectable()
export class WishlistRepository {
    constructor(private db: Database) {}

    async add(userId: string, courseId: string): Promise<void> {
        await this.db.query(
            `
            INSERT INTO course_wishlists (user_id, course_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
            `,
            [userId, courseId],
        );
    }

    async remove(userId: string, courseId: string): Promise<void> {
        await this.db.query(
            `DELETE FROM course_wishlists WHERE user_id = $1 AND course_id = $2`,
            [userId, courseId],
        );
    }

    async list(userId: string): Promise<WishlistRow[]> {
        const r = await this.db.query(
            `
            SELECT w.course_id AS course_id,
                   c.title,
                   c.thumbnail_url,
                   c.price,
                   c.level,
                   u.first_name AS inst_fn,
                   u.last_name AS inst_ln,
                   w.created_at::text AS created_at_wish,
                   COALESCE(ec.cnt, 0)::int AS enrolled_count
            FROM course_wishlists w
            JOIN courses c ON c.id = w.course_id
            LEFT JOIN users u ON u.id = c.instructor_id
            LEFT JOIN (
                SELECT course_id, COUNT(*) AS cnt FROM course_enrollments GROUP BY course_id
            ) ec ON ec.course_id = c.id
            WHERE w.user_id = $1
            ORDER BY w.created_at DESC
            `,
            [userId],
        );
        return r.rows as WishlistRow[];
    }

    async isWishlisted(userId: string | null | undefined, courseId: string): Promise<boolean> {
        if (!userId) return false;
        const r = await this.db.query(
            `SELECT 1 FROM course_wishlists WHERE user_id = $1 AND course_id = $2 LIMIT 1`,
            [userId, courseId],
        );
        return r.rows.length > 0;
    }
}
