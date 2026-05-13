import apiClient from "./apiClient.service";

const getCourses = async (params?: any): Promise<any> => {
    try {
        const response = await apiClient.post("/course/list-course", {
            search: params.search,
            status: params.status,
            major_ids: params.major_ids,
            category_ids: params.category_ids,
            page: params.page || 1,
            page_size: params.pageSize ?? params.page_size ?? 10,
        });
        return response;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách", error);
        throw error;
    }
};

const createCourse = async (params: any): Promise<any> => {
    try {
        const formData = new FormData();

        formData.append("title", params.title);
        formData.append("description", params.description);
        formData.append("level", params.level);
        formData.append("status", params.status);
        formData.append("duration", String(params.duration || 0));

        formData.append("slug", params.slug ?? "");
        formData.append("price", String(params.price || 0));

        params.category_ids?.forEach((c: string) => {
            formData.append("category_ids[]", c);
        });

        params.major_ids?.forEach((m: string) => {
            formData.append("major_ids[]", m);
        });

        formData.append(
            "applyToAllFaculty",
            String(params.applyToAllFaculty || false),
        );

        if (params.thumbnailFile) {
            formData.append("thumbnail_url", params.thumbnailFile);
        }

        const response = await apiClient.post(
            "/course/create-course",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            },
        );

        return response.data;
    } catch (error) {
        console.error("Lỗi khi tạo khóa học", error);
        throw error;
    }
};

const updateCourse = async (params: any): Promise<any> => {
    try {
        const formData = new FormData();

        formData.append("id", params.id);
        formData.append("title", params.title ?? "");
        formData.append("description", params.description ?? "");
        formData.append("level", params.level ?? "");
        formData.append("status", params.status ?? "");
        formData.append("duration", String(params.duration ?? 0));

        formData.append(
            "slug",
            params.slug ?? params.slug_generated ?? "",
        );
        formData.append("price", String(params.price ?? 0));

        (params.categories ?? params.category_ids ?? []).forEach(
            (c: string) => {
                formData.append("categories[]", c);
                formData.append("category_ids[]", c);
            },
        );

        (params.majors ?? params.major_ids ?? []).forEach((m: string) => {
            formData.append("majors[]", m);
            formData.append("major_ids[]", m);
        });

        formData.append(
            "applyToAllFaculty",
            String(params.applyToAllFaculty || false),
        );

        if (params.thumbnailFile) {
            formData.append("thumbnail_url", params.thumbnailFile);
        }

        const response = await apiClient.post(
            "/course/update-course",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            },
        );

        return response.data;
    } catch (error) {
        console.error("Lỗi khi cập nhật khóa học", error);
        throw error;
    }
};

const deleteCourse = async (params?: any): Promise<any> => {
    try {
        const response = await apiClient.post("/course/delete-course", {
            id: params.id,
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi xóa khóa học", error);
        throw error;
    }
};

const allCourse = async (): Promise<any> => {
    try {
        const response = await apiClient.post("/course/all-course");
        return response;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách khóa học", error);
        throw error;
    }
};

const uploadLessonVideo = async (file: File): Promise<any> => {
    try {
        const formData = new FormData();
        formData.append("video", file);

        const response = await apiClient.post("/course/upload-video", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi upload video bài học", error);
        throw error;
    }
};

const syncCurriculum = async (
    courseId: string,
    sections: unknown[],
): Promise<any> => {
    try {
        const body = { courseId, sections };
        const response = await apiClient.post("/course/sync-curriculum", body);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi đồng bộ chương trình học", error);
        throw error;
    }
};

const getListCurriculums = async (params: {
    courseId: string;
}): Promise<any> => {
    try {
        const response = await apiClient.post("/course/get-curriculums", {
            courseId: params.courseId,
        });
        return response.data?.curriculum ?? response.data;
    } catch (error) {
        console.error("Lỗi khi lấy chương trình học", error);
        throw error;
    }
};

const getPopularCourse = async (
    params?: number | { limit?: number },
): Promise<any> => {
    try {
        const limit =
            typeof params === "number"
                ? params
                : Number((params as any)?.limit) || 12;
        const response = await apiClient.post("/course/get-popular-course", {
            limit,
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lay ds", error);
        throw error;
    }
};

export type CatalogPublishedPaginationDto = {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
};

export type CatalogPublishedData = {
    items: unknown[];
    pagination: CatalogPublishedPaginationDto;
};

const catalogPublished = async (params: {
    search?: string;
    major_ids?: string[];
    category_ids?: string[];
    page?: number;
    page_size?: number;
    pageSize?: number;
}): Promise<CatalogPublishedData> => {
    const response = await apiClient.post("/course/catalog-published", {
        search:
            typeof params.search === "string"
                ? params.search.trim()
                : undefined,
        major_ids:
            params.major_ids && params.major_ids.length > 0
                ? params.major_ids
                : undefined,
        category_ids:
            params.category_ids && params.category_ids.length > 0
                ? params.category_ids
                : undefined,
        page: params.page ?? 1,
        page_size: params.page_size ?? params.pageSize ?? 12,
    });
    const body = response.data as {
        data?: CatalogPublishedData;
        message?: string;
    };
    const d = body.data;
    const pg = params.page ?? 1;
    const ps = Math.min(
        100,
        Math.max(1, params.page_size ?? params.pageSize ?? 12),
    );
    if (!d) {
        return {
            items: [],
            pagination: {
                total: 0,
                page: pg,
                page_size: ps,
                total_pages: 0,
            },
        };
    }
    return {
        items: Array.isArray(d.items) ? d.items : [],
        pagination: {
            total: Number(d.pagination?.total) || 0,
            page: Number(d.pagination?.page) || pg,
            page_size: Number(d.pagination?.page_size) || ps,
            total_pages: Number(d.pagination?.total_pages) || 0,
        },
    };
};

const getCourseDetail = async (params: { course_id: string }): Promise<any> => {
    try {
        const response = await apiClient.post("/course/course-detail", params);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lay chi tiet", error);
        throw error;
    }
};

const enrollCourse = async (course_id: string): Promise<any> => {
    const res = await apiClient.post("/course/enroll", { course_id });
    return res.data;
};

export type EnrollmentMetaDto = {
    enrolled: boolean;
    wishlisted: boolean;
    price?: number;
    allows_trial?: boolean;
    access_kind?: "trial" | "full" | null;
    has_purchase?: boolean;
    avg_rating?: number;
    reviews_count?: number;
    progress_percent?: number;
    completed_at?: string | null;
};

const purchaseCourse = async (course_id: string): Promise<any> => {
    const res = await apiClient.post("/course/purchase-course", { course_id });
    return res.data;
};

const startTrial = async (course_id: string): Promise<any> => {
    const res = await apiClient.post("/course/start-trial", { course_id });
    return res.data;
};

const purchaseBundle = async (path_id: string): Promise<any> => {
    const res = await apiClient.post("/course/purchase-bundle", { path_id });
    return res.data;
};

export type LearningPathDto = {
    id: string;
    title: string;
    slug: string | null;
    description: string | null;
    audience_tag: string | null;
    bundle_price: number;
    status: string;
    course_ids: string[];
};

const listLearningPaths = async (): Promise<LearningPathDto[]> => {
    const res = await apiClient.post("/course/list-learning-paths", {});
    const raw = res.data?.data ?? res.data ?? [];
    return Array.isArray(raw) ?
            (raw as LearningPathDto[])
        :   [];
};

export type CourseReviewRowDto = {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    first_name: string | null;
    last_name: string | null;
};

const getCourseReviews = async (
    course_id: string,
    limit?: number,
    offset?: number,
): Promise<{ aggregate?: { avg_rating: number; count: number }; data?: CourseReviewRowDto[] }> => {
    const res = await apiClient.post("/course/course-reviews", {
        course_id,
        limit,
        offset,
    });
    return res.data;
};

const submitCourseReview = async (payload: {
    course_id: string;
    rating: number;
    comment?: string;
}): Promise<any> => {
    const res = await apiClient.post("/course/submit-review", payload);
    return res.data;
};

export type CertificateRowDto = {
    id: string;
    course_id: string;
    certificate_code: string;
    issued_at: string;
    title: string;
};

const myCertificates = async (): Promise<{ data?: CertificateRowDto[] }> => {
    const res = await apiClient.post("/course/my-certificates", {});
    return res.data;
};

const myEnrollments = async (): Promise<any> => {
    const res = await apiClient.post("/course/my-enrollments", {});
    return res.data;
};

const enrollmentStatus = async (
    course_id: string,
): Promise<EnrollmentMetaDto> => {
    const res = await apiClient.post("/course/enrollment-status", {
        course_id,
    });
    return res.data.data as EnrollmentMetaDto;
};

const wishlistAdd = async (course_id: string): Promise<any> => {
    const res = await apiClient.post("/course/wishlist-add", { course_id });
    return res.data;
};

const wishlistRemove = async (course_id: string): Promise<any> => {
    const res = await apiClient.post("/course/wishlist-remove", {
        course_id,
    });
    return res.data;
};

const myWishlist = async (): Promise<any> => {
    const res = await apiClient.post("/course/my-wishlist", {});
    return res.data;
};

const updateLessonProgress = async (payload: {
    course_id: string;
    lesson_id: string;
    progress_percent: number;
    is_completed: boolean;
}): Promise<any> => {
    const res = await apiClient.post("/course/update-lesson-progress", payload);
    return res.data;
};

export type QuizAttemptPayload = {
    course_id: string;
    lesson_id: string;
    score: number;
    max_score: number;
    passed: boolean;
    answers?: unknown;
};

const submitQuizAttempt = async (
    payload: QuizAttemptPayload,
): Promise<any> => {
    const res = await apiClient.post("/course/submit-quiz-attempt", payload);
    return res.data;
};

export type LessonProgressRowDto = {
    lesson_id: string;
    progress_percent: number;
    is_completed: boolean;
};

const myLessonProgress = async (
    course_id: string,
): Promise<LessonProgressRowDto[]> => {
    const res = await apiClient.post("/course/my-lesson-progress", {
        course_id,
    });
    return res.data?.data ?? [];
};

export const courseService = {
    getCourses,
    deleteCourse,
    updateCourse,
    createCourse,
    allCourse,
    uploadLessonVideo,
    syncCurriculum,
    getListCurriculums,
    getPopularCourse,
    catalogPublished,
    getCourseDetail,
    enrollCourse,
    purchaseCourse,
    startTrial,
    purchaseBundle,
    listLearningPaths,
    getCourseReviews,
    submitCourseReview,
    myCertificates,
    myEnrollments,
    enrollmentStatus,
    wishlistAdd,
    wishlistRemove,
    myWishlist,
    updateLessonProgress,
    submitQuizAttempt,
    myLessonProgress,
};
