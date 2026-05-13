import { injectable } from "tsyringe";
import { Database } from "../config/database";
import { v4 as uuidv4 } from "uuid";

export interface LearningPathRow {
    id: string;
    title: string;
    slug: string | null;
    description: string | null;
    audience_tag: string | null;
    bundle_price: string | number;
    status: string;
    course_ids: string[];
}

@injectable()
export class LearningPathRepository {
    constructor(private db: Database) {}

    async listPublished(): Promise<LearningPathRow[]> {
        const r = await this.db.query(
            `
            SELECT lp.id::text AS id,
                   lp.title,
                   lp.slug::text AS slug,
                   lp.description::text AS description,
                   lp.audience_tag::text AS audience_tag,
                   lp.bundle_price::float8 AS bundle_price,
                   lp.status::text AS status
            FROM learning_paths lp
            WHERE lp.status = 'published'
            ORDER BY lp.created_at DESC
            `,
        );
        const rows = r.rows as Omit<LearningPathRow, "course_ids">[];
        const out: LearningPathRow[] = [];
        for (const row of rows) {
            const ids = await this.getCoursesInPath(row.id);
            out.push({
                ...row,
                course_ids: ids,
            });
        }
        return out;
    }

    async getCoursesInPath(pathId: string): Promise<string[]> {
        const r = await this.db.query(
            `
            SELECT course_id FROM learning_path_items
            WHERE path_id = $1
            ORDER BY position ASC
            `,
            [pathId],
        );
        return r.rows.map((row: { course_id: string }) => row.course_id);
    }

    async getPathBasics(pathId: string): Promise<{
        id: string;
        bundle_price: number;
        status: string;
    } | null> {
        const r = await this.db.query(
            `SELECT id::text AS id,
                    bundle_price::float8 AS bundle_price,
                    status::text AS status
             FROM learning_paths WHERE id = $1`,
            [pathId],
        );
        if (!r.rows[0]) return null;
        const row = r.rows[0] as Record<string, unknown>;
        return {
            id: String(row.id),
            bundle_price: Number(row.bundle_price ?? 0),
            status: String(row.status ?? ""),
        };
    }

    async hasPaidPath(userId: string, pathId: string): Promise<boolean> {
        const r = await this.db.query(
            `
            SELECT 1 FROM path_purchases
            WHERE user_id = $1 AND path_id = $2 AND status = 'paid'
            LIMIT 1
            `,
            [userId, pathId],
        );
        return r.rows.length > 0;
    }

    async recordPaidPathPurchase(
        userId: string,
        pathId: string,
        amount: number,
        paymentRef?: string,
    ): Promise<void> {
        const ex = await this.db.query(
            `
            SELECT 1 FROM path_purchases
            WHERE user_id = $1 AND path_id = $2 AND status = 'paid'
            LIMIT 1
            `,
            [userId, pathId],
        );
        if (ex.rows.length > 0) return;

        await this.db.query(
            `
            INSERT INTO path_purchases (
                id, user_id, path_id, amount, currency, status, payment_ref
            )
            VALUES ($1, $2, $3, $4, 'VND', 'paid', $5)
            `,
            [
                uuidv4(),
                userId,
                pathId,
                amount,
                paymentRef ?? "mock-bundle",
            ],
        );
    }
}
