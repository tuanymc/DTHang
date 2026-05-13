import { injectable } from "tsyringe";
import { Request, Response } from "express";
import { MajorService } from "../services/major.service";
import { CourseService } from "../services/course.service";
import { MinioService } from "../services/minio.service";

@injectable()
export class CourseController {
    constructor(
        private courseService: CourseService,
        private minioService: MinioService,
    ) {}

    async createCourse(req: Request, res: Response): Promise<any> {
        try {
            const user = (req as any).user;

            if (!user) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const {
                title,
                description,
                level,
                price,
                status,
                major_ids,
                category_ids,
            } = req.body;

            const instructor_id = user.sub;

            let thumbnail_url: string | null = null;

            if (req.file) {
                const { url } = await this.minioService.uploadFile(
                    req.file,
                    "course_thumbnail",
                );
                thumbnail_url = url;
            }

            if (!title) {
                res.status(400).json({ message: "Thiếu thông tin." });
                return;
            }

            const result = await this.courseService.createCourse({
                title,
                description,
                thumbnail_url,
                instructor_id,
                level,
                price,
                status,
                major_ids,
                category_ids,
            });

            return res.status(200).json({
                message: "Create course successfully",
                result: result,
            });
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }

    async updateCourse(req: Request, res: Response): Promise<any> {
        try {
            const user = (req as any).user;
            if (!user?.sub)
                return res.status(401).json({ message: "Unauthorized" });

            const {
                id,
                title,
                slug,
                description,
                level,
                price,
                duration,
                status,
            } = req.body;

            let thumbnail_url: string | null =
                typeof req.body.thumbnail_url === "string"
                    ? req.body.thumbnail_url
                    : null;

            if (req.file) {
                const { url } = await this.minioService.uploadFile(
                    req.file,
                    "course_thumbnail",
                );
                thumbnail_url = url;
            }

            if (!id) {
                res.status(400).json({ message: "Thiếu id khóa học." });
                return;
            }

            await this.courseService.updateCourse({
                id,
                title,
                slug,
                description,
                level,
                price: price !== undefined ? Number(price) : null,
                thumbnail_url,
                duration:
                    duration !== undefined && duration !== ""
                        ? Number(duration)
                        : undefined,
                status:
                    typeof status === "string" && status.trim() !== ""
                        ? status
                        : undefined,
            });

            return res.status(200).json({
                message: "Cập nhật khóa học thành công",
            });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async deleteCourse(req: Request, res: Response): Promise<any> {
        console.log(req.body);
        try {
            const { id } = req.body;

            if (!id) {
                res.status(400).json({ message: "Thiếu thông tin." });
                return;
            }

            const result = await this.courseService.deleteCourse(id);

            return res.status(200).json({
                message: "Delete course successfully",
                result: result,
            });
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }

    async publishCourse(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.body;

            if (!id) {
                res.status(400).json({ message: "Thiếu thông tin." });
                return;
            }

            const result = await this.courseService.publishCourse(id);

            return res.status(200).json({
                message: "Publish course successfully",
                result: result,
            });
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }

    async archiveCourse(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.body;

            if (!id) {
                res.status(400).json({ message: "Thiếu thông tin." });
                return;
            }

            const result = await this.courseService.archiveCourse(id);

            return res.status(200).json({
                message: "Archive course successfully",
                result: result,
            });
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }

    async getListCourse(req: Request, res: Response): Promise<any> {
        try {
            const user = (req as any).user;

            if (!user) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const user_id = user.sub;
            const { search, status, major_ids, category_ids, page, page_size } =
                req.body;

            const result = await this.courseService.getListCourse({
                search,
                status,
                major_ids,
                category_ids,
                page,
                page_size,
                user_id,
            });

            return res.status(200).json({
                message: "Get list course successfully",
                result: result,
            });
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }

    async syncCurriculum(req: Request, res: Response): Promise<any> {
        try {
            const { courseId, sections } = req.body;

            if (!courseId || !Array.isArray(sections)) {
                return res
                    .status(400)
                    .json({ message: "Dữ liệu không hợp lệ." });
            }

            const result = await this.courseService.syncCurriculum(
                courseId,
                sections,
            );

            return res.status(200).json({
                message: "Cập nhật chương trình học thành công",
                result,
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async uploadLessonVideo(req: Request, res: Response): Promise<any> {
        try {
            if (!req.file) {
                return res
                    .status(400)
                    .json({ message: "Không tìm thấy file video." });
            }

            // Upload lên thư mục 'lesson_videos' trên Minio
            const { url, key } = await this.minioService.uploadFile(
                req.file,
                "lesson_videos",
            );

            // Trả về URL để FE gán vào Lesson object
            return res.status(200).json({
                message: "Upload video thành công",
                videoUrl: url,
                videoKey: key, // Lưu key nếu cần dùng để xóa sau này
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getCurriculum(req: Request, res: Response): Promise<any> {
        try {
            const user = (req as any).user;
            if (!user?.sub)
                return res.status(401).json({ message: "Unauthorized" });
            const { courseId } = req.body;
            if (!courseId) {
                return res.status(400).json({ message: "Thiếu courseId" });
            }
            const data = await this.courseService.getCurriculumForUser(
                user.sub,
                courseId,
            );
            return res.status(200).json({ curriculum: data });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async getPopularCourse(req: Request, res: Response): Promise<any> {
        try {
            const limitRaw = req.body.limit;
            const limit =
                limitRaw !== undefined && limitRaw !== ""
                    ? Number(limitRaw)
                    : 12;
            const result = await this.courseService.getPopularCourse(limit);

            return res.status(200).json({
                message: "Get successfully",
                result: result,
            });
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }

    async catalogPublished(req: Request, res: Response): Promise<any> {
        try {
            const body = req.body ?? {};
            const {
                search,
                major_ids,
                category_ids,
                page,
                page_size,
                pageSize,
            } = body;
            const data = await this.courseService.catalogPublishedCourses({
                search: typeof search === "string" ? search : undefined,
                major_ids:
                    Array.isArray(major_ids)
                        ? (major_ids as string[])
                        :   undefined,
                category_ids:
                    Array.isArray(category_ids)
                        ? (category_ids as string[])
                        :   undefined,
                page,
                page_size: page_size ?? pageSize,
            });
            return res.status(200).json({
                message: "success",
                data,
            });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async enroll(req: Request, res: Response): Promise<any> {
        try {
            const user = (req as any).user;
            if (!user?.sub)
                return res.status(401).json({ message: "Unauthorized" });
            const { course_id } = req.body;
            if (!course_id)
                return res.status(400).json({ message: "Thiếu course_id" });
            await this.courseService.enroll(user.sub, course_id);
            return res.status(200).json({
                message: "Đăng ký học thành công",
            });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async myEnrollments(req: Request, res: Response): Promise<any> {
        try {
            const user = (req as any).user;
            if (!user?.sub)
                return res.status(401).json({ message: "Unauthorized" });
            const rows = await this.courseService.myEnrollments(user.sub);
            return res.status(200).json({
                message: "success",
                data: rows,
            });
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }

    async enrollmentStatus(req: Request, res: Response): Promise<any> {
        try {
            const { course_id } = req.body;
            if (!course_id)
                return res.status(400).json({ message: "Thiếu course_id" });
            const user = (req as any).user;
            const payload = await this.courseService.enrollmentStatus(
                user?.sub ?? null,
                course_id,
            );
            return res.status(200).json({
                message: "success",
                data: payload,
            });
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }

    async wishlistAdd(req: Request, res: Response): Promise<any> {
        try {
            const user = (req as any).user;
            if (!user?.sub)
                return res.status(401).json({ message: "Unauthorized" });
            const { course_id } = req.body;
            if (!course_id)
                return res.status(400).json({ message: "Thiếu course_id" });
            await this.courseService.wishlistAdd(user.sub, course_id);
            return res.status(200).json({ message: "Đã thêm yêu thích" });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async wishlistRemove(req: Request, res: Response): Promise<any> {
        try {
            const user = (req as any).user;
            if (!user?.sub)
                return res.status(401).json({ message: "Unauthorized" });
            const { course_id } = req.body;
            if (!course_id)
                return res.status(400).json({ message: "Thiếu course_id" });
            await this.courseService.wishlistRemove(user.sub, course_id);
            return res.status(200).json({ message: "Đã bỏ yêu thích" });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async wishlistList(req: Request, res: Response): Promise<any> {
        try {
            const user = (req as any).user;
            if (!user?.sub)
                return res.status(401).json({ message: "Unauthorized" });
            const rows = await this.courseService.wishlistList(user.sub);
            return res.status(200).json({
                message: "success",
                data: rows,
            });
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }

    async updateLessonProgress(req: Request, res: Response): Promise<any> {
        try {
            const user = (req as any).user;
            if (!user?.sub)
                return res.status(401).json({ message: "Unauthorized" });
            const { course_id, lesson_id, progress_percent, is_completed } =
                req.body;
            if (!course_id || !lesson_id)
                return res.status(400).json({
                    message: "Thiếu course_id hoặc lesson_id",
                });
            await this.courseService.updateLessonProgress(user.sub, {
                course_id,
                lesson_id,
                progress_percent,
                is_completed,
            });
            return res.status(200).json({ message: "Đã lưu tiến độ" });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async submitQuizAttempt(req: Request, res: Response): Promise<any> {
        try {
            const user = (req as any).user;
            if (!user?.sub)
                return res.status(401).json({ message: "Unauthorized" });
            const { course_id, lesson_id, score, max_score, passed, answers } =
                req.body;
            if (!course_id || !lesson_id)
                return res.status(400).json({
                    message: "Thiếu course_id hoặc lesson_id",
                });
            await this.courseService.submitQuizAttempt(user.sub, {
                course_id,
                lesson_id,
                score,
                max_score,
                passed,
                answers,
            });
            return res.status(200).json({ message: "Đã lưu kết quả làm bài" });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async myLessonProgress(req: Request, res: Response): Promise<any> {
        try {
            const user = (req as any).user;
            if (!user?.sub)
                return res.status(401).json({ message: "Unauthorized" });
            const { course_id } = req.body;
            if (!course_id)
                return res.status(400).json({ message: "Thiếu course_id" });
            const rows = await this.courseService.myLessonProgress(
                user.sub,
                course_id,
            );
            return res.status(200).json({
                message: "success",
                data: rows,
            });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async purchaseCourse(req: Request, res: Response): Promise<any> {
        try {
            const user = (req as any).user;
            if (!user?.sub)
                return res.status(401).json({ message: "Unauthorized" });
            const { course_id } = req.body;
            if (!course_id)
                return res.status(400).json({ message: "Thiếu course_id" });
            await this.courseService.purchaseCourse(user.sub, course_id);
            return res.status(200).json({
                message: "Thanh toán (demo) và ghi danh đầy đủ.",
            });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async startTrial(req: Request, res: Response): Promise<any> {
        try {
            const user = (req as any).user;
            if (!user?.sub)
                return res.status(401).json({ message: "Unauthorized" });
            const { course_id } = req.body;
            if (!course_id)
                return res.status(400).json({ message: "Thiếu course_id" });
            await this.courseService.startTrial(user.sub, course_id);
            return res.status(200).json({
                message: "Đã bật học thử các bài xem trước.",
            });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async purchaseLearningPath(req: Request, res: Response): Promise<any> {
        try {
            const user = (req as any).user;
            if (!user?.sub)
                return res.status(401).json({ message: "Unauthorized" });
            const { path_id } = req.body;
            if (!path_id)
                return res.status(400).json({ message: "Thiếu path_id" });
            await this.courseService.purchaseLearningPath(user.sub, path_id);
            return res.status(200).json({
                message:
                    "Combo lộ trình: thanh toán (demo) và ghi danh các khóa trong gói.",
            });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async listLearningPaths(req: Request, res: Response): Promise<any> {
        try {
            const paths = await this.courseService.listPublishedLearningPaths();
            return res.status(200).json({ message: "success", data: paths });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async getCourseReviews(req: Request, res: Response): Promise<any> {
        try {
            const { course_id, limit, offset } = req.body;
            if (!course_id)
                return res.status(400).json({ message: "Thiếu course_id" });
            const agg =
                await this.courseService.courseReviewAggregate(course_id);
            const rows =
                await this.courseService.listCourseReviews(
                    course_id,
                    limit,
                    offset,
                );
            return res.status(200).json({
                message: "success",
                aggregate: agg,
                data: rows,
            });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async submitCourseReview(req: Request, res: Response): Promise<any> {
        try {
            const user = (req as any).user;
            if (!user?.sub)
                return res.status(401).json({ message: "Unauthorized" });
            const { course_id, rating, comment } = req.body;
            if (!course_id)
                return res.status(400).json({ message: "Thiếu course_id" });
            await this.courseService.submitCourseReview({
                userId: user.sub,
                course_id,
                rating,
                comment,
            });
            return res.status(200).json({
                message: "Đánh giá của bạn đã được ghi nhận.",
            });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async myCertificates(req: Request, res: Response): Promise<any> {
        try {
            const user = (req as any).user;
            if (!user?.sub)
                return res.status(401).json({ message: "Unauthorized" });
            const rows =
                await this.courseService.myCertificates(user.sub);
            return res.status(200).json({ message: "success", data: rows });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async getCourseDetail(req: Request, res: Response): Promise<any> {
        try {
            const { course_id, userId } = req.body;

            console.log(req.body);

            if (!course_id) {
                res.status(400).json({ message: "Thiếu thông tin." });
                return;
            }

            const result = await this.courseService.getCourseDetail({ course_id, userId });

            return res.status(200).json({
                message: "Get successfully",
                result: result,
            });
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }
}
