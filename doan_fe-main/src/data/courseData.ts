export type LessonType = "video" | "quiz" | "exam" | "docs";

export interface VideoContent {
    url: string;
    poster?: string;
}

export interface QuizQuestion {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number; // index
}

export interface QuizContent {
    questions: QuizQuestion[];
    passingScore?: number; // % để qua, mặc định 70
}

export interface ExamQuestion {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number;
}

export interface ExamContent {
    timeLimit: number; // phút
    questions: ExamQuestion[];
    passingScore: number;
}

export interface Lesson {
    id: string;
    title: string;
    type: LessonType;
    duration?: string; // chỉ cho video
    completed: boolean;
    content: VideoContent | QuizContent | ExamContent | DocsContent;
}

export interface Section {
    id: string;
    title: string;
    lessons: Lesson[];
}

export interface Course {
    id: number;
    title: string;
    instructor: string;
    sections: Section[];
}

export interface DocsContent {
    type: "markdown" | "html" | "pdf" | "text";
    content: string; // URL nếu là PDF, hoặc nội dung text/markdown/html
}

// Dữ liệu mẫu tích hợp quiz và exam
export const courseData: Course = {
    id: 1,
    title: "Lập trình Web với React & Node.js",
    instructor: "TS. Nguyễn Văn A",
    sections: [
        {
            id: "s1",
            title: "Giới thiệu khóa học",
            lessons: [
                {
                    id: "l1",
                    title: "Tổng quan về React",
                    type: "video",
                    duration: "5:20",
                    completed: true,
                    content: {
                        url: "https://www.w3schools.com/html/mov_bbb.mp4",
                    },
                },
                {
                    id: "l2",
                    title: "Quiz: Kiến thức cơ bản về React",
                    type: "quiz",
                    duration: "10:00",
                    completed: false,
                    content: {
                        questions: [
                            {
                                id: "q1",
                                text: "React là gì?",
                                options: [
                                    "Framework",
                                    "Thư viện",
                                    "Ngôn ngữ lập trình",
                                ],
                                correctAnswer: 1,
                            },
                        ],
                        passingScore: 70,
                    },
                },
                // thêm một section hoặc lesson docs
                {
                    id: "l5",
                    title: "Tài liệu tham khảo: React Hooks",
                    type: "docs",
                    duration: "15 phút đọc",
                    completed: false,
                    content: {
                        type: "markdown",
                        content: `
# React Hooks

Hooks là tính năng mới từ React 16.8. Cho phép bạn sử dụng state và các tính năng khác mà không cần viết class.

## useState
\`\`\`jsx
const [count, setCount] = useState(0);
\`\`\`

## useEffect
\`\`\`jsx
useEffect(() => {
  document.title = \`You clicked \${count} times\`;
}, [count]);
\`\`\`
    `,
                    },
                },
            ],
        },
        {
            id: "s2",
            title: "React cơ bản",
            lessons: [
                {
                    id: "l3",
                    title: "JSX là gì?",
                    type: "video",
                    duration: "7:10",
                    completed: false,
                    content: {
                        url: "https://www.w3schools.com/html/mov_bbb.mp4",
                    },
                },
                {
                    id: "l4",
                    title: "Exam cuối chương",
                    type: "exam",
                    duration: "45:00",
                    completed: false,
                    content: {
                        timeLimit: 30,
                        passingScore: 80,
                        questions: [
                            {
                                id: "e1",
                                text: "State trong React dùng để làm gì?",
                                options: [
                                    "Lưu dữ liệu thay đổi",
                                    "Tạo component",
                                    "Xử lý sự kiện",
                                ],
                                correctAnswer: 0,
                            },
                        ],
                    },
                },
            ],
        },
    ],
};
