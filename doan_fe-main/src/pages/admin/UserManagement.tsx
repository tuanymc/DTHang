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
    Avatar,
    Row,
    Col,
    Card,
    Typography,
    Tooltip,
    Switch,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    ReloadOutlined,
    UserOutlined,
    LockOutlined,
    UnlockOutlined,
    TeamOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useAuthStore } from "../../store/useAuthStore";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

// Định nghĩa kiểu dữ liệu người dùng
type UserRole = "learner" | "instructor";
type UserStatus = "active" | "locked";

interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    status: UserStatus;
    avatar?: string;
    created_at: string;
}

const UserManagement: React.FC = () => {
    // const [users, setUsers] = useState<User[]>(initialUsers);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");

    const { users, getUsers, isLoading, roles, getRoles } = useAuthStore();

    useEffect(() => {
        const delay = setTimeout(() => {
            getUsers();
        }, 300); // debounce nhẹ

        return () => clearTimeout(delay);
    }, [searchText, roleFilter]);

    console.log("role list: ", roles);

    useEffect(() => {
        if (modalVisible) {
            getRoles();
        }
    }, [modalVisible]);

    // Thêm hoặc cập nhật người dùng
    const handleSaveUser = (values: any) => {
        const fullName = `${values.last_name} ${values.first_name}`.trim();
        if (editingUser) {
            // Cập nhật
            const updatedUsers = users.map((user) =>
                user.id === editingUser.id
                    ? {
                          ...user,
                          ...values,
                          first_name: values.first_name,
                          last_name: values.last_name,
                      }
                    : user,
            );
            // simulateLoading(() => {
            //   // setUsers(updatedUsers);
            //   message.success('Cập nhật người dùng thành công!');
            //   setModalVisible(false);
            //   form.resetFields();
            //   setEditingUser(null);
            // });
        } else {
            // Thêm mới
            const newUser: User = {
                id: Date.now().toString(),
                email: values.email,
                first_name: values.first_name,
                last_name: values.last_name,
                role: values.role ?? "learner",
                status: "active",
                avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? "men" : "women"}/${Math.floor(Math.random() * 50)}.jpg`,
                created_at: new Date().toISOString(),
            };
            // simulateLoading(() => {
            //   // setUsers([newUser, ...users]);
            //   message.success('Thêm người dùng thành công!');
            //   setModalVisible(false);
            //   form.resetFields();
            // });
        }
    };

    // Xóa người dùng
    const handleDeleteUser = (id: string) => {
        // simulateLoading(() => {
        //   // setUsers(users.filter((user) => user.id !== id));
        //   message.success('Xóa người dùng thành công!');
        // });
    };

    // Khóa/Mở khóa tài khoản
    const handleToggleLock = (user: User) => {
        const newStatus = user.status === "active" ? "locked" : "active";
        const updatedUsers = users.map((u) =>
            u.id === user.id ? { ...u, status: newStatus } : u,
        );
        // simulateLoading(() => {
        //   // setUsers(updatedUsers);
        //   message.success(
        //     newStatus === 'locked'
        //       ? `Đã khóa tài khoản ${user.email}`
        //       : `Đã mở khóa tài khoản ${user.email}`
        //   );
        // });
    };

    // Cập nhật role
    const handleUpdateRole = (userId: string, newRole: UserRole) => {
        const updatedUsers = users.map((user) =>
            user.id === userId ? { ...user, role: newRole } : user,
        );
        // simulateLoading(() => {
        //   // setUsers(updatedUsers);
        //   message.success(`Đã cập nhật vai trò thành ${newRole === 'instructor' ? 'Giảng viên' : 'Học viên'}`);
        // });
    };

    // Mở modal thêm mới
    const showAddModal = () => {
        setEditingUser(null);
        form.resetFields();
        setModalVisible(true);
    };

    // Mở modal sửa
    const showEditModal = (user: User) => {
        setEditingUser(user);
        form.setFieldsValue({
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
        });
        setModalVisible(true);
    };

    // Định nghĩa cột cho bảng
    const columns: ColumnsType<User> = [
        {
            title: "Người dùng",
            key: "fullName",
            width: 220,
            render: (_, record) => (
                <Space>
                    <Avatar src={record.avatar} icon={<UserOutlined />} />
                    <div>
                        <div className="font-medium">
                            {record.first_name} {record.last_name}
                        </div>
                        <div className="text-xs text-gray-500">
                            {record.email}
                        </div>
                    </div>
                </Space>
            ),
        },
        {
            title: "Vai trò",
            dataIndex: "role",
            key: "role",
            width: 150,
            render: (role: UserRole, record) => (
                <Select
                    value={role}
                    onChange={(value) => handleUpdateRole(record.id, value)}
                    style={{ width: 120 }}
                    size="small"
                    className="rounded-md"
                >
                    <Option value="learner">Học viên</Option>
                    <Option value="instructor">Giảng viên</Option>
                </Select>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 120,
            render: (status: UserStatus) => (
                <Tag color={status === "active" ? "green" : "red"}>
                    {status === "active" ? "Hoạt động" : "Đã khóa"}
                </Tag>
            ),
        },
        {
            title: "Ngày tạo",
            dataIndex: "created_at",
            key: "created_at",
            width: 120,
            sorter: (a, b) =>
                String(a.created_at).localeCompare(String(b.created_at)),
            render: (_, record) =>
                dayjs(record.created_at).format("DD/MM/YYYY HH:mm"),
        },
        {
            title: "Hành động",
            key: "action",
            width: 180,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Chỉnh sửa thông tin">
                        <Button
                            type="primary"
                            ghost
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => showEditModal(record)}
                        />
                    </Tooltip>
                    <Tooltip
                        title={
                            record.status === "active"
                                ? "Khóa tài khoản"
                                : "Mở khóa tài khoản"
                        }
                    >
                        <Button
                            size="small"
                            icon={
                                record.status === "active" ? (
                                    <LockOutlined />
                                ) : (
                                    <UnlockOutlined />
                                )
                            }
                            onClick={() => handleToggleLock(record)}
                            danger={record.status === "active"}
                            style={
                                record.status === "locked"
                                    ? {
                                          color: "#52c41a",
                                          borderColor: "#52c41a",
                                      }
                                    : {}
                            }
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa người dùng"
                        description="Hành động này không thể hoàn tác. Bạn có chắc?"
                        onConfirm={() => handleDeleteUser(record.id)}
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
                        <TeamOutlined className="text-2xl text-blue-600" />
                        <Title level={3} className="!mb-0">
                            Quản lý người dùng
                        </Title>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={showAddModal}
                        size="large"
                        className="shadow-sm"
                    >
                        Thêm người dùng
                    </Button>
                </div>

                {/* Bộ lọc và tìm kiếm */}
                <Row gutter={[16, 16]} className="mb-6">
                    <Col xs={24} md={12} lg={8}>
                        <Input
                            placeholder="Tìm kiếm theo tên hoặc email"
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
                    <Col xs={24} md={12} lg={6}>
                        <Select
                            placeholder="Lọc theo vai trò"
                            value={roleFilter}
                            onChange={setRoleFilter}
                            size="large"
                            className="w-full rounded-lg"
                        >
                            <Option value="all">Tất cả vai trò</Option>
                            <Option value="learner">Học viên</Option>
                            <Option value="instructor">Giảng viên</Option>
                        </Select>
                    </Col>
                    <Col xs={24} md={0} lg={10} />
                    <Col xs={24} md={12} lg={6} className="flex justify-end">
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => {
                                setSearchText("");
                                setRoleFilter("all");
                            }}
                            size="large"
                        >
                            Đặt lại
                        </Button>
                    </Col>
                </Row>

                {/* Bảng danh sách người dùng */}
                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{
                        pageSize: 8,
                        showSizeChanger: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} trên ${total} người dùng`,
                    }}
                    className="border rounded-xl overflow-hidden"
                    scroll={{ x: 800 }}
                />
            </Card>

            {/* Modal Thêm/Sửa người dùng */}
            <Modal
                title={
                    editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"
                }
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    setEditingUser(null);
                    form.resetFields();
                }}
                footer={null}
                width={550}
                className="rounded-2xl"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSaveUser}
                    className="mt-4"
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="last_name"
                                label="Họ"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập họ!",
                                    },
                                ]}
                            >
                                <Input size="large" placeholder="Nguyễn" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="first_name"
                                label="Tên"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập tên!",
                                    },
                                ]}
                            >
                                <Input size="large" placeholder="Văn A" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: "Vui lòng nhập email!" },
                            { type: "email", message: "Email không hợp lệ!" },
                        ]}
                    >
                        <Input size="large" placeholder="user@example.com" />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        label="Vai trò"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn vai trò!",
                            },
                        ]}
                    >
                        <Select size="large">
                            {roles?.map((r: any) => (
                                <Option key={r.id} value={r.id}>
                                    {r.role_name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {!editingUser && (
                        <Form.Item
                            name="password"
                            label="Mật khẩu tạm thời"
                            rules={[
                                {
                                    required: !editingUser,
                                    message: "Vui lòng nhập mật khẩu!",
                                },
                            ]}
                        >
                            <Input.Password
                                size="large"
                                placeholder="Mật khẩu mặc định"
                            />
                        </Form.Item>
                    )}

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
                            loading={isLoading}
                        >
                            {editingUser ? "Cập nhật" : "Thêm mới"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement;
