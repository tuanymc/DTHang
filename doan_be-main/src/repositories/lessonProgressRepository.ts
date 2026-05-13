import { injectable } from "tsyringe";
import { Database } from "../config/database";
import { v4 as uuidv4 } from "uuid";

export interface LessonProgressRow {
    lesson_id: string;
    progress_percent: number;
    is_completed: boolean;
}

@injectable()
export class LessonProgressRepository {
    constructor(private db: Database) {}

    async lessonBelongsToCourse(
        lessonId: string,
        courseId: string,
    ): Promise<boolean> {
        const r = await this.db.query(
            `
            SELECT 1
            FROM lessons l
            JOIN sections s ON s.id = l.section_id
            WHERE l.id = $1 AND s.course_id = $2
            LIMIT 1
            `,
            [lessonId, courseId],
        );
        return r.rows.length > 0;
    }

    async lessonIsPreviewInCourse(
        lessonId: string,
        courseId: string,
    ): Promise<boolean> {
        const r = await this.db.query(
            `
            SELECT COALESCE(l.is_preview, FALSE) AS p
            FROM lessons l
            JOIN sections s ON s.id = l.section_id
            WHERE l.id = $1 AND s.course_id = $2
            LIMIT 1
            `,
            [lessonId, courseId],
        );
        return Boolean(r.rows[0]?.p);
    }

    async upsertLessonProgress(
        userId: string,
        lessonId: string,
        progressPercent: number,
        isCompleted: boolean,
    ): Promise<void> {
        const pct = Math.max(0, Math.min(100, Number(progressPercent) || 0));
        await this.db.query(
            `
            INSERT INTO lesson_progress (id, user_id, lesson_id, progress_percent, is_completed, updated_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            ON CONFLICT (user_id, lesson_id)
            DO UPDATE SET
                progress_percent = EXCLUDED.progress_percent,
                is_completed = EXCLUDED.is_completed,
                updated_at = NOW()
            `,
            [uuidv4(), userId, lessonId, pct, isCompleted],
        );
    }

    async insertQuizAttempt(params: {
        userId: string;
        lessonId: string;
        score: number;
        maxScore: number;
        passed: boolean;
        answers: unknown;
    }): Promise<void> {
        const { userId, lessonId, score, maxScore, passed, answers } = params;
        await this.db.query(
            `
            INSERT INTO user_quiz_attempts (
                id, user_id, lesson_id, score, max_score, passed, answers, started_at, completed_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, NOW(), NOW())
            `,
            [
                uuidv4(),
                userId,
                lessonId,
                score,
                maxScore,
                passed,
                JSON.stringify(answers ?? {}),
            ],
        );
    }

    async listForUserCourse(
        userId: string,
        courseId: string,
    ): Promise<LessonProgressRow[]> {
        const r = await this.db.query(
            `
            SELECT lp.lesson_id,
                   lp.progress_percent::float8 AS progress_percent,
                   lp.is_completed
            FROM lesson_progress lp
            JOIN lessons l ON l.id = lp.lesson_id
            JOIN sections s ON s.id = l.section_id
            WHERE lp.user_id = $1 AND s.course_id = $2
            `,
            [userId, courseId],
        );
        type Row = {
            lesson_id: string;
            progress_percent: number | string;
            is_completed: boolean;
        };
        return r.rows.map((row: Row) => ({
            lesson_id: row.lesson_id,
            progress_percent: Number(row.progress_percent),
            is_completed: Boolean(row.is_completed),
        }));
    }
}
