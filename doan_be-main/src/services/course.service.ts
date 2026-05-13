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

@injectable()
export class CourseService {
    constructor(
        private courseRepository: CourseRepository,
        private authRepository: AuthRepository,
        private minioService: MinioService,
        private enrollmentRepository: EnrollmentRepository,
        private wishlistRepository: WishlistRepository,
        private lessonProgressRepository: LessonProgressRepository,
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

    async getPopularCourse(limit: any): Promise<any> {
        const result = await this.courseRepository.getPopularCourse(limit);

        if (!result) {
            throw new Error("failed");
        }
        return result;
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
        await this.enrollmentRepository.enroll(userId, courseId);
    }

    async myEnrollments(userId: string) {
        return await this.enrollmentRepository.listByUser(userId);
    }

    async enrollmentStatus(userId: string | undefined | null, courseId: string) {
        const enrolled =
            await this.enrollmentRepository.isEnrolled(userId, courseId);
        const wishlisted =
            await this.wishlistRepository.isWishlisted(userId, courseId);
        return { enrolled, wishlisted };
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
