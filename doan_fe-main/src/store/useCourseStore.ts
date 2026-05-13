import { create } from "zustand";
import { courseService } from "../services/course.service";

interface CourseState {
    courses: any[];
    total: number;
    page: number;
    pageSize: number;
    isLoading: boolean;
    allCourses: any[];

    allCurriculums: Record<string, unknown>;
    allPopularCourse: any[];
    courseDetail: any,

    getCourses: (params?: any) => Promise<void>;
    getCourseDetail: (courseId: string) => Promise<void>;
    createCourse: (data: any) => Promise<void>;
    updateCourse: (data: any) => Promise<void>;
    deleteCourse: (id: string) => Promise<void>;
    getAllCourse: () => Promise<void>;
    getCurriculum: (courseId: string) => Promise<void>;
    getPopularCourse: (limit?: number) => Promise<void>;
}

export const useCourseStore = create<CourseState>((set, get) => ({
    courses: [],
    total: 0,
    page: 1,
    pageSize: 10,
    isLoading: false,
    allCourses: [],
    allCurriculums: {},
    allPopularCourse: [],
    courseDetail: null,

    getCourses: async (params) => {
        set({ isLoading: true });

        try {
            const res = await courseService.getCourses({
                search: params?.search || null,
                status: params?.status || null,
                major_ids: params?.major_ids || null,
                category_ids: params?.category_ids || null,
                page: params?.page || get().page,
                pageSize: params?.pageSize || get().pageSize,
            });

            console.log("API RES:", res); // 👈 debug

            set({
                courses: res.data.result?.data || [], // 👈 FIX
                total: res.data.result?.pagination?.total || 0, // 👈 FIX
                page: res.data.result?.pagination?.page || 1,
                pageSize: res.data.result?.pagination?.page_size || 10,
                isLoading: false,
            });
        } catch (err) {
            console.error(err);
            set({ isLoading: false });
        }
    },

    getCurriculum: async (courseId: any) => {
        // set({ isLoading: true });

        try {
            const res = await courseService.getListCurriculums({
                courseId,
            });

            console.log("API RES:", res);

            set({
                allCurriculums:
                    res && typeof res === "object" && !Array.isArray(res)
                        ? (res as Record<string, unknown>)
                        :   {},
                isLoading: false,
            });
        } catch (err) {
            console.error(err);
            set({ isLoading: false });
        }
    },

    getPopularCourse: async (limit?: number) => {
        try {
            const res = await courseService.getPopularCourse(
                typeof limit === "number" ? limit : 12,
            );

            const row = res.result as
                | { get_featured_courses?: unknown }
                | undefined;
            const list =
                Array.isArray(row?.get_featured_courses)
                    ? row.get_featured_courses
                    :   [];

            set({
                allPopularCourse: list as unknown[],
                isLoading: false,
            });
        } catch (err) {
            console.error(err);
            set({ allPopularCourse: [], isLoading: false });
        }
    },

    getCourseDetail: async (course_id: any) => {
        set({ isLoading: true });

        try {
            const res = await courseService.getCourseDetail({
                course_id,
            });

            console.log("API RES:", res);

            set({
                courseDetail: res.result.fn_get_course_detail
                    || null,
                isLoading: false,
            });
        } catch (err) {
            console.error(err);
            set({ isLoading: false });
        }
    },

    createCourse: async (data) => {
        try {
            await courseService.createCourse(data);

            // reload list
            await get().getCourses();
        } catch (err) {
            throw err;
        }
    },

    updateCourse: async (data) => {
        try {
            await courseService.updateCourse(data);

            await get().getCourses();
        } catch (err) {
            throw err;
        }
    },

    deleteCourse: async (id) => {
        try {
            await courseService.deleteCourse(id);

            await get().getCourses();
        } catch (err) {
            throw err;
        }
    },

    getAllCourse: async () => {
        try {
            const res = await courseService.allCourse();
            console.log(res);

            set({
                allCourses: res.data.result || [],
            });
        } catch (err) {
            console.error(err);
        }
    },
}));
