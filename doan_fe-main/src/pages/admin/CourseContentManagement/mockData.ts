import { Course } from './types';

export const mockCourse: Course = {
  id: '1',
  title: 'Lập trình React cơ bản',
  thumbnail: 'https://picsum.photos/id/0/200/120',
  sections: [
    {
      id: 'sec1',
      title: 'Giới thiệu React',
      order: 0,
      lessons: [
        { id: 'l1', title: 'Giới thiệu khóa học', type: 'video', content: { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 120 }, order: 0 },
        { id: 'l2', title: 'Cài đặt môi trường', type: 'video', content: { url: 'https://www.youtube.com/watch?v=abc123', duration: 300 }, order: 1 },
        { id: 'l3', title: 'Kiểm tra kiến thức', type: 'quiz', content: { questions: [{ id: 'q1', text: 'React là gì?', options: ['Thư viện UI', 'Framework', 'Ngôn ngữ', 'Database'], correctAnswer: 'Thư viện UI', points: 1 }], passingScore: 70 }, order: 2 },
      ],
      exam: null,
    },
    {
      id: 'sec2',
      title: 'Components cơ bản',
      order: 1,
      lessons: [
        { id: 'l4', title: 'Function vs Class Component', type: 'video', content: { url: 'https://www.youtube.com/watch?v=xyz789', duration: 450 }, order: 0 },
        { id: 'l5', title: 'Tài liệu tham khảo', type: 'docs', content: { content: '# Props và State\n\nProps là dữ liệu truyền từ cha xuống con.\nState là dữ liệu nội bộ của component.' }, order: 1 },
      ],
      exam: { id: 'exam1', title: 'Bài kiểm tra Components', questions: [{ id: 'q1', text: 'React là gì?', options: ['Thư viện UI', 'Framework', 'Ngôn ngữ', 'Database'], correctAnswer: 'Thư viện UI', points: 1 }], passingScore: 70 },
    },
  ],
};