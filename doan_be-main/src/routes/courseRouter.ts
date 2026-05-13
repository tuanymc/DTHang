import { Router } from "express";
import multer from "multer";
import { container } from "tsyringe";
import { authMiddleware } from "../middlewares/auth.middleware";
import { optionalAuthMiddleware } from "../middlewares/optionalAuth.middleware";
import { CourseController } from "../controllers/courseController";

const courseRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });
const courseController = container.resolve(CourseController);

courseRouter.post(
    "/create-course",
    authMiddleware,
    upload.single("thumbnail_url"),
    courseController.createCourse.bind(courseController),
);

courseRouter.post(
    "/update-course",
    authMiddleware,
    upload.single("thumbnail_url"),
    courseController.updateCourse.bind(courseController),
);

courseRouter.post(
    "/delete-course",
    authMiddleware,
    courseController.deleteCourse.bind(courseController),
);

courseRouter.post(
    "/publish-course",
    authMiddleware,
    courseController.publishCourse.bind(courseController),
);

courseRouter.post(
    "/archived-course",
    authMiddleware,
    courseController.archiveCourse.bind(courseController),
);

courseRouter.post(
    "/upload-video",
    authMiddleware,
    upload.single("video"),
    courseController.uploadLessonVideo.bind(courseController),
);

courseRouter.post(
    "/get-curriculums",
    authMiddleware,
    courseController.getCurriculum.bind(courseController),
);

courseRouter.post(
    "/sync-curriculum",
    authMiddleware,
    courseController.syncCurriculum.bind(courseController),
);

courseRouter.post(
    "/catalog-published",
    courseController.catalogPublished.bind(courseController),
);

courseRouter.post(
    "/get-popular-course",
    courseController.getPopularCourse.bind(courseController),
);

courseRouter.post(
    "/course-detail",
    courseController.getCourseDetail.bind(courseController),
);

courseRouter.post(
    "/list-course",
    authMiddleware,
    courseController.getListCourse.bind(courseController),
);

courseRouter.post(
    "/enroll",
    authMiddleware,
    courseController.enroll.bind(courseController),
);

courseRouter.post(
    "/my-enrollments",
    authMiddleware,
    courseController.myEnrollments.bind(courseController),
);

courseRouter.post(
    "/enrollment-status",
    optionalAuthMiddleware,
    courseController.enrollmentStatus.bind(courseController),
);

courseRouter.post(
    "/wishlist-add",
    authMiddleware,
    courseController.wishlistAdd.bind(courseController),
);

courseRouter.post(
    "/wishlist-remove",
    authMiddleware,
    courseController.wishlistRemove.bind(courseController),
);

courseRouter.post(
    "/my-wishlist",
    authMiddleware,
    courseController.wishlistList.bind(courseController),
);

courseRouter.post(
    "/update-lesson-progress",
    authMiddleware,
    courseController.updateLessonProgress.bind(courseController),
);

courseRouter.post(
    "/submit-quiz-attempt",
    authMiddleware,
    courseController.submitQuizAttempt.bind(courseController),
);

courseRouter.post(
    "/my-lesson-progress",
    authMiddleware,
    courseController.myLessonProgress.bind(courseController),
);

courseRouter.post(
    "/list-learning-paths",
    courseController.listLearningPaths.bind(courseController),
);

courseRouter.post(
    "/course-reviews",
    courseController.getCourseReviews.bind(courseController),
);

courseRouter.post(
    "/purchase-course",
    authMiddleware,
    courseController.purchaseCourse.bind(courseController),
);

courseRouter.post(
    "/start-trial",
    authMiddleware,
    courseController.startTrial.bind(courseController),
);

courseRouter.post(
    "/purchase-bundle",
    authMiddleware,
    courseController.purchaseLearningPath.bind(courseController),
);

courseRouter.post(
    "/submit-review",
    authMiddleware,
    courseController.submitCourseReview.bind(courseController),
);

courseRouter.post(
    "/my-certificates",
    authMiddleware,
    courseController.myCertificates.bind(courseController),
);

export default courseRouter;
