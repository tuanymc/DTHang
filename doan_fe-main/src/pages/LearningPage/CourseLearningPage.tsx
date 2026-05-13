import { useState, useEffect } from "react";
import { Row, Col, Layout, Spin, message } from "antd";
import LearningHeader from "./components/LearningHeader";
import LessonContent from "./components/LessonContent";
import CourseSidebar from "./components/CourseSidebar";
import { useSearchParams } from "react-router-dom";
import { courseService } from "../../services/course.service";
import { mapCurriculumToSections } from "../../utils/curriculumMapper";
import type { Section } from "../../data/courseData";
import type { LessonProgressRowDto } from "../../services/course.service";

const { Content } = Layout;

function mergeLessonProgressIntoSections(
    sections: Section[],
    rows: LessonProgressRowDto[],
): Section[] {
    const map = new Map(rows.map((r) => [r.lesson_id, r]));
    return sections.map((sec) => ({
        ...sec,
        lessons: sec.lessons.map((lesson) => {
            const row = map.get(lesson.id);
            if (!row) return lesson;
            return {
                ...lesson,
                completed: Boolean(row.is_completed),
            };
        }),
    }));
}

const CourseLearningPage = () => {
    const [searchParams] = useSearchParams();
    const courseId = searchParams.get("courseId");

    const [sections, setSections] = useState<Section[]>([]);
    const [courseTitle, setCourseTitle] = useState("Khóa học");
    const [currentLessonId, setCurrentLessonId] = useState<string | null>(
        null,
    );
    const [progress, setProgress] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!courseId) return;
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const cur = await courseService.getListCurriculums({
                    courseId,
                });
                if (cancelled) return;

                const title =
                    (cur &&
                    typeof cur === "object" &&
                    "course_title" in cur ?
                        String(
                            (
                                cur as {
                                    course_title?: string;
                                }
                            ).course_title ?? "",
                        )
                    :   "") || `Khóa học (${courseId})`;

                const mapped =
                    cur &&
                    typeof cur === "object" &&
                    "sections" in cur ?
                        mapCurriculumToSections(cur)
                    :   mapCurriculumToSections(cur as any);

                let withProgress = mapped;
                try {
                    const rows = await courseService.myLessonProgress(
                        courseId,
                    );
                    if (!cancelled)
                        withProgress = mergeLessonProgressIntoSections(
                            mapped,
                            rows,
                        );
                } catch {
                    /* chưa đăng ký hoặc lỗi mạng: vẫn hiển thị curriculum */
                }

                setCourseTitle(title || "Khóa học");
                setSections(withProgress);
                setCurrentLessonId(null);
            } catch {
                setError("Không tải được nội dung khóa học.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [courseId]);

    const flatLessons = sections.flatMap((s) => s.lessons);

    const currentLesson =
        flatLessons.find((l) => l.id === currentLessonId)
        ?? flatLessons[0];

    useEffect(() => {
        const allLessons = sections.flatMap((s) => s.lessons);
        const completedCount = allLessons.filter((l) => l.completed).length;
        const percent =
            allLessons.length === 0 ?
                0
            :   Math.round((completedCount / allLessons.length) * 100);
        setProgress(percent);
        if (
            (!currentLessonId
                || !allLessons.some((l) => l.id === currentLessonId))
            && allLessons.length > 0
        ) {
            setCurrentLessonId(allLessons[0].id);
        }
    }, [sections, currentLessonId]);

    const persistLessonProgress = async (
        lessonId: string,
        progressPercent: number,
        isCompleted: boolean,
    ): Promise<void> => {
        if (!courseId) return;
        try {
            await courseService.updateLessonProgress({
                course_id: courseId,
                lesson_id: lessonId,
                progress_percent: progressPercent,
                is_completed: isCompleted,
            });
            setSections((prev) =>
                prev.map((sec) => ({
                    ...sec,
                    lessons: sec.lessons.map((lesson) =>
                        lesson.id === lessonId ?
                            { ...lesson, completed: isCompleted }
                        :   lesson,
                    ),
                })),
            );
        } catch {
            message.error("Không lưu được tiến độ");
        }
    };

    const applyLocalCompletion = (lessonId: string, completed: boolean) => {
        setSections((prev) =>
            prev.map((sec) => ({
                ...sec,
                lessons: sec.lessons.map((lesson) =>
                    lesson.id === lessonId ?
                        { ...lesson, completed }
                    :   lesson,
                ),
            })),
        );
    };

    const handleToggleLesson = (
        lessonId: string,
        isChecked: boolean,
    ): void => {
        void persistLessonProgress(
            lessonId,
            isChecked ? 100 : 0,
            isChecked,
        );
    };

    if (!courseId) {
        return (
            <div className="p-12 text-center text-gray-600">
                Thiếu tham số <code>courseId</code>. Ví dụ:{" "}
                <code>/learning?courseId=demo-course-web-fe</code>
            </div>
        );
    }

    return (
        <Layout className="min-h-screen bg-gray-100">
            <LearningHeader courseTitle={courseTitle} progressPercent={progress} />
            <Content className="p-6">
                {loading ? (
                    <div className="flex justify-center py-24">
                        <Spin size="large" />
                    </div>
                ) : error ?
                    <div className="text-center text-red-600 py-24">{error}</div>
                :   <Row gutter={[24, 24]}>
                        <Col xs={24} lg={16}>
                            {currentLesson && (
                                <LessonContent
                                    lesson={currentLesson}
                                    courseId={courseId}
                                    persistLessonProgress={
                                        persistLessonProgress
                                    }
                                    applyLocalCompletion={
                                        applyLocalCompletion
                                    }
                                />
                            )}
                        </Col>
                        <Col xs={24} lg={8}>
                            <div className="bg-white rounded-xl shadow-md p-4 h-[calc(100vh-120px)] overflow-y-auto">
                                <CourseSidebar
                                    sections={sections}
                                    onToggleLesson={handleToggleLesson}
                                    onSelectLesson={setCurrentLessonId}
                                />
                            </div>
                        </Col>
                    </Row>
                }
            </Content>
        </Layout>
    );
};

export default CourseLearningPage;
