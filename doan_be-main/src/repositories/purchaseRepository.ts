import { injectable } from "tsyringe";
import { Database } from "../config/database";
import { v4 as uuidv4 } from "uuid";

@injectable()
export class PurchaseRepository {
    constructor(private db: Database) {}

    async hasPaidCoursePurchase(
        userId: string,
        courseId: string,
    ): Promise<boolean> {
        const r = await this.db.query(
            `
            SELECT 1 FROM course_purchases
            WHERE user_id = $1 AND course_id = $2 AND status = 'paid'
            LIMIT 1
            `,
            [userId, courseId],
        );
        return r.rows.length > 0;
    }

    async recordPaidCoursePurchase(
        userId: string,
        courseId: string,
        amount: number,
        paymentRef?: string,
    ): Promise<void> {
        const ex = await this.db.query(
            `
            SELECT 1 FROM course_purchases
            WHERE user_id = $1 AND course_id = $2 AND status = 'paid'
            LIMIT 1
            `,
            [userId, courseId],
        );
        if (ex.rows.length > 0) return;

        await this.db.query(
            `
            INSERT INTO course_purchases (
                id, user_id, course_id, amount, currency, status, payment_ref
            )
            VALUES ($1, $2, $3, $4, 'VND', 'paid', $5)
            `,
            [
                uuidv4(),
                userId,
                courseId,
                amount,
                paymentRef ?? "mock-gateway",
            ],
        );
    }
}
