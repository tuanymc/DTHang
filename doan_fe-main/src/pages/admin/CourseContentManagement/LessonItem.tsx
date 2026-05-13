import React, { useState } from 'react';
import { Input, Button, Space, Popconfirm, Typography, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, HolderOutlined, VideoCameraOutlined, QuestionCircleOutlined, FileTextOutlined, SettingOutlined } from '@ant-design/icons';
import LessonContentModal from './LessonContentModal';
import { Lesson } from './types';

const { Text } = Typography;

interface LessonItemProps {
  lesson: Lesson;
  onUpdate: (lesson: Lesson) => void;
  onDelete: (id: string) => void;
  dragHandleListeners?: any;
}

const LessonItem: React.FC<LessonItemProps> = ({ lesson, onUpdate, onDelete, dragHandleListeners }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [contentModalOpen, setContentModalOpen] = useState(false);

  const handleSaveTitle = () => {
    if (title.trim()) {
      onUpdate({ ...lesson, title: title.trim() });
    } else {
      setTitle(lesson.title);
    }
    setIsEditing(false);
  };

  const getIcon = () => {
    switch (lesson.type) {
      case 'video': return <VideoCameraOutlined className="text-blue-500" />;
      case 'quiz': return <QuestionCircleOutlined className="text-green-500" />;
      case 'docs': return <FileTextOutlined className="text-orange-500" />;
      default: return null;
    }
  };

  const getTypeLabel = () => {
    switch (lesson.type) {
      case 'video': return 'Video';
      case 'quiz': return 'Quiz';
      case 'docs': return 'Tài liệu';
      default: return '';
    }
  };

  const handleContentSave = (updatedLesson: Lesson) => {
    onUpdate(updatedLesson);
    setContentModalOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-100">
        <div className="flex items-center gap-2 flex-1">
          <HolderOutlined className="cursor-grab text-gray-400" {...dragHandleListeners} />
          {getIcon()}
          {isEditing ? (
            <Input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={handleSaveTitle} onPressEnter={handleSaveTitle} autoFocus size="small" className="w-64" />
          ) : (
            <Text>{lesson.title}</Text>
          )}
          <Tag className="text-xs">{getTypeLabel()}</Tag>
        </div>
        <Space size="small">
          <Button type="text" icon={<SettingOutlined />} size="small" onClick={() => setContentModalOpen(true)} title="Chỉnh sửa nội dung" />
          <Button type="text" icon={<EditOutlined />} size="small" onClick={() => setIsEditing(true)} />
          <Popconfirm title="Xóa bài học?" onConfirm={() => onDelete(lesson.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      </div>
      <LessonContentModal open={contentModalOpen} lesson={lesson} onSave={handleContentSave} onCancel={() => setContentModalOpen(false)} />
    </>
  );
};

export default LessonItem;