import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, message, Space, Typography, Spin } from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SectionList from "./SectionList";
import type { Section } from "./types";
import { toast } from "sonner";
import { courseService } from "../../../services/course.service";
import { useCourseStore } from "../../../store/useCourseStore";

const { Title } = Typography;

const CourseContentManagement: React.FC = () => {
    const { courseId } = useParams<{ courseId: any }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const { allCurriculums, getCurriculum } = useCourseStore();

    useEffect(() => {
        const fetchCurriculum = async () => {
            setLoading(true);
            await getCurriculum(courseId);
            setLoading(false);
        };
        if (courseId) {
            fetchCurriculum();
        }
    }, [courseId, getCurriculum]);


    const [localSections, setLocalSections] = useState<Section[]>([]);

    // Đồng bộ khi allCurriculums thay đổi
    useEffect(() => {
        const secs = allCurriculums?.sections;
        if (Array.isArray(secs)) {
            setLocalSections(secs as Section[]);
        }
    }, [allCurriculums]);

    const handleDragSectionEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // 1. Kiểm tra điều kiện dừng
    if (!over || active.id === over.id) return;

    // 2. Tìm vị trí cũ và mới dựa trên localSections (State đang hiển thị)
    const oldIndex = localSections.findIndex((s: any) => s.id === active.id);
    const newIndex = localSections.findIndex((s: any) => s.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
        // 3. Sử dụng arrayMove để tạo mảng mới đã đổi chỗ
        const movedSections = arrayMove(localSections, oldIndex, newIndex);

        // 4. Cập nhật thuộc tính 'order' cho từng section dựa trên vị trí mới
        const updatedSections = movedSections.map((sec: any, idx: number) => ({
            ...sec,
            order: idx,
        }));

        // 5. Cập nhật vào Local State để UI render lại ngay lập tức
        setLocalSections(updatedSections);
    }
};

    const handleSave = async () => {

        if (!courseId) return;

        setSaving(true);
        try {
            // Gọi service đã viết
            const result = await courseService.syncCurriculum(
                courseId,
                localSections,
            );

            toast.success("Đã lưu toàn bộ nội dung thành công!");
        } catch (error) {
            message.error("Lưu thất bại, vui lòng kiểm tra lại log.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spin size="large" />
            </div>
        );
    }

    const rawSections = allCurriculums?.sections;
    if (!allCurriculums || !Array.isArray(rawSections)) {
        return <div>Không tìm thấy nội dung khóa học</div>;
    }

    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
            <Card className="shadow-md rounded-2xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <Space>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate("/admin/v1/lesson-management")}
                        >
                            Quay lại
                        </Button>
                        <Title level={4} className="!mb-0">
                            Quản lý nội dung:{" "}
                            {String(allCurriculums.course_title ?? "")}
                        </Title>
                    </Space>
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={handleSave}
                        loading={saving}
                        size="large"
                    >
                        Lưu tất cả
                    </Button>
                </div>

                {/* Khu vực sections có drag-drop */}
                <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragSectionEnd}
                >
                    <SortableContext
                        items={localSections.map((s: any) => s.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <SectionList
                            sections={localSections}
                            onSectionsChange={setLocalSections}
                        />
                    </SortableContext>
                </DndContext>
            </Card>
        </div>
    );
};

export default CourseContentManagement;
