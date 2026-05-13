import { Checkbox, Typography, Space } from "antd";
import { PlayCircleOutlined, FileTextOutlined, SolutionOutlined, ReadOutlined } from "@ant-design/icons";
import { Lesson } from "../../../data/courseData";

const { Text } = Typography;

interface LessonItemProps {
  lesson: Lesson;
  onToggleComplete: (lessonId: string, isChecked: boolean) => void;
  onSelect: (lessonId: string) => void;
}

const LessonItem = ({ lesson, onToggleComplete, onSelect }: LessonItemProps) => {
  const getIcon = () => {
    switch (lesson.type) {
      case "video": return <PlayCircleOutlined className="text-blue-500" />;
      case "quiz": return <FileTextOutlined className="text-green-500" />;
      case "exam": return <SolutionOutlined className="text-red-500" />;
      case "docs": return <ReadOutlined className="text-purple-500" />;
      default: return null;
    }
  };

  return (
    <div
      className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded-lg transition cursor-pointer"
      onClick={() => onSelect(lesson.id)}
    >
      <Space>
        <Checkbox
          checked={lesson.completed}
          onChange={(e) => {
            e.stopPropagation();
            onToggleComplete(lesson.id, e.target.checked);
          }}
        />
        {getIcon()}
        <Text className="text-sm">{lesson.title}</Text>
      </Space>
      <Text type="secondary" className="text-xs">{lesson.duration || ""}</Text>
    </div>
  );
};

export default LessonItem;