import { injectable } from "tsyringe";
import { Database } from "../config/database";
import { randomBytes } from "crypto";
import { v4 as uuidv4 } from "uuid";

@injectable()
export class CertificateRepository {
    constructor(private db: Database) {}

    async ensureCertificate(userId: string, courseId: string): Promise<void> {
        const ex = await this.db.query(
            `
            SELECT 1 FROM certificates
            WHERE user_id = $1 AND course_id = $2 LIMIT 1
            `,
            [userId, courseId],
        );
        if (ex.rows.length > 0) return;

        const code = `LMS-${String(courseId).slice(0, 8).toUpperCase()}-${randomBytes(4).toString("hex").toUpperCase()}`;

        await this.db.query(
            `
            INSERT INTO certificates (
                id, user_id, course_id, certificate_code
            )
            VALUES ($1, $2, $3, $4)
            `,
            [uuidv4(), userId, courseId, code],
        );
    }

    async listByUser(userId: string): Promise<
        {
            id: string;
            course_id: string;
            certificate_code: string;
            issued_at: string;
            title: string;
        }[]
    > {
        const r = await this.db.query(
            `
            SELECT c.id::text AS id,
                   c.course_id::text AS course_id,
                   c.certificate_code::text AS certificate_code,
                   c.issued_at::text AS issued_at,
                   co.title::text AS title
            FROM certificates c
            JOIN courses co ON co.id = c.course_id
            WHERE c.user_id = $1
            ORDER BY c.issued_at DESC
            `,
            [userId],
        );
        return r.rows as {
            id: string;
            course_id: string;
            certificate_code: string;
            issued_at: string;
            title: string;
        }[];
    }
}
