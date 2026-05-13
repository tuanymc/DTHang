import { injectable } from "tsyringe";
import { Database } from "../config/database";

@injectable()
export class CourseRepository {
    constructor(private db: Database) {}

    async patchCourseExtras(
        id: string,
        extras: Partial<{ duration: number; status: string }>,
    ): Promise<void> {
        if (
            extras.duration !== undefined &&
            extras.duration !== null &&
            !Number.isNaN(Number(extras.duration))
        ) {
            await this.db.query(
                `UPDATE courses SET duration = $2, updated_at = NOW() WHERE id = $1`,
                [id, Number(extras.duration)],
            );
        }
        if (
            extras.status !== undefined &&
            extras.status !== null &&
            `${extras.status}`.trim() !== ""
        ) {
            await this.db.query(
                `UPDATE courses SET status = $2, updated_at = NOW() WHERE id = $1`,
                [id, extras.status],
            );
        }
    }

    async createCourse(course: any): Promise<any> {
        try {
            const sql = `select * from fn_create_course($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`;

            const result = await this.db.query(sql, [
                course.id,
                course.title,
                course.slug,
                course.description,
                course.thumbnail_url,
                course.instructor_id,
                course.level,
                course.price,
                course.status,
                course.major_ids,
                course.category_ids,
            ]);

            return result.rows[0];
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async updateCourse(course: any): Promise<any> {
        try {
            const sql = `select * from fn_update_course($1, $2, $3, $4, $5, $6, $7)`;

            const result = await this.db.query(sql, [
                course.id,
                course.title ?? course.name ?? null,
                course.slug ?? null,
                course.description ?? null,
                course.thumbnail_url ?? null,
                course.level ?? null,
                course.price ?? null,
            ]);

            return result.rows[0];
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async deleteCourse(id: string): Promise<any> {
        try {
            const sql = `select * from fn_delete_course($1)`;

            const result = await this.db.query(sql, [id]);

            return result.rows[0];
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async publishCourse(id: string): Promise<any> {
        try {
            const sql = `select * from fn_publish_course($1)`;

            const result = await this.db.query(sql, [id]);

            return result.rows[0];
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async archiveCourse(id: string): Promise<any> {
        try {
            const sql = `select * from fn_archive_course($1)`;

            const result = await this.db.query(sql, [id]);

            return result.rows[0];
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async getListCourse(params: any): Promise<any> {
        try {
            const sql = `select * from fn_get_courses_list($1, $2, $3, $4, $5, $6, $7, $8, $9)`;

            const result = await this.db.query(sql, [
                params.search,
                params.status,
                params.level,
                params.major_ids,
                params.category_ids,
                params.page,
                params.page_size,
                params.user_id,
                params.roles,
            ]);

            return result.rows[0];
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async listPublishedCoursesCatalog(params: {
        search?: string | null;
        major_ids?: string[] | null;
        category_ids?: string[] | null;
        page: number;
        page_size: number;
    }): Promise<{
        items: unknown[];
        pagination: {
            total: number;
            page: number;
            page_size: number;
            total_pages: number;
        };
    }> {
        try {
            const sql = `
                SELECT fn_list_published_courses($1::text, $2::varchar[], $3::varchar[], $4::int, $5::int) AS catalog
            `;

            const result = await this.db.query(sql, [
                params.search ?? null,
                params.major_ids ?? null,
                params.category_ids ?? null,
                params.page,
                params.page_size,
            ]);

            const raw = result.rows[0]?.catalog;
            const parsed =
                typeof raw === "string"
                    ? (JSON.parse(raw) as {
                          items?: unknown[];
                          pagination?: {
                              total: number;
                              page: number;
                              page_size: number;
                              total_pages: number;
                          };
                      })
                    :   (raw as {
                          items?: unknown[];
                          pagination?: {
                              total: number;
                              page: number;
                              page_size: number;
                              total_pages: number;
                          };
                      } | null);

            const pagination = parsed?.pagination ?? {
                total: 0,
                page: params.page,
                page_size: params.page_size,
                total_pages: 0,
            };
            const items = Array.isArray(parsed?.items) ? parsed!.items : [];

            return { items, pagination };
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    // Thêm vào CourseRepository.ts
    async syncCurriculum(courseId: string, sections: any[]): Promise<string[]> {
        // Chúng ta cần truy cập trực tiếp vào pool để làm Transaction
        // Bạn có thể cân nhắc public biến pool trong class Database hoặc thêm method getClient
        const client = await (this.db as any).pool.connect();

        try {
            await client.query("BEGIN");

            // --- BƯỚC 1: Thu thập ID để giữ lại ---
            const keepSectionIds = sections.map((s) => s.id);
            const keepLessonIds: string[] = [];

            sections.forEach((s) => {
                if (s.lessons)
                    keepLessonIds.push(...s.lessons.map((l: any) => l.id));
                if (s.exam) keepLessonIds.push(s.exam.id);
            });

            // --- BƯỚC 2: Xử lý Xóa mồ côi (Lessons) ---
            // Lấy ra video_url của những bài sắp xóa để trả về cho Service dọn dẹp MinIO
            const deletedLessons = await client.query(
                `
            DELETE FROM lessons 
            WHERE section_id IN (SELECT id FROM sections WHERE course_id = $1)
            AND id != ALL($2::varchar[])
            RETURNING video_url
        `,
                [courseId, keepLessonIds.length > 0 ? keepLessonIds : ["-1"]],
            );

            const videoUrlsToDelete = deletedLessons.rows
                .map((r: any) => r.video_url)
                .filter((url: any) => url != null);

            // --- BƯỚC 3: Xử lý Xóa mồ côi (Sections) ---
            await client.query(
                `
            DELETE FROM sections 
            WHERE course_id = $1 AND id != ALL($2::varchar[])
        `,
                [courseId, keepSectionIds.length > 0 ? keepSectionIds : ["-1"]],
            );

            // --- BƯỚC 4: Upsert Sections và Lessons ---
            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];

                // Upsert Section
                await client.query(`SELECT fn_upsert_section($1, $2, $3, $4)`, [
                    section.id,
                    courseId,
                    section.title,
                    i,
                ]);

                // Chuẩn bị danh sách lessons bao gồm cả Exam (nếu có)
                const allLessons = [...(section.lessons || [])];
                if (section.exam) {
                    allLessons.push({
                        ...section.exam,
                        type: "exam", // Map exam object của FE thành type exam của DB
                        content: {
                            questions: section.exam.questions,
                            passingScore: section.exam.passingScore,
                        },
                    });
                }

                for (let j = 0; j < allLessons.length; j++) {
                    const lesson = allLessons[j];
                    const isVideo = lesson.type === "video";

                    const videoUrl = isVideo
                        ? lesson.content?.url || null
                        : null;
                    const videoDuration = isVideo
                        ? lesson.content?.duration || null
                        : null;

                    await client.query(
                        `SELECT fn_upsert_lesson($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                        [
                            lesson.id,
                            section.id,
                            lesson.title,
                            lesson.description || "",
                            lesson.type,
                            j, // position
                            isVideo ? lesson.content?.url || null : null,
                            isVideo ? lesson.content?.duration || null : null,
                            !isVideo
                                ? JSON.stringify(lesson.content || {})
                                : null,
                        ],
                    );
                }
            }

            await client.query("COMMIT");
            return videoUrlsToDelete;
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async getCurriculum(courseId: string): Promise<any> {
        const sql = `SELECT * FROM fn_get_course_curriculum($1)`;
        const result = await this.db.query(sql, [courseId]);
        // Hàm này trả về 1 row chứa mảng curriculum
        return result.rows[0]?.curriculum || [];
    }

    async getPopularCourse(limit: any): Promise<any> {
        try {
            const sql = `select * from get_featured_courses($1)`;

            const result = await this.db.query(sql, [limit]);

            return result.rows[0];
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async getCourseDetail(course: any): Promise<any> {
        try {
            const sql = `select * from fn_get_course_detail($1)`;

            const result = await this.db.query(sql, [course.course_id]);

            return result.rows[0];
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
}
