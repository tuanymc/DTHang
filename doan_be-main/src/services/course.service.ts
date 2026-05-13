import { injectable } from "tsyringe";
import * as bcrypt from "bcrypt";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { MajorRepository } from "../repositories/majorRepository";
import { CourseRepository } from "../repositories/courseRepository";
import { AuthRepository } from "../repositories/authRepository";
import { MinioService } from "./minio.service";
import { EnrollmentRepository } from "../repositories/enrollmentRepository";
import { WishlistRepository } from "../repositories/wishlistRepository";
import { LessonProgressRepository } from "../repositories/lessonProgressRepository";
import { PurchaseRepository } from "../repositories/purchaseRepository";
import { LearningPathRepository } from "../repositories/learningPathRepository";
import { ReviewRepository } from "../repositories/reviewRepository";
import { CertificateRepository } from "../repositories/certificateRepository";

@injectable()
export class CourseService {
    constructor(
        private courseRepository: CourseRepository,
        private authRepository: AuthRepository,
        private minioService: MinioService,
        private enrollmentRepository: EnrollmentRepository,
        private wishlistRepository: WishlistRepository,
        private lessonProgressRepository: LessonProgressRepository,
        private purchaseRepository: PurchaseRepository,
        private learningPathRepository: LearningPathRepository,
        private reviewRepository: ReviewRepository,
        private certificateRepository: CertificateRepository,
    ) {}

    async createCourse(course: any): Promise<any> {
        const slugify = (str: string): string => {
            return str
                .toLowerCase()
                .normalize("NFD") // tách dấu khỏi ký tự
                .replace(/[\u0300-\u036f]/g, "") // xoá dấu
                .replace(/đ/g, "d") // xử lý riêng chữ đ
                .replace(/[^a-z0-9\s-]/g, "") // xoá ký tự đặc biệt
                .trim()
                .replace(/\s+/g, "-") // space -> -
                .replace(/-+/g, "-"); // nhiều dấu - -> 1
        };

        const {
            id,
            title,
            slug,
            description,
            thumbnail_url,
            instructor_id,
            level,
            price,
            status,
            major_ids,
            category_ids,
        } = course;

        const newCourse = {
            ...course,
            slug: slugify(title),
            id: uuidv4(),
        };

        const result = await this.courseRepository.createCourse(newCourse);

        if (!result) {
            throw new Error("Create course failed");
        }
        return result;
    }

    async updateCourse(course: any): Promise<any> {
        const payload = {
            id: course.id,
            title: course.title ?? course.name ?? course.tile ?? null,
            slug: course.slug ?? null,
            description: course.description ?? null,
            thumbnail_url: course.thumbnail_url ?? null,
            level: course.level ?? null,
            price: course.price !== undefined ? Number(course.price) : null,
        };

        const result = await this.courseRepository.updateCourse(payload);

        const extras: Partial<{ duration: number; status: string }> = {};
        if (
            course.duration !== undefined &&
            course.duration !== null &&
            `${course.duration}`.trim() !== ""
        ) {
            const d = Number(course.duration);
            if (!Number.isNaN(d))
                extras.duration = d;
        }
        if (
            course.status !== undefined &&
            course.status !== null &&
            `${course.status}`.trim() !== ""
        ) {
            extras.status = `${course.status}`;
        }

        await this.courseRepository.patchCourseExtras(
            String(payload.id),
            extras,
        );

        if (!result) {
            throw new Error("Update course failed");
        }
        return result;
    }

    async deleteCourse(id: string): Promise<any> {
        const result = await this.courseRepository.deleteCourse(id);

        if (!result) {
            throw new Error("Delete course failed");
        }
        return result;
    }

    async publishCourse(id: string): Promise<any> {
        const result = await this.courseRepository.publishCourse(id);

        if (!result) {
            throw new Error("Publish course failed");
        }
        return result;
    }

    async archiveCourse(id: string): Promise<any> {
        const result = await this.courseRepository.archiveCourse(id);

        if (!result) {
            throw new Error("Archive course failed");
        }
        return result;
    }

    async getListCourse(course: any): Promise<any> {
        const {
            search,
            status,
            major_ids,
            category_ids,
            page,
            page_size,
            user_id,
        } = course;

        const profile = await this.authRepository.getProfile(user_id);

        console.log("profile", profile);
        const roles = profile?.roles || [];

        console.log("roles", roles);

        const payload = {
            ...course,
            roles,
        };

        const result = await this.courseRepository.getListCourse(payload);

        if (!result) {
            throw new Error("Get list course failed");
        }
        return result.fn_get_courses_list;
    }

    // Thêm vào CourseService.ts
    async syncCurriculum(courseId: string, sections: any[]): Promise<any> {
        // 1. Lưu vào DB
        const videoUrlsToDelete = await this.courseRepository.syncCurriculum(
            courseId,
            sections,
        );

        // 2. Dọn dẹp file cũ trên MinIO (không cần await để tránh block user)
        if (videoUrlsToDelete.length > 0) {
            this.cleanupMinioFiles(videoUrlsToDelete);
        }

        return { success: true };
    }

    private async cleanupMinioFiles(urls: string[]) {
        for (const url of urls) {
            try {
                // Logic tách 'key' từ URL của bạn (ví dụ: lấy phần sau bucket name)
                // URL mẫu: http://localhost:9000/bucket/folder/file.mp4
                const urlParts = url.split("/");
                const key = urlParts.slice(4).join("/"); // Bỏ protocol, host, port, bucket
                await this.minioService.deleteFile(key);
            } catch (e) {
                console.error("Dọn dẹp file MinIO thất bại:", url, e);
            }
        }
    }

    async getCurriculum(courseId: string): Promise<any> {
        return await this.courseRepository.getCurriculum(courseId);
    }

    private filterCurriculumTrialOnly(full: unknown): unknown {
        if (!full || typeof full !== "object") return full;
        const o = full as Record<string, unknown>;
        const sections = o.sections;
        if (!Array.isArray(sections)) return full;
        return {
            ...o,
            sections: sections.map((s: Record<string, unknown>) => ({
                ...s,
                lessons: Array.isArray(s.lessons)
                    ? (s.lessons as Record<string, unknown>[]).filter(
                          (l) =>
                              Boolean(
                                  l.is_preview === true ||
                                      l.is_preview === "true",
                              ),
                      )
                    : [],
            })),
        };
    }

    async getCurriculumForUser(userId: string, courseId: string): Promise<any> {
        const raw = await this.courseRepository.getCurriculum(courseId);
        const canFull =
            await this.enrollmentRepository.canViewFullCurriculum(
                userId,
                courseId,
            );
        if (canFull) return raw;
        const acc = await this.enrollmentRepository.getAccessKind(
            userId,
            courseId,
        );
        if (!acc) {
            throw new Error(
                "Bạn chưa đăng ký khóa học (hoặc chưa đủ quyền xem curriculum).",
            );
        }
        if (acc === "trial") return this.filterCurriculumTrialOnly(raw);
        return raw;
    }

    async getPopularCourse(limit: any): Promise<any> {
        const result = await this.courseRepository.getPopularCourse(limit);

        if (!result) {
            throw new Error("failed");
        }
        return result;
    }

    async catalogPublishedCourses(opts: {
        search?: string | null;
        major_ids?: string[] | null;
        category_ids?: string[] | null;
        page?: number;
        page_size?: number;
        pageSize?: number;
    }): Promise<{
        items: unknown[];
        pagination: {
            total: number;
            page: number;
            page_size: number;
            total_pages: number;
        };
    }> {
        const page = Math.max(1, Math.floor(Number(opts.page) || 1));
        const page_size = Math.min(
            100,
            Math.max(
                1,
                Math.floor(
                    Number(opts.page_size ?? opts.pageSize ?? 12) || 12,
                ),
            ),
        );
        const search =
            typeof opts.search === "string" && opts.search.trim() !== ""
                ? opts.search.trim()
                : null;
        const majors =
            Array.isArray(opts.major_ids) && opts.major_ids.length > 0
                ? opts.major_ids
                : null;
        const cats =
            Array.isArray(opts.category_ids) &&
            opts.category_ids.length > 0
                ? opts.category_ids
                : null;

        const out = await this.courseRepository.listPublishedCoursesCatalog({
            search,
            major_ids: majors,
            category_ids: cats,
            page,
            page_size,
        });

        const pg = out.pagination;
        return {
            items: Array.isArray(out.items) ? out.items : [],
            pagination: {
                total: Number(pg.total) || 0,
                page: Number(pg.page) || page,
                page_size: Number(pg.page_size) || page_size,
                total_pages: Number(pg.total_pages) || 0,
            },
        };
    }

    async getCourseDetail(course: any): Promise<any> {
        const { course_id } = course;
        const result =
            await this.courseRepository.getCourseDetail(course);

        if (!result) {
            throw new Error("failed");
        }
        return result;
    }

    async enroll(userId: string, courseId: string): Promise<void> {
        await this.enrollmentRepository.enrollFreePublished(userId, courseId);
    }

    async purchaseCourse(userId: string, courseId: string): Promise<void> {
        const meta = await this.enrollmentRepository.getCoursePriceAndTrial(
            courseId,
        );
        const paid = await this.purchaseRepository.hasPaidCoursePurchase(
            userId,
            courseId,
        );
        const price = Number(meta.price) || 0;
        if (price <= 0) {
            await this.enrollmentRepository.enrollFreePublished(
                userId,
                courseId,
            );
            return;
        }
        if (!paid) {
            await this.purchaseRepository.recordPaidCoursePurchase(
                userId,
                courseId,
                price,
            );
        }
        await this.enrollmentRepository.enrollFull(userId, courseId);
    }

    async startTrial(userId: string, courseId: string): Promise<void> {
        await this.enrollmentRepository.startTrial(userId, courseId);
    }

    async purchaseLearningPath(userId: string, pathId: string): Promise<void> {
        const path =
            await this.learningPathRepository.getPathBasics(pathId);
        if (!path || path.status !== "published") {
            throw new Error("Lộ trình không tồn tại hoặc chưa xuất bản.");
        }
        const courses =
            await this.learningPathRepository.getCoursesInPath(pathId);
        if (courses.length === 0)
            throw new Error("Combo chưa có khóa học.");

        const already =
            await this.learningPathRepository.hasPaidPath(userId, pathId);
        if (!already) {
            await this.learningPathRepository.recordPaidPathPurchase(
                userId,
                pathId,
                path.bundle_price,
            );
        }

        for (const cid of courses) {
            await this.enrollmentRepository.enrollFull(userId, cid, {
                bypassPurchaseCheck: true,
            });
        }
    }

    async listPublishedLearningPaths() {
        return await this.learningPathRepository.listPublished();
    }

    async myCertificates(userId: string) {
        return await this.certificateRepository.listByUser(userId);
    }

    async courseReviewAggregate(courseId: string) {
        return await this.reviewRepository.aggregateForCourse(courseId);
    }

    async listCourseReviews(courseId: string, limit?: number, offset?: number) {
        const lim = Math.min(Number(limit ?? 12) || 12, 50);
        const off = Math.max(Number(offset ?? 0) || 0, 0);
        return await this.reviewRepository.listByCourse(courseId, lim, off);
    }

    async submitCourseReview(params: {
        userId: string;
        course_id: string;
        rating: number;
        comment?: string | null;
    }): Promise<void> {
        await this.enrollmentRepository.ensureEligibleForCourseReview(
            params.userId,
            params.course_id,
        );
        const rt = Number(params.rating);
        if (Number.isNaN(rt) || rt < 1 || rt > 5) {
            throw new Error("Điểm đánh giá từ 1 đến 5.");
        }
        await this.reviewRepository.upsertReview({
            userId: params.userId,
            courseId: params.course_id,
            rating: Math.floor(rt),
            comment:
                typeof params.comment === "string"
                    ? params.comment.slice(0, 4000)
                    : null,
        });
    }

    async myEnrollments(userId: string) {
        return await this.enrollmentRepository.listByUser(userId);
    }

    async enrollmentStatus(
        userId: string | undefined | null,
        courseId: string,
    ) {
        const enrolled =
            await this.enrollmentRepository.isEnrolled(userId, courseId);
        const wishlisted =
            await this.wishlistRepository.isWishlisted(userId, courseId);
        const meta =
            await this.enrollmentRepository.getCoursePriceAndTrial(courseId);
        const agg =
            await this.reviewRepository.aggregateForCourse(courseId);
        const access_kind =
            userId ?
                await this.enrollmentRepository.getAccessKind(userId, courseId)
            :   null;
        const has_purchase = userId
            ? await this.purchaseRepository.hasPaidCoursePurchase(
                  userId,
                  courseId,
              )
            : false;

        const snap =
            userId ?
                await this.enrollmentRepository.enrollmentSnapshot(
                    userId,
                    courseId,
                )
            :   null;

        return {
            enrolled,
            wishlisted,
            price: meta.price,
            allows_trial: meta.allows_trial,
            access_kind,
            has_purchase,
            avg_rating: agg.avg_rating,
            reviews_count: agg.count,
            progress_percent:
                typeof snap?.progress_percent === "number"
                    ? snap.progress_percent
                :   0,
            completed_at: snap?.completed_at ?? null,
        };
    }

    async wishlistAdd(userId: string, courseId: string): Promise<void> {
        await this.wishlistRepository.add(userId, courseId);
    }

    async wishlistRemove(userId: string, courseId: string): Promise<void> {
        await this.wishlistRepository.remove(userId, courseId);
    }

    async wishlistList(userId: string) {
        return await this.wishlistRepository.list(userId);
    }

    private async ensureEnrolledLessonInCourse(
        userId: string,
        courseId: string,
        lessonId: string,
    ): Promise<void> {
        const enrolled = await this.enrollmentRepository.isEnrolled(
            userId,
            courseId,
        );
        if (!enrolled)
            throw new Error("Bạn chưa đăng ký khóa học này.");

        const inCourse =
            await this.lessonProgressRepository.lessonBelongsToCourse(
                lessonId,
                courseId,
            );
        if (!inCourse)
            throw new Error("Bài học không thuộc khóa học.");

        const acc = await this.enrollmentRepository.getAccessKind(
            userId,
            courseId,
        );
        if (acc === "trial") {
            const prev =
                await this.lessonProgressRepository.lessonIsPreviewInCourse(
                    lessonId,
                    courseId,
                );
            if (!prev)
                throw new Error(
                    "Gói học thử chỉ xem các bài được đánh dấu học thử.",
                );
        }
    }

    async updateLessonProgress(
        userId: string,
        body: {
            course_id: string;
            lesson_id: string;
            progress_percent?: number;
            is_completed?: boolean;
        },
    ): Promise<void> {
        const {
            course_id,
            lesson_id,
            progress_percent = 0,
            is_completed = false,
        } = body;

        await this.ensureEnrolledLessonInCourse(userId, course_id, lesson_id);

        await this.lessonProgressRepository.upsertLessonProgress(
            userId,
            lesson_id,
            Number(progress_percent) || 0,
            Boolean(is_completed),
        );
        await this.enrollmentRepository.recomputeEnrollmentProgress(
            userId,
            course_id,
        );
    }

    async submitQuizAttempt(
        userId: string,
        body: {
            course_id: string;
            lesson_id: string;
            score?: number;
            max_score?: number;
            passed?: boolean;
            answers?: unknown;
        },
    ): Promise<void> {
        const {
            course_id,
            lesson_id,
            score = 0,
            max_score = 1,
            passed = false,
            answers,
        } = body;

        await this.ensureEnrolledLessonInCourse(userId, course_id, lesson_id);

        const sc = Math.max(0, Math.floor(Number(score) || 0));
        const mx = Math.max(1, Math.floor(Number(max_score) || 1));

        await this.lessonProgressRepository.insertQuizAttempt({
            userId,
            lessonId: lesson_id,
            score: sc,
            maxScore: mx,
            passed: Boolean(passed),
            answers,
        });

        if (passed) {
            await this.lessonProgressRepository.upsertLessonProgress(
                userId,
                lesson_id,
                100,
                true,
            );
        }

        await this.enrollmentRepository.recomputeEnrollmentProgress(
            userId,
            course_id,
        );
    }

    async myLessonProgress(userId: string, course_id: string) {
        const enrolled = await this.enrollmentRepository.isEnrolled(
            userId,
            course_id,
        );
        if (!enrolled)
            throw new Error("Bạn chưa đăng ký khóa học này.");

        return await this.lessonProgressRepository.listForUserCourse(
            userId,
            course_id,
        );
    }
}
