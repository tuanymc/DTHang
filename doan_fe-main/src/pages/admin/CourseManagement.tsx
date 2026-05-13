import React, { useEffect, useState } from "react";
import {
    Card,
    Table,
    Button,
    Input,
    Select,
    Form,
    Modal,
    message,
    Tag,
    Space,
    Typography,
    Row,
    Col,
    Tooltip,
    Popconfirm,
    Image,
    Upload,
    Checkbox,
    Divider,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    ReloadOutlined,
    BookOutlined,
    UserOutlined,
    ClockCircleOutlined,
    UploadOutlined,
    PictureOutlined,
} from "@ant-design/icons";
import ReactQuillNew from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { useMajorStore } from "../../store/useMajorStore";
import { useCategoryStore } from "../../store/useCategoryStore";
import { toast } from "sonner";
import { useCourseStore } from "../../store/useCourseStore";

const { Title, Text } = Typography;
const { Option } = Select;

// ======================== MOCK DỮ LIỆU ========================
// Danh sách người dùng (giảng viên)
const mockUsers = [
    { id: "user_1", name: "Nguyễn Văn A" },
    { id: "user_2", name: "Trần Thị B" },
    { id: "user_3", name: "Lê Văn C" },
    { id: "user_4", name: "Phạm Thị D" },
];

// Danh mục khóa học (categories)
const mockCategories: { id: string; name: string }[] = [
    { id: "cat_1", name: "Lập trình" },
    { id: "cat_2", name: "Data Science" },
    { id: "cat_3", name: "Thiết kế" },
    { id: "cat_4", name: "Marketing" },
    { id: "cat_5", name: "Ngoại ngữ" },
];

// Chuyên ngành (majors)
const mockMajors: { id: string; name: string }[] = [
    { id: "major_1", name: "Công nghệ thông tin" },
    { id: "major_2", name: "Khoa học máy tính" },
    { id: "major_3", name: "Hệ thống thông tin" },
    { id: "major_4", name: "Kinh tế" },
    { id: "major_5", name: "Quản trị kinh doanh" },
];

// Kiểu dữ liệu khóa học theo DB mới
interface Course {
    id: string;
    title: string;
    slug?: string;
    description: string; // HTML content
    thumbnail_url: string;
    instructor_id: string;
    instructor?: {
        first_name?: string;
        last_name?: string;
    };
    instructor_name?: string;
    level: "beginner" | "intermediate" | "advanced";
    duration: number;
    status: "draft" | "published";
    categories: Array<string | { id: string; name: string }>;
    majors: Array<string | { id: string; name: string }>;
    applyToAllFaculty: boolean;
    created_at: string;
    updated_at: string;
}

// Mock data ban đầu (chuyển đổi từ dữ liệu cũ)
const initialCourses: Course[] = [
    {
        id: "1",
        title: "Lập trình React cơ bản",
        description: "<p>Khóa học React từ A-Z, xây dựng ứng dụng thực tế</p>",
        thumbnail_url: "https://picsum.photos/id/0/100/80",
        instructor_id: "user_1",
        level: "beginner",
        duration: 40,
        status: "published",
        categories: ["cat_1"],
        majors: ["major_1", "major_2"],
        applyToAllFaculty: false,
        created_at: "2024-01-10",
        updated_at: "2024-01-10",
    },
    {
        id: "2",
        title: "Python cho Data Science",
        description: "<p>Phân tích dữ liệu với Pandas, NumPy, Matplotlib</p>",
        thumbnail_url: "https://picsum.photos/id/1/100/80",
        instructor_id: "user_2",
        level: "intermediate",
        duration: 50,
        status: "published",
        categories: ["cat_2"],
        majors: ["major_1", "major_3"],
        applyToAllFaculty: false,
        created_at: "2024-02-15",
        updated_at: "2024-02-15",
    },
    {
        id: "3",
        title: "UI/UX Design căn bản",
        description:
            "<p>Nguyên lý thiết kế giao diện và trải nghiệm người dùng</p>",
        thumbnail_url: "https://picsum.photos/id/10/100/80",
        instructor_id: "user_3",
        level: "beginner",
        duration: 30,
        status: "draft",
        categories: ["cat_3"],
        majors: [],
        applyToAllFaculty: true,
        created_at: "2024-01-20",
        updated_at: "2024-01-20",
    },
    {
        id: "4",
        title: "Node.js & Express",
        description: "<p>Xây dựng REST API với Node.js và MongoDB</p>",
        thumbnail_url: "https://picsum.photos/id/20/100/80",
        instructor_id: "user_4",
        level: "intermediate",
        duration: 45,
        status: "published",
        categories: ["cat_1"],
        majors: ["major_1", "major_2", "major_3"],
        applyToAllFaculty: false,
        created_at: "2024-03-01",
        updated_at: "2024-03-01",
    },
];

// Helper lấy tên category theo id
const getCategoryName = (id: string) =>
    mockCategories.find((c) => c.id === id)?.name || id;
// Helper lấy tên major theo id
const getMajorName = (id: string) =>
    mockMajors.find((m) => m.id === id)?.name || id;

// ======================== COMPONENT CHÍNH ========================
const CourseManagement: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [levelFilter, setLevelFilter] = useState<string>("all");

    const { allMajors, getAllMajor } = useMajorStore();
    const { allCategories, getAllCategory } = useCategoryStore();
    const { courses, getCourses, isLoading, createCourse, updateCourse } =
        useCourseStore();

    // State cho upload ảnh
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string>("");

    useEffect(() => {
        if (modalVisible) {
            getAllMajor();
            getAllCategory();
        }
    }, [modalVisible]);

    useEffect(() => {
        getCourses();
    }, []);

    // Mock upload ảnh
    const handleThumbnailChange = (info: any) => {
        const file = info.file.originFileObj; // 🔥 QUAN TRỌNG

        if (file) {
            setThumbnailFile(file); // ✅ File thật
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const customUpload = ({ file, onSuccess }: any) => {
        // Giả lập upload thành công, trả về url ảnh (object URL tạm thời)
        setTimeout(() => {
            const url = URL.createObjectURL(file);
            onSuccess({ url }, file);
        }, 500);
    };

    // Reset modal & form
    const resetModal = () => {
        setEditingCourse(null);
        setThumbnailFile(null);
        setThumbnailPreview("");
        form.resetFields();
        setModalVisible(false);
    };

    // Mở modal thêm mới
    const showAddModal = () => {
        resetModal();
        form.setFieldsValue({
            status: "draft",
            level: "beginner",
            categories: [],
            majors: [],
            applyToAllFaculty: false,
            duration: 1,
        });
        setModalVisible(true);
    };

    // Mở modal sửa
    const showEditModal = (course: Course) => {
        setEditingCourse(course);
        setThumbnailPreview('http://' + course.thumbnail_url);
        form.setFieldsValue({
            title: course.title,
            description: course.description,
            instructor_id: course.instructor_id,
            level: course.level,
            duration: course.duration,
            status: course.status,
            categories: course.categories,
            majors: course.majors,
            applyToAllFaculty: course.applyToAllFaculty,
        });
        setModalVisible(true);
    };

    // Xóa khóa học
    const handleDeleteCourse = (id: string) => {
        simulateLoading(() => {
            message.success("Xóa khóa học thành công!");
        });
    };

    // Giả lập loading
    const simulateLoading = (fn: () => void) => {
        setLoading(true);
        setTimeout(() => {
            fn();
            setLoading(false);
        }, 500);
    };

    // Lưu (thêm mới hoặc cập nhật)
    const handleSaveCourse = async (values: any) => {
        const finalMajors = values.applyToAllFaculty
            ? (allMajors || []).map((m: any) => m.id)
            : values.majors || [];

        // Kiểm tra thumbnail
        if (!thumbnailFile && !editingCourse) {
            message.warning("Vui lòng tải lên ảnh đại diện cho khóa học");
            return;
        }

        const finalThumbnail =
            thumbnailPreview || editingCourse?.thumbnail_url || "";

        const payload = {
            title: values.title,
            description: values.description,
            level: values.level,
            status: values.status,
            duration: Number(values.duration) || 0,

            category_ids: values.categories || [],
            major_ids: finalMajors,
            applyToAllFaculty: values.applyToAllFaculty || false,

            thumbnailFile, // gửi file thật
        };

        console.log("🚀 FINAL PAYLOAD:", payload);

        const now = new Date().toISOString().split("T")[0];

        try {
            if (editingCourse) {
                await updateCourse({
                    ...payload,
                    id: editingCourse.id,
                });

                toast.success("Cập nhật khóa học thành công!");
            } else {
                await createCourse(payload);

                toast.success("Thêm khóa học thành công!");
            }

            resetModal();
        } catch (err) {
            toast.error("Có lỗi xảy ra!");
        }
    };

    // Lọc & tìm kiếm
    const filteredCourses = courses.filter((course) => {
        const matchSearch =
            course.title.toLowerCase().includes(searchText.toLowerCase()) ||
            course.instructor_name
                ?.toLowerCase()
                .includes(searchText.toLowerCase());
        const matchStatus =
            statusFilter === "all" || course.status === statusFilter;
        const matchLevel =
            levelFilter === "all" || course.level === levelFilter;
        return matchSearch && matchStatus && matchLevel;
    });

    // Định nghĩa cột cho bảng
    const columns: ColumnsType<Course> = [
        {
            title: "Tên khóa học",
            dataIndex: "title",
            key: "title",
            sorter: (a, b) => a.title.localeCompare(b.title),
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: "Giảng viên",
            dataIndex: "instructor_name",
            key: "instructor_id",
            render: (_, record) => {
                const nm =
                    [record.instructor?.first_name, record.instructor?.last_name]
                        .filter(Boolean)
                        .join(" ")
                        .trim()
                    || record.instructor_name
                    || "";
                return <span>{nm || record.instructor_id}</span>;
            },
        },
        {
            title: "Cấp độ",
            dataIndex: "level",
            key: "level",
            render: (level: string) => {
                const map: Record<string, { color: string; label: string }> = {
                    beginner: { color: "green", label: "Cơ bản" },
                    intermediate: { color: "blue", label: "Trung cấp" },
                    advanced: { color: "red", label: "Nâng cao" },
                };
                return <Tag color={map[level]?.color}>{map[level]?.label}</Tag>;
            },
        },
        {
            title: "Danh mục",
            dataIndex: "categories",
            key: "categories",
            render: (cats: Course["categories"]) => {
                if (!cats || cats.length === 0) {
                    return <Text type="secondary">—</Text>;
                }

                const tooltipContent = (
                    <div>
                        {cats.map((cat, i) =>
                            typeof cat === "string" ? (
                                <div key={`${cat}-${i}`}>{cat}</div>
                            ) : (
                                <div key={cat.id}>{cat.name}</div>
                            ),
                        )}
                    </div>
                );

                return (
                    <Tooltip title={tooltipContent}>
                        <Tag color="geekblue">{cats.length} danh mục</Tag>
                    </Tooltip>
                );
            },
        },
        {
            title: "Chuyên ngành",
            key: "majors",
            render: (_, record) => {
                if (record.applyToAllFaculty) {
                    return <Tag color="purple">Toàn bộ khoa</Tag>;
                }

                const majors = record.majors ?? [];
                if (!majors.length) {
                    return <Text type="secondary">—</Text>;
                }

                const tooltipContent = (
                    <div>
                        {majors.map((m, i) =>
                            typeof m === "string" ? (
                                <div key={`${m}-${i}`}>{m}</div>
                            ) : (
                                <div key={m.id}>{m.name}</div>
                            ),
                        )}
                    </div>
                );

                return (
                    <Tooltip title={tooltipContent}>
                        <Tag color="cyan">
                            {majors.length} chuyên ngành
                        </Tag>
                    </Tooltip>
                );
            },
        },
        {
            title: "Thời lượng",
            dataIndex: "duration",
            key: "duration",
            sorter: (a, b) => a.duration - b.duration,
            render: (duration: number) => (
                <Tag icon={<ClockCircleOutlined />} color="blue">
                    {duration} giờ
                </Tag>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            filters: [
                { text: "Xuất bản", value: "published" },
                { text: "Nháp", value: "draft" },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status: string) => (
                <Tag color={status === "published" ? "green" : "orange"}>
                    {status === "published" ? "Đã xuất bản" : "Bản nháp"}
                </Tag>
            ),
        },
        {
            title: "Hành động",
            key: "action",
            width: 120,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="primary"
                            ghost
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => showEditModal(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa khóa học"
                        description="Bạn có chắc chắn muốn xóa khóa học này?"
                        onConfirm={() => handleDeleteCourse(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button danger size="small" icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
            <Card className="shadow-md rounded-2xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div className="flex items-center gap-2">
                        <BookOutlined className="text-2xl text-blue-600" />
                        <Title level={3} className="!mb-0">
                            Quản lý khóa học
                        </Title>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={showAddModal}
                        size="large"
                        className="shadow-sm"
                    >
                        Thêm khóa học
                    </Button>
                </div>

                {/* Bộ lọc */}
                <Row gutter={[16, 16]} className="mb-6">
                    <Col xs={24} md={8} lg={6}>
                        <Input
                            placeholder="Tìm theo tên khóa học / giảng viên"
                            prefix={
                                <SearchOutlined className="text-gray-400" />
                            }
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                            size="large"
                        />
                    </Col>
                    <Col xs={24} md={5} lg={4}>
                        <Select
                            placeholder="Trạng thái"
                            value={statusFilter}
                            onChange={setStatusFilter}
                            size="large"
                            className="w-full"
                        >
                            <Option value="all">Tất cả</Option>
                            <Option value="published">Đã xuất bản</Option>
                            <Option value="draft">Bản nháp</Option>
                        </Select>
                    </Col>
                    <Col xs={24} md={5} lg={4}>
                        <Select
                            placeholder="Cấp độ"
                            value={levelFilter}
                            onChange={setLevelFilter}
                            size="large"
                            className="w-full"
                        >
                            <Option value="all">Tất cả cấp độ</Option>
                            <Option value="beginner">Cơ bản</Option>
                            <Option value="intermediate">Trung cấp</Option>
                            <Option value="advanced">Nâng cao</Option>
                        </Select>
                    </Col>
                    <Col xs={24} md={6} lg={4}>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => {
                                setSearchText("");
                                setStatusFilter("all");
                                setLevelFilter("all");
                            }}
                            size="large"
                        >
                            Đặt lại
                        </Button>
                    </Col>
                </Row>

                {/* Bảng danh sách */}
                <Table
                    columns={columns}
                    dataSource={courses}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{
                        pageSize: 6,
                        showSizeChanger: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} trên ${total} khóa học`,
                    }}
                    className="border rounded-xl overflow-hidden"
                    scroll={{ x: 1200 }}
                />
            </Card>

            {/* Modal Thêm/Sửa khóa học */}
            <Modal
                title={
                    editingCourse ? "Chỉnh sửa khóa học" : "Thêm khóa học mới"
                }
                open={modalVisible}
                onCancel={resetModal}
                footer={null}
                width={900}
                className="rounded-2xl"
                bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSaveCourse}
                    initialValues={{
                        level: "beginner",
                        status: "draft",
                        duration: 1,
                    }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="title"
                                label="Tên khóa học"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập tên khóa học!",
                                    },
                                ]}
                            >
                                <Input
                                    size="large"
                                    placeholder="VD: Lập trình React nâng cao"
                                />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="level"
                                label="Cấp độ khóa học"
                                rules={[{ required: true }]}
                            >
                                <Select size="large">
                                    <Option value="beginner">
                                        Cơ bản (Beginner)
                                    </Option>
                                    <Option value="intermediate">
                                        Trung cấp (Intermediate)
                                    </Option>
                                    <Option value="advanced">
                                        Nâng cao (Advanced)
                                    </Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Mô tả Rich Text */}
                    <Form.Item
                        name="description"
                        label="Mô tả khóa học"
                        rules={[
                            { required: true, message: "Vui lòng nhập mô tả!" },
                        ]}
                    >
                        <ReactQuillNew
                            theme="snow"
                            style={{ height: "200px", marginBottom: "48px" }}
                        />
                    </Form.Item>

                    {/* Upload ảnh */}
                    <Form.Item label="Ảnh đại diện" required={!editingCourse}>
                        <Upload
                            listType="picture-card"
                            showUploadList={false}
                            customRequest={customUpload}
                            onChange={handleThumbnailChange}
                            accept="image/*"
                        >
                            {thumbnailPreview ? (
                                <img
                                    src={thumbnailPreview}
                                    alt="thumbnail"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                    }}
                                />
                            ) : (
                                <div>
                                    <PictureOutlined />
                                    <div style={{ marginTop: 8 }}>Tải ảnh</div>
                                </div>
                            )}
                        </Upload>
                        {thumbnailPreview && (
                            <Button
                                type="link"
                                onClick={() => {
                                    setThumbnailPreview("");
                                    setThumbnailFile(null);
                                }}
                                danger
                                size="small"
                            >
                                Xóa ảnh
                            </Button>
                        )}
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="categories"
                                label="Danh mục (chọn nhiều)"
                            >
                                <Select
                                    mode="multiple"
                                    size="large"
                                    placeholder="Chọn danh mục"
                                >
                                    {allCategories?.map((cat: any) => (
                                        <Option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="status"
                                label="Trạng thái"
                                rules={[{ required: true }]}
                            >
                                <Select size="large">
                                    <Option value="draft">Bản nháp</Option>
                                    <Option value="published">Xuất bản</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Text strong>
                        Phạm vi áp dụng theo chuyên ngành
                    </Text>
                    <Divider />
                    <Form.Item name="applyToAllFaculty" valuePropName="checked">
                        <Checkbox
                            onChange={(e) => {
                                if (e.target.checked) {
                                    form.setFieldsValue({
                                        majors: allMajors.map((m: any) => m.id),
                                    });
                                } else {
                                    form.setFieldsValue({ majors: [] });
                                }
                            }}
                        >
                            Áp dụng cho toàn bộ khoa
                        </Checkbox>
                    </Form.Item>

                    <Form.Item
                        noStyle
                        shouldUpdate={(prev, curr) =>
                            prev.applyToAllFaculty !== curr.applyToAllFaculty
                        }
                    >
                        {({ getFieldValue }) => (
                            <Form.Item
                                name="majors"
                                label="Chọn chuyên ngành cụ thể"
                                rules={[
                                    {
                                        validator: (_, value) => {
                                            if (
                                                !getFieldValue(
                                                    "applyToAllFaculty",
                                                ) &&
                                                (!value || value.length === 0)
                                            ) {
                                                return Promise.reject(
                                                    new Error(
                                                        'Vui lòng chọn ít nhất một chuyên ngành hoặc chọn "Toàn bộ khoa"',
                                                    ),
                                                );
                                            }
                                            return Promise.resolve();
                                        },
                                    },
                                ]}
                            >
                                <Select
                                    mode="multiple"
                                    size="large"
                                    placeholder="Chọn chuyên ngành"
                                    disabled={getFieldValue(
                                        "applyToAllFaculty",
                                    )}
                                    options={allMajors?.map((m: any) => ({
                                        label: m.name,
                                        value: m.id,
                                    }))}
                                />
                            </Form.Item>
                        )}
                    </Form.Item>

                    <Form.Item className="flex justify-end gap-2 mb-0 mt-4">
                        <Button onClick={resetModal} size="large">
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={loading}
                        >
                            {editingCourse ? "Cập nhật" : "Thêm mới"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CourseManagement;
