export interface Question {
  id: string;
  text: string;
  options: string[]; // cho trắc nghiệm
  correctAnswer: string;
  points: number;
}

export interface Exam {
  id: string;
  title: string;
  questions: Question[];
  passingScore?: number;
}

export type LessonType = "video" | "quiz" | "docs";

export interface VideoContent {
  url: string;
  duration?: number;
  thumbnail?: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  points: number;
}

export interface QuizContent {
  questions: QuizQuestion[];
  passingScore?: number;
}

export interface DocsContent {
  content: string;
  attachments?: string[];
}

export type LessonContent = VideoContent | QuizContent | DocsContent;

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  content: LessonContent;
  order: number;
}

export interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
  exam?: Exam | null;
  order: number;
}

export interface Course {
  id: string;
  title: string;
  thumbnail: string;
  sections: Section[];
}
