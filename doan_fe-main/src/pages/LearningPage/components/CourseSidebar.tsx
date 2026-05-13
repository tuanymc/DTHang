import { Collapse, Typography } from "antd";
import LessonItem from "./LessonItem";
import { Section } from "../../../data/courseData";

const { Panel } = Collapse;
const { Text } = Typography;

interface CourseSidebarProps {
  sections: Section[];
  onToggleLesson: (lessonId: string, isChecked: boolean) => void;
  onSelectLesson: (lessonId: string) => void;
}

const CourseSidebar = ({ sections, onToggleLesson, onSelectLesson }: CourseSidebarProps) => {
  return (
    <div className="h-full overflow-y-auto pr-2">
      <div className="mb-4">
        <Text strong className="text-base">Nội dung khóa học</Text>
      </div>
      <Collapse defaultActiveKey={[sections[0]?.id]} accordion={false} ghost>
        {sections.map((section) => (
          <Panel
            header={
              <div className="flex justify-between items-center w-full">
                <span>{section.title}</span>
                <Text type="secondary" className="text-xs">
                  {section.lessons.length} bài học
                </Text>
              </div>
            }
            key={section.id}
          >
            <div className="pl-2">
              {section.lessons.map((lesson) => (
                <LessonItem
                  key={lesson.id}
                  lesson={lesson}
                  onToggleComplete={onToggleLesson}
                  onSelect={onSelectLesson}
                />
              ))}
            </div>
          </Panel>
        ))}
      </Collapse>
    </div>
  );
};

export default CourseSidebar;