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

const myEnrollments = async (): Promise<any> => {
    const res = await apiClient.post("/course/my-enrollments", {});
    return res.data;
};

const enrollmentStatus = async (
    course_id: string,
): Promise<{ enrolled: boolean; wishlisted: boolean }> => {
    const res = await apiClient.post("/course/enrollment-status", {
        course_id,
    });
    return res.data.data;
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
    getCourseDetail,
    enrollCourse,
    myEnrollments,
    enrollmentStatus,
    wishlistAdd,
    wishlistRemove,
    myWishlist,
    updateLessonProgress,
    submitQuizAttempt,
    myLessonProgress,
};
