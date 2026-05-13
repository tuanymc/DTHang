import {
    Lesson,
    VideoContent,
    QuizContent,
    ExamContent,
    DocsContent,
} from "../../../data/courseData";
import VideoPlayer from "./VideoPlayer";
import QuizPlayer, { type QuizCompleteDetail } from "./QuizPlayer";
import ExamPlayer from "./ExamPlayer";
import DocViewer from "./DocViewer";
import { Button, message } from "antd";
import { courseService } from "../../../services/course.service";

interface LessonContentProps {
    lesson: Lesson;
    courseId: string;
    persistLessonProgress: (
        lessonId: string,
        progressPercent: number,
        isCompleted: boolean,
    ) => Promise<void>;
    applyLocalCompletion: (lessonId: string, completed: boolean) => void;
}

const LessonContent = ({
    lesson,
    courseId,
    persistLessonProgress,
    applyLocalCompletion,
}: LessonContentProps) => {
    const handleQuizAttempt = async (detail: QuizCompleteDetail) => {
        try {
            await courseService.submitQuizAttempt({
                course_id: courseId,
                lesson_id: lesson.id,
                score: detail.correctCount,
                max_score: detail.totalQuestions,
                passed: detail.passed,
                answers: { selected: detail.selectedIndexes },
            });
            if (detail.passed) applyLocalCompletion(lesson.id, true);
        } catch {
            message.error("Không lưu được kết quả bài kiểm tra");
        }
    };

    const handleDocsComplete = () => {
        void persistLessonProgress(lesson.id, 100, true);
    };

    switch (lesson.type) {
        case "video":
            const videoContent = lesson.content as VideoContent;
            return (
                <VideoPlayer
                    url={videoContent.url}
                    title={lesson.title}
                    poster={videoContent.poster}
                    onPlaybackComplete={() =>
                        void persistLessonProgress(lesson.id, 100, true)
                    }
                />
            );
        case "quiz":
            return (
                <QuizPlayer
                    key={lesson.id}
                    content={lesson.content as QuizContent}
                    onComplete={handleQuizAttempt}
                />
            );
        case "exam":
            return (
                <ExamPlayer
                    key={lesson.id}
                    content={lesson.content as ExamContent}
                    onComplete={handleQuizAttempt}
                />
            );
        case "docs":
            return (
                <div>
                    <DocViewer
                        content={lesson.content as DocsContent}
                        title={lesson.title}
                    />
                    <div className="mt-4 text-center">
                        <Button type="primary" onClick={handleDocsComplete}>
                            Đánh dấu đã đọc
                        </Button>
                    </div>
                </div>
            );
        default:
            return <div>Loại bài học không được hỗ trợ</div>;
    }
};

export default LessonContent;
