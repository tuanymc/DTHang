import React, { useState } from 'react';
import { Collapse, Input, Button, Space, Popconfirm, Switch, Typography, Modal } from 'antd';
import { DeleteOutlined, EditOutlined, HolderOutlined } from '@ant-design/icons';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import LessonList from './LessonList';
import ExamForm from './ExamForm';
import { Section, Lesson } from './types';

const { Panel } = Collapse;
const { Text } = Typography;

interface SectionItemProps {
  section: Section;
  onUpdate: (section: Section) => void;
  onDelete: (id: string) => void;
  dragHandleListeners?: any; // nhận từ SortableSectionWrapper
}

const SectionItem: React.FC<SectionItemProps> = ({ section, onUpdate, onDelete, dragHandleListeners }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(section.title);

  const handleTitleSave = () => {
    if (title.trim()) {
      onUpdate({ ...section, title: title.trim() });
    } else {
      setTitle(section.title);
    }
    setIsEditingTitle(false);
  };

  const handleLessonsChange = (newLessons: Lesson[]) => {
    onUpdate({ ...section, lessons: newLessons });
  };

  const handleExamToggle = (checked: boolean) => {
    if (!checked && section.exam) {
      Modal.confirm({
        title: 'Xóa bài kiểm tra',
        content: 'Bạn có chắc muốn xóa bài kiểm tra này? Dữ liệu sẽ mất.',
        onOk: () => {
          onUpdate({ ...section, exam: null });
        },
      });
    } else if (checked && !section.exam) {
      onUpdate({
        ...section,
        exam: {
          id: Date.now().toString(),
          title: 'Bài kiểm tra cuối section',
          questions: [],
          passingScore: 70,
        },
      });
    }
  };

  const handleExamUpdate = (exam: any) => {
    onUpdate({ ...section, exam });
  };

  const handleDragLessonEnd = (event: DragEndEvent, currentLessons: Lesson[]) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = currentLessons.findIndex(l => l.id === active.id);
    const newIndex = currentLessons.findIndex(l => l.id === over.id);
    const newLessons = [...currentLessons];
    const [moved] = newLessons.splice(oldIndex, 1);
    newLessons.splice(newIndex, 0, moved);
    newLessons.forEach((l, idx) => l.order = idx);
    handleLessonsChange(newLessons);
  };

  const headerContent = (
    <div className="flex justify-between items-center w-full pr-4">
      <div className="flex items-center gap-2">
        {/* Drag handle chỉ gắn vào icon này */}
        <HolderOutlined
          className="cursor-grab text-gray-400"
          {...dragHandleListeners}  // gắn listeners vào đây
        />
        {isEditingTitle ? (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSave}
            onPressEnter={handleTitleSave}
            autoFocus
            size="small"
            className="w-64"
          />
        ) : (
          <Text strong className="text-base">{section.title}</Text>
        )}
      </div>
      <Space>
        <Button
          type="text"
          icon={<EditOutlined />}
          size="small"
          onClick={(e) => { e.stopPropagation(); setIsEditingTitle(true); }}
        />
        <Popconfirm
          title="Xóa section"
          description="Các lesson và exam bên trong cũng sẽ bị xóa. Bạn chắc chắn?"
          onConfirm={() => onDelete(section.id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button type="text" danger icon={<DeleteOutlined />} size="small" onClick={(e) => e.stopPropagation()} />
        </Popconfirm>
      </Space>
    </div>
  );

  return (
    <Collapse defaultActiveKey={[section.id]} className="bg-white rounded-lg border">
      <Panel header={headerContent} key={section.id}>
        <DndContext collisionDetection={closestCenter} onDragEnd={(e: DragEndEvent) => handleDragLessonEnd(e, section.lessons)}>
          <SortableContext items={section.lessons.map(l => l.id)} strategy={verticalListSortingStrategy}>
            <LessonList
              lessons={section.lessons}
              onLessonsChange={handleLessonsChange}
            />
          </SortableContext>
        </DndContext>

        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Bài kiểm tra cuối section (Exam)</span>
            <Switch
              checked={!!section.exam}
              onChange={handleExamToggle}
              checkedChildren="Có"
              unCheckedChildren="Không"
            />
          </div>
          {section.exam && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <ExamForm exam={section.exam} onUpdate={handleExamUpdate} />
            </div>
          )}
        </div>
      </Panel>
    </Collapse>
  );
};

export default SectionItem;