import React, { useState, useEffect, useRef } from "react";
import {
    Modal,
    Form,
    Input,
    InputNumber,
    Button,
    Space,
    Table,
    Popconfirm,
    message,
    Tabs,
    Upload,
    Spin,
    Alert,
    Divider,
} from "antd";
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    UploadOutlined,
    EyeOutlined,
} from "@ant-design/icons";
import type { UploadProps, RcFile } from "antd/es/upload";
import ReactMarkdown from "react-markdown";
import {
    Lesson,
    VideoContent,
    QuizContent,
    DocsContent,
    QuizQuestion,
} from "./types";
import { courseService } from "../../../services/course.service";

const { TextArea } = Input;
const { TabPane } = Tabs;

interface LessonContentModalProps {
    open: boolean;
    lesson: Lesson | null;
    onSave: (updatedLesson: Lesson) => void;
    onCancel: () => void;
}

const LessonContentModal: React.FC<LessonContentModalProps> = ({
    open,
    lesson,
    onSave,
    onCancel,
}) => {
    const [form] = Form.useForm();
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(
        null,
    );
    const [questionModalVisible, setQuestionModalVisible] = useState(false);
    const [questionForm] = Form.useForm();
    const [previewQuizVisible, setPreviewQuizVisible] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(
        null,
    );

    // Ref để lấy duration từ video upload
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (lesson && open) {
            form.setFieldsValue({ title: lesson.title });
            if (lesson.type === "video") {
                const content = lesson.content as VideoContent;
                form.setFieldsValue({
                    videoUrl: content.url,
                    duration: content.duration,
                });
                setUploadedVideoUrl(null); // reset
            } else if (lesson.type === "quiz") {
                const content = lesson.content as QuizContent;
                setQuestions(content.questions || []);
                form.setFieldsValue({ passingScore: content.passingScore });
            } else if (lesson.type === "docs") {
                const content = lesson.content as DocsContent;
                form.setFieldsValue({ docContent: content.content });
            }
        }
    }, [lesson, open, form]);

    const handleSave = () => {
        if (!lesson) return;
        form.validateFields().then((values) => {
            let updatedContent: VideoContent | QuizContent | DocsContent;
            if (lesson.type === "video") {
                // Ưu tiên dùng URL từ upload nếu có, nếu không dùng URL nhập tay
                const finalUrl = uploadedVideoUrl || values.videoUrl;
                updatedContent = {
                    url: finalUrl,
                    duration: values.duration,
                } as VideoContent;
            } else if (lesson.type === "quiz") {
                updatedContent = {
                    questions,
                    passingScore: values.passingScore,
                } as QuizContent;
            } else {
                updatedContent = { content: values.docContent } as DocsContent;
            }
            onSave({ ...lesson, title: values.title, content: updatedContent });
            onCancel();
        });
    };

    // Xử lý upload video local
    // const handleVideoUpload: UploadProps["customRequest"] = async ({
    //     file,
    //     onSuccess,
    // }) => {
    //     const rcFile = file as RcFile;
    //     const url = URL.createObjectURL(rcFile);
    //     setUploadedVideoUrl(url);
    //     setUploadingVideo(true);
    //     // Tạo video element ẩn để lấy duration
    //     const video = document.createElement("video");
    //     video.preload = "metadata";
    //     video.onloadedmetadata = () => {
    //         const duration = Math.round(video.duration);
    //         form.setFieldsValue({ duration });
    //         URL.revokeObjectURL(url);
    //         setUploadingVideo(false);
    //         message.success(`Upload thành công, thời lượng: ${duration} giây`);
    //         if (onSuccess) onSuccess("ok");
    //     };
    //     video.onerror = () => {
    //         setUploadingVideo(false);
    //         message.error("Không thể đọc thông tin video");
    //         if (onSuccess) onSuccess("error");
    //     };
    //     video.src = url;
    // };

    const handleVideoUpload = async (info: any) => {
        // Lấy file từ object của Ant Design Upload
        const file = info.file as RcFile;
        if (!file) return;

        // 1. Lấy duration (giữ nguyên logic cũ của bạn)
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);
            form.setFieldsValue({ duration: Math.round(video.duration) });
        };
        video.src = URL.createObjectURL(file);

        // 2. Tiến hành Upload lên Server
        setUploadingVideo(true);
        try {
            const res = await courseService.uploadLessonVideo(file);

            // Giả sử API trả về { videoUrl: "http://...", videoKey: "..." }
            const realUrl = res.videoUrl;

            // Cập nhật state để hiển thị preview/tên file
            setUploadedVideoUrl(realUrl);

            // Quan trọng: Cập nhật giá trị vào form để khi nhấn 'Lưu' (onSave),
            // giá trị này sẽ được gửi về trang index.tsx
            form.setFieldsValue({ videoUrl: realUrl });

            message.success("Tải video lên thành công!");
        } catch (error) {
            console.error("Upload error:", error);
            message.error("Tải video thất bại, vui lòng thử lại.");
        } finally {
            setUploadingVideo(false);
        }
    };

    const uploadProps: UploadProps = {
        name: "video",
        accept: "video/*",
        showUploadList: false,
        customRequest: handleVideoUpload,
        beforeUpload: (file) => {
            const isLt200M = file.size / 1024 / 1024 < 200;
            if (!isLt200M) {
                message.error("Video phải nhỏ hơn 200MB!");
                return false;
            }
            return true;
        },
    };

    // Quiz preview
    const renderQuizPreview = () => {
        return (
            <div className="p-4 max-h-[500px] overflow-y-auto">
                <h3 className="text-lg font-bold mb-4">Xem trước bài Quiz</h3>
                {questions.length === 0 ? (
                    <Alert message="Chưa có câu hỏi nào" type="info" />
                ) : (
                    questions.map((q, idx) => (
                        <div key={q.id} className="mb-6 border-b pb-3">
                            <p className="font-medium">
                                {idx + 1}. {q.text}
                            </p>
                            <div className="ml-4 mt-2 space-y-1">
                                {q.options.map((opt, optIdx) => (
                                    <div key={optIdx}>
                                        <input
                                            type="radio"
                                            name={`q_${q.id}`}
                                            disabled
                                            className="mr-2"
                                        />
                                        <label>{opt}</label>
                                    </div>
                                ))}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                Điểm: {q.points}
                            </div>
                        </div>
                    ))
                )}
            </div>
        );
    };

    // Preview docs (Markdown)
    const renderDocsPreview = (content: string) => {
        if (!content) return <Alert message="Chưa có nội dung" type="info" />;
        return (
            <div className="prose max-w-none p-2 border rounded-md bg-gray-50 min-h-[200px]">
                <ReactMarkdown>{content}</ReactMarkdown>
            </div>
        );
    };

    if (!lesson) return null;

    return (
        <Modal
            title={`Chỉnh sửa bài ${lesson.type === "video" ? "Video" : lesson.type === "quiz" ? "Quiz" : "Tài liệu"}`}
            open={open}
            onCancel={onCancel}
            onOk={handleSave}
            width={800}
            okText="Lưu"
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="title"
                    label="Tiêu đề bài học"
                    rules={[{ required: true }]}
                >
                    <Input />
                </Form.Item>

                {lesson.type === "video" && (
                    <>
                        <Form.Item
                            name="videoUrl"
                            label="URL Video (YouTube, Vimeo hoặc đường dẫn)"
                        >
                            <Input placeholder="https://www.youtube.com/watch?v=..." />
                        </Form.Item>
                        <Divider>Hoặc tải lên từ máy tính</Divider>
                        <Form.Item label="Upload video local">
                            <Upload
                                accept="video/*"
                                showUploadList={false}
                                beforeUpload={() => false} // Chặn không cho tự động upload theo kiểu mặc định
                                onChange={handleVideoUpload} // Dùng hàm handle chúng ta vừa sửa
                            >
                                <Button
                                    icon={<UploadOutlined />}
                                    loading={uploadingVideo} // Hiện loading khi đang upload
                                    disabled={uploadingVideo}
                                >
                                    {uploadedVideoUrl
                                        ? "Thay đổi Video"
                                        : "Chọn Video"}
                                </Button>
                            </Upload>
                            {uploadedVideoUrl && (
                                <div className="mt-2">
                                    <video
                                        src={uploadedVideoUrl}
                                        controls
                                        className="max-w-full max-h-48 rounded"
                                    />
                                </div>
                            )}
                        </Form.Item>
                        <Form.Item name="duration" label="Thời lượng (giây)">
                            <InputNumber min={0} className="w-full" />
                        </Form.Item>
                    </>
                )}

                {lesson.type === "quiz" && (
                    <>
                        <Form.Item
                            name="passingScore"
                            label="Điểm đạt (%)"
                            initialValue={70}
                        >
                            <InputNumber min={0} max={100} className="w-full" />
                        </Form.Item>
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">
                                    Danh sách câu hỏi
                                </span>
                                <Space>
                                    <Button
                                        icon={<EyeOutlined />}
                                        onClick={() =>
                                            setPreviewQuizVisible(true)
                                        }
                                    >
                                        Xem trước quiz
                                    </Button>
                                    <Button
                                        type="primary"
                                        size="small"
                                        icon={<PlusOutlined />}
                                        onClick={() => {
                                            setEditingQuestion(null);
                                            questionForm.resetFields();
                                            setQuestionModalVisible(true);
                                        }}
                                    >
                                        Thêm câu hỏi
                                    </Button>
                                </Space>
                            </div>
                            <Table
                                dataSource={questions}
                                columns={[
                                    { title: "Câu hỏi", dataIndex: "text" },
                                    {
                                        title: "Điểm",
                                        dataIndex: "points",
                                        width: 80,
                                    },
                                    {
                                        title: "Hành động",
                                        width: 100,
                                        render: (
                                            _: any,
                                            record: QuizQuestion,
                                        ) => (
                                            <Space>
                                                <Button
                                                    icon={<EditOutlined />}
                                                    size="small"
                                                    onClick={() => {
                                                        setEditingQuestion(
                                                            record,
                                                        );
                                                        questionForm.setFieldsValue(
                                                            {
                                                                text: record.text,
                                                                options:
                                                                    record.options.join(
                                                                        ", ",
                                                                    ),
                                                                correctAnswer:
                                                                    record.correctAnswer,
                                                                points: record.points,
                                                            },
                                                        );
                                                        setQuestionModalVisible(
                                                            true,
                                                        );
                                                    }}
                                                />
                                                <Popconfirm
                                                    title="Xóa câu hỏi?"
                                                    onConfirm={() =>
                                                        setQuestions(
                                                            questions.filter(
                                                                (q) =>
                                                                    q.id !==
                                                                    record.id,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    <Button
                                                        danger
                                                        icon={
                                                            <DeleteOutlined />
                                                        }
                                                        size="small"
                                                    />
                                                </Popconfirm>
                                            </Space>
                                        ),
                                    },
                                ]}
                                rowKey="id"
                                pagination={false}
                                size="small"
                            />
                        </div>
                    </>
                )}

                {lesson.type === "docs" && (
                    <Form.Item
                        name="docContent"
                        label="Nội dung tài liệu (Markdown)"
                        rules={[{ required: true }]}
                    >
                        <Tabs defaultActiveKey="edit">
                            <TabPane tab="Soạn thảo" key="edit">
                                <TextArea
                                    rows={10}
                                    placeholder="Nhập nội dung Markdown"
                                />
                            </TabPane>
                            <TabPane tab="Xem trước" key="preview">
                                {form.getFieldValue("docContent") ? (
                                    renderDocsPreview(
                                        form.getFieldValue("docContent"),
                                    )
                                ) : (
                                    <Alert
                                        message="Chưa có nội dung"
                                        type="info"
                                    />
                                )}
                            </TabPane>
                        </Tabs>
                    </Form.Item>
                )}
            </Form>

            {/* Modal quản lý câu hỏi (thêm/sửa) */}
            <Modal
                title={editingQuestion ? "Sửa câu hỏi" : "Thêm câu hỏi"}
                open={questionModalVisible}
                onCancel={() => {
                    setQuestionModalVisible(false);
                    setEditingQuestion(null);
                    questionForm.resetFields();
                }}
                onOk={() => questionForm.submit()}
                okText="Lưu"
                cancelText="Hủy"
            >
                <Form
                    form={questionForm}
                    layout="vertical"
                    onFinish={(values) => {
                        const newQuestion: QuizQuestion = {
                            id: editingQuestion
                                ? editingQuestion.id
                                : Date.now().toString(),
                            text: values.text,
                            options: values.options
                                .split(",")
                                .map((opt: string) => opt.trim()),
                            correctAnswer: values.correctAnswer,
                            points: values.points,
                        };
                        let updatedQuestions;
                        if (editingQuestion) {
                            updatedQuestions = questions.map((q) =>
                                q.id === editingQuestion.id ? newQuestion : q,
                            );
                            message.success("Cập nhật câu hỏi thành công");
                        } else {
                            updatedQuestions = [...questions, newQuestion];
                            message.success("Thêm câu hỏi thành công");
                        }
                        setQuestions(updatedQuestions);
                        setQuestionModalVisible(false);
                        setEditingQuestion(null);
                        questionForm.resetFields();
                    }}
                >
                    <Form.Item
                        name="text"
                        label="Nội dung câu hỏi"
                        rules={[{ required: true }]}
                    >
                        <TextArea rows={2} />
                    </Form.Item>
                    <Form.Item
                        name="options"
                        label="Các lựa chọn (cách nhau bằng dấu phẩy)"
                        rules={[{ required: true }]}
                    >
                        <Input placeholder="Đáp án A, Đáp án B, Đáp án C, Đáp án D" />
                    </Form.Item>
                    <Form.Item
                        name="correctAnswer"
                        label="Đáp án đúng"
                        rules={[{ required: true }]}
                    >
                        <Input placeholder="Nhập chính xác nội dung đáp án đúng" />
                    </Form.Item>
                    <Form.Item
                        name="points"
                        label="Điểm"
                        initialValue={1}
                        rules={[{ required: true }]}
                    >
                        <InputNumber min={0.5} step={0.5} className="w-full" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal preview quiz */}
            <Modal
                title="Xem trước bài Quiz"
                open={previewQuizVisible}
                onCancel={() => setPreviewQuizVisible(false)}
                footer={null}
                width={700}
            >
                {renderQuizPreview()}
            </Modal>
        </Modal>
    );
};

export default LessonContentModal;
