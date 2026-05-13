import React from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import SectionItem from './SectionItem';
import { Section } from './types';

interface SectionListProps {
  sections: Section[];
  onSectionsChange: (sections: Section[]) => void;
}

const SortableSectionWrapper: React.FC<{ section: Section; children: React.ReactNode }> = ({ section, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {/* Không gán listeners ở đây, mà sẽ truyền xuống dưới dạng prop để gắn vào handle riêng */}
      {React.cloneElement(
        children as React.ReactElement<{ dragHandleListeners?: object }>,
        { dragHandleListeners: listeners },
      )}
    </div>
  );
};

const SectionList: React.FC<SectionListProps> = ({ sections, onSectionsChange }) => {
  const addNewSection = () => {
    const newSection: Section = {
      id: window.crypto.randomUUID(),
      title: 'Section mới',
      lessons: [],
      exam: null,
      order: sections.length,
    };
    onSectionsChange([...sections, newSection]);
  };

  const updateSection = (updatedSection: Section) => {
    const newSections = sections.map(s => s.id === updatedSection.id ? updatedSection : s);
    onSectionsChange(newSections);
  };

  const deleteSection = (sectionId: string) => {
    const newSections = sections.filter(s => s.id !== sectionId);
    onSectionsChange(newSections);
  };

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <SortableSectionWrapper key={section.id} section={section}>
          <SectionItem
            section={section}
            onUpdate={updateSection}
            onDelete={deleteSection}
          />
        </SortableSectionWrapper>
      ))}
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={addNewSection}
        block
        className="mt-2 h-10"
      >
        Thêm section mới
      </Button>
    </div>
  );
};

export default SectionList;