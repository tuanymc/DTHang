import React, { useEffect, useState } from "react";
import {
    Table,
    Button,
    Input,
    Space,
    Modal,
    Form,
    Select,
    message,
    Popconfirm,
    Tag,
    Card,
    Typography,
    Tooltip,
    Row,
    Col,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    ReloadOutlined,
    ApartmentOutlined,
    BookOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { majorService } from "../../services/major.service";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

// Định nghĩa kiểu dữ liệu cho Khoa
interface Faculty {
    id: string;
    name: string;
    code: string;
}

// Định nghĩa kiểu dữ liệu cho Chuyên ngành
interface Major {
    id: string;
    code: string;
    name: string;
    facultyId: string;
    description: string;
    status: "active" | "inactive";
    createdAt: string;
}

// Mock data cho Khoa
const initialFaculties: Faculty[] = [
    { id: "fac1", name: "Công nghệ thông tin", code: "CNTT" },
];

const MajorManagement: React.FC = () => {
    const [majors, setMajors] = useState<Major[]>([]);
    const [faculties] = useState<Faculty[]>(initialFaculties);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingMajor, setEditingMajor] = useState<Major | null>(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState("");
    const [facultyFilter, setFacultyFilter] = useState<string>("all");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    const loadMajors = async () => {
        try {
            setLoading(true);

            const res = await majorService.getMajors({
                search: searchText,
                page,
                pageSize,
            });

            setMajors(
                (res.result.data || []).map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    createdAt: item.created_at,
                })),
            );

            setTotal(res.pagination?.total || 0);
        } catch (err) {
            message.error("Lỗi load majors");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMajors();
    }, [searchText, page, pageSize]);

    // Giả lập loading
    const simulateLoading = (fn: () => void) => {
        setLoading(true);
        setTimeout(() => {
            fn();
            setLoading(false);
        }, 500);
    };

    // Thêm hoặc cập nhật chuyên ngành
    const handleSaveMajor = async (values: any) => {
        if (editingMajor) {
            // Cập nhật
            await majorService.updateMajor({
                id: editingMajor.id,
                ...values,
            });
            message.success("Cập nhật chuyên ngành thành công!");
        } else {
            // Thêm mới
            await majorService.createMajor(values);

            message.success("Thêm chuyên ngành thành công!");
        }

        setModalVisible(false);
        form.resetFields();
        setEditingMajor(null);

        await loadMajors();
    };

    const handleDeleteMajor = async (id: string) => {
    try {
        setLoading(true);
        console.log(id);

        await majorService.deleteMajor({id});

        message.success("Xóa chuyên ngành thành công!");

        await loadMajors();
    } catch (error) {
        message.error("Xóa thất bại!");
    } finally {
        setLoading(false);
    }
};

    // Mở modal thêm mới
    const showAddModal = () => {
        setEditingMajor(null);
        form.resetFields();
        setModalVisible(true);
    };

    // Mở modal sửa
    const showEditModal = (major: Major) => {
        setEditingMajor(major);
        form.setFieldsValue({
            code: major.code,
            name: major.name,
            facultyId: major.facultyId,
            description: major.description,
            status: major.status,
        });
        setModalVisible(true);
    };

    // Lọc và tìm kiếm
    // const filteredMajors = majors.filter((major) => {
    //     const matchSearch =
    //         major.name.toLowerCase().includes(searchText.toLowerCase()) ||
    //         getFacultyName(major.facultyId)
    //             .toLowerCase()
    //             .includes(searchText.toLowerCase());
    //     const matchFaculty =
    //         facultyFilter === "all" || major.facultyId === facultyFilter;
    //     return matchSearch && matchFaculty;
    // });

    // Định nghĩa cột cho bảng
    const columns: ColumnsType<Major> = [
        {
            title: "Thứ tự",
            key: "index",
            width: 80,
            render: (_, __, index) => index + 1,
        },
        {
            title: "Tên chuyên ngành",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: "Trực thuộc khoa",
            key: "faculty",
            // width: 180,
            render: (_, record) => (
                <Space>
                    <ApartmentOutlined className="text-gray-400" />
                    <span>Công nghệ thông tin</span>
                </Space>
            ),
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            // width: 120,
            render: (value: string) => dayjs(value).format("DD/MM/YYYY HH:mm"),
            sorter: (a, b) =>
                dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
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
                        title="Xóa chuyên ngành"
                        description={`Bạn có chắc muốn xóa chuyên ngành "${record.name}"?`}
                        onConfirm={() => handleDeleteMajor(record.id)}
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
                            Quản lý chuyên ngành
                        </Title>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={showAddModal}
                        size="large"
                        className="shadow-sm"
                    >
                        Thêm chuyên ngành
                    </Button>
                </div>

                {/* Bộ lọc và tìm kiếm */}
                <Row gutter={[16, 16]} className="mb-6">
                    <Col xs={24} md={12} lg={8}>
                        <Input
                            placeholder="Tìm kiếm theo mã, tên chuyên ngành hoặc khoa"
                            prefix={
                                <SearchOutlined className="text-gray-400" />
                            }
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                            size="large"
                            className="rounded-lg"
                        />
                    </Col>

                    <Col xs={24} md={12} lg={6} className="flex justify-end">
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => {
                                setSearchText("");
                                setFacultyFilter("all");
                            }}
                            size="large"
                        >
                            Đặt lại
                        </Button>
                    </Col>
                </Row>

                {/* Bảng danh sách chuyên ngành */}
                <Table
                    columns={columns}
                    dataSource={majors}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 6,
                        showSizeChanger: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} trên ${total} chuyên ngành`,
                    }}
                    className="border rounded-xl overflow-hidden"
                    scroll={{ x: 900 }}
                />
            </Card>

            {/* Modal Thêm/Sửa chuyên ngành */}
            <Modal
                title={
                    editingMajor
                        ? "Chỉnh sửa chuyên ngành"
                        : "Thêm chuyên ngành mới"
                }
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    setEditingMajor(null);
                    form.resetFields();
                }}
                footer={null}
                width={550}
                className="rounded-2xl"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSaveMajor}
                    className="mt-4"
                >
                    <Form.Item
                        name="name"
                        label="Tên chuyên ngành"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập tên chuyên ngành!",
                            },
                        ]}
                    >
                        <Input
                            size="large"
                            placeholder="VD: Khoa học máy tính"
                        />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[
                            { required: true, message: "Vui lòng nhập mô tả!" },
                        ]}
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder="Mô tả nội dung chuyên ngành..."
                        />
                    </Form.Item>

                    {/* <Form.Item
                        name="status"
                        label="Trạng thái"
                        rules={[{ required: true }]}
                        initialValue="active"
                    >
                        <Select size="large">
                            <Option value="active">Đang hoạt động</Option>
                            <Option value="inactive">Tạm dừng</Option>
                        </Select>
                    </Form.Item> */}

                    <Form.Item className="flex justify-end gap-2 mb-0">
                        <Button
                            onClick={() => setModalVisible(false)}
                            size="large"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={loading}
                        >
                            {editingMajor ? "Cập nhật" : "Thêm mới"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default MajorManagement;
