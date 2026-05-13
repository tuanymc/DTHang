import type {
    DocsContent,
    ExamContent,
    ExamQuestion,
    Lesson,
    LessonType,
    QuizContent,
    QuizQuestion,
    Section,
    VideoContent,
} from "../data/courseData";

function formatDuration(sec?: number | null): string | undefined {
    if (sec == null || Number.isNaN(Number(sec))) return undefined;
    const s = Number(sec);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r < 10 ? "0" : ""}${r}`;
}

function toCorrectOptionIndex(options: string[], correct: unknown): number {
    if (typeof correct === "number") return correct;
    if (typeof correct === "string") {
        const idx = options.findIndex((o) => o === correct);
        return idx >= 0 ? idx : 0;
    }
    return 0;
}

function normalizeQuizQuestions(raw?: any[]): QuizQuestion[] {
    if (!Array.isArray(raw))
        return [];
    return raw.map((q, i) => {
        const opts: string[] =
            Array.isArray(q.options) ?
                q.options.map(String)
            :   [];
        return {
            id: String(q.id ?? `q_${i}`),
            text: String(q.text ?? ""),
            options:
                opts.length > 0 ? opts : ["A", "B", "C", "D"].slice(0, 4),
            correctAnswer:
                opts.length ?
                    toCorrectOptionIndex(opts, q.correctAnswer)
                :   0,
        };
    });
}

function normalizeExamQuestions(raw?: any[]): ExamQuestion[] {
    if (!Array.isArray(raw)) return [];
    return raw.map((q, i) => {
        const opts: string[] =
            Array.isArray(q.options) ?
                q.options.map(String)
            :   [];
        return {
            id: String(q.id ?? `e_${i}`),
            text: String(q.text ?? ""),
            options:
                opts.length > 0 ? opts : ["A", "B", "C", "D"].slice(0, 4),
            correctAnswer:
                opts.length ?
                    toCorrectOptionIndex(opts, q.correctAnswer)
                :   0,
        };
    });
}

function mapLessonFromApi(api: Record<string, unknown>): Lesson | null {
    const id = String(api.id ?? "");
    if (!id) return null;

    const rawType =
        ((api.type as string) ??
            (api.lesson_type as string) ??
            "docs")?.toLowerCase();
    let type = rawType as LessonType;

    const contentRaw =
        typeof api.content === "object" && api.content !== null ?
            (api.content as Record<string, unknown>)
        :   {};

    if (type === "video") {
        const vc: VideoContent = {
            url: String(api.video_url ?? contentRaw.url ?? ""),
            poster: contentRaw.poster ? String(contentRaw.poster) : undefined,
        };
        return {
            id,
            title: String(api.title ?? ""),
            type: "video",
            duration:
                formatDuration(
                    typeof api.video_duration === "number" ?
                        api.video_duration
                    :   Number(api.video_duration),
                ) ??
                (
                    typeof contentRaw.duration === "number" ?
                        formatDuration(Number(contentRaw.duration))
                    :   undefined
                ),
            completed: false,
            content: vc,
        };
    }

    if (type === "quiz") {
        const qc: QuizContent = {
            questions: normalizeQuizQuestions(
                contentRaw.questions as any[],
            ),
            passingScore: Number(contentRaw.passingScore ?? 70),
        };
        return {
            id,
            title: String(api.title ?? ""),
            type: "quiz",
            duration: undefined,
            completed: false,
            content: qc,
        };
    }

    if (type === "exam") {
        const ec: ExamContent = {
            timeLimit: Number(contentRaw.timeLimit ?? 45),
            questions: normalizeExamQuestions(
                contentRaw.questions as any[],
            ),
            passingScore: Number(contentRaw.passingScore ?? 60),
        };
        return {
            id,
            title: String(api.title ?? ""),
            type: "exam",
            duration: undefined,
            completed: false,
            content: ec,
        };
    }

    /** docs / không rõ đều xem như đọc tài liệu */
    type = "docs";
    let body = "";
    if (typeof contentRaw.content === "string") body = contentRaw.content;
    else if (typeof contentRaw.markdown === "string")
        body = contentRaw.markdown;
    else body = `# ${api.title ?? "Tài liệu"}`;
    const dc: DocsContent = {
        type: "markdown",
        content: body,
    };

    return {
        id,
        title: String(api.title ?? ""),
        type: "docs",
        duration: undefined,
        completed: false,
        content: dc,
    };
}

/**
 * Chuẩn hóa JSON trả về từ `fn_get_course_curriculum`.
 */
export function mapCurriculumToSections(curriculum: any): Section[] {
    if (!curriculum?.sections || !Array.isArray(curriculum.sections))
        return [];

    const sections = [...curriculum.sections];

    sections.sort(
        (a: any, b: any) => (Number(a.position) || 0) - (Number(b.position) || 0),
    );

    return sections.map((sec: any) => ({
        id: String(sec.id ?? ""),
        title: String(sec.title ?? ""),
        lessons:
            Array.isArray(sec.lessons)
                ?
                    [...sec.lessons]
                        .sort(
                            (a: any, b: any) =>
                                (Number(a.position) || 0) -
                                (Number(b.position) || 0),
                        )
                        .map((ls: any) => mapLessonFromApi(ls))
                        .filter((x): x is Lesson => Boolean(x))
                :   [],
    }));
}
