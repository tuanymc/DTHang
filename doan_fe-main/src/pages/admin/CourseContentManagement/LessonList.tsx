import React from 'react';
import { Button, Dropdown, MenuProps } from 'antd';
import { PlusOutlined, VideoCameraOutlined, FileTextOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import LessonItem from './LessonItem';
import type { Lesson, LessonType, LessonContent } from './types';

interface LessonListProps {
  lessons: Lesson[];
  onLessonsChange: (lessons: Lesson[]) => void;
}

const SortableLessonWrapper: React.FC<{ lesson: Lesson; children: React.ReactNode }> = ({ lesson, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {React.cloneElement(
        children as React.ReactElement<{ dragHandleListeners?: object }>,
        { dragHandleListeners: listeners },
      )}
    </div>
  );
};

const LessonList: React.FC<LessonListProps> = ({ lessons, onLessonsChange }) => {
  const addLesson = (type: LessonType) => {
    const emptyContent = {} as LessonContent;
    const newLesson: Lesson = {
      id: window.crypto.randomUUID(),
      title: `Bài ${type === 'video' ? 'video' : type === 'quiz' ? 'trắc nghiệm' : 'tài liệu'} mới`,
      type,
      content: emptyContent,
      order: lessons.length,
    };
    onLessonsChange([...lessons, newLesson]);
  };

  const updateLesson = (updated: Lesson) => {
    const newLessons = lessons.map(l => l.id === updated.id ? updated : l);
    onLessonsChange(newLessons);
  };

  const deleteLesson = (id: string) => {
    onLessonsChange(lessons.filter(l => l.id !== id));
  };

  const items: MenuProps['items'] = [
    { key: 'video', label: 'Video', icon: <VideoCameraOutlined /> },
    { key: 'quiz', label: 'Quiz (Trắc nghiệm)', icon: <QuestionCircleOutlined /> },
    { key: 'docs', label: 'Docs (Tài liệu)', icon: <FileTextOutlined /> },
  ];

  return (
    <div className="space-y-2">
      {lessons.map((lesson) => (
        <SortableLessonWrapper key={lesson.id} lesson={lesson}>
          <LessonItem
            lesson={lesson}
            onUpdate={updateLesson}
            onDelete={deleteLesson}
          />
        </SortableLessonWrapper>
      ))}
      <Dropdown menu={{ items, onClick: ({ key }) => addLesson(key as LessonType) }} trigger={['click']}>
        <Button type="dashed" icon={<PlusOutlined />} size="small" className="mt-1">
          Thêm bài học
        </Button>
      </Dropdown>
    </div>
  );
};

export default LessonList;