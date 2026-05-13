import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Tag,
  Card,
  Typography,
  Tooltip,
  Checkbox,
  Row,
  Col,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SecurityScanOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

// Định nghĩa kiểu dữ liệu cho permission
interface Permission {
  module: string;
  actions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
}

// Định nghĩa kiểu dữ liệu Role
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  userCount?: number; // Số người dùng có role này (mock)
  createdAt: string;
}

// Các module có sẵn trong hệ thống
const modules = [
  { key: 'courses', label: 'Quản lý khóa học', icon: '📚' },
  { key: 'users', label: 'Quản lý người dùng', icon: '👥' },
  { key: 'roles', label: 'Quản lý vai trò', icon: '🔐' },
  { key: 'settings', label: 'Cài đặt hệ thống', icon: '⚙️' },
  { key: 'reports', label: 'Báo cáo thống kê', icon: '📊' },
];

// Khởi tạo permissions mặc định cho một role
const createDefaultPermissions = (): Permission[] => {
  return modules.map((module) => ({
    module: module.key,
    actions: {
      view: false,
      create: false,
      edit: false,
      delete: false,
    },
  }));
};

// Mock data ban đầu
const initialRoles: Role[] = [
  {
    id: '1',
    name: 'Admin',
    description: 'Quản trị viên hệ thống, có toàn quyền',
    permissions: modules.map((module) => ({
      module: module.key,
      actions: { view: true, create: true, edit: true, delete: true },
    })),
    userCount: 2,
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Giảng viên',
    description: 'Giảng viên có thể quản lý khóa học và xem báo cáo',
    permissions: modules.map((module) => {
      if (module.key === 'courses') {
        return { module: module.key, actions: { view: true, create: true, edit: true, delete: false } };
      }
      if (module.key === 'users') {
        return { module: module.key, actions: { view: true, create: false, edit: false, delete: false } };
      }
      if (module.key === 'reports') {
        return { module: module.key, actions: { view: true, create: false, edit: false, delete: false } };
      }
      return { module: module.key, actions: { view: false, create: false, edit: false, delete: false } };
    }),
    userCount: 5,
    createdAt: '2024-01-10',
  },
  {
    id: '3',
    name: 'Học viên',
    description: 'Học viên chỉ có thể xem khóa học đã đăng ký',
    permissions: modules.map((module) => {
      if (module.key === 'courses') {
        return { module: module.key, actions: { view: true, create: false, edit: false, delete: false } };
      }
      return { module: module.key, actions: { view: false, create: false, edit: false, delete: false } };
    }),
    userCount: 20,
    createdAt: '2024-01-15',
  },
];

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [currentPermissions, setCurrentPermissions] = useState<Permission[]>([]);
  const [selectedRoleForPermission, setSelectedRoleForPermission] = useState<Role | null>(null);
  const [form] = Form.useForm();

  // Giả lập loading
  const simulateLoading = (fn: () => void) => {
    setLoading(true);
    setTimeout(() => {
      fn();
      setLoading(false);
    }, 500);
  };

  // Thêm hoặc cập nhật role
  const handleSaveRole = (values: any) => {
    if (editingRole) {
      // Cập nhật thông tin cơ bản (không ảnh hưởng permissions)
      const updatedRoles = roles.map((role) =>
        role.id === editingRole.id
          ? { ...role, name: values.name, description: values.description }
          : role
      );
      simulateLoading(() => {
        setRoles(updatedRoles);
        message.success('Cập nhật vai trò thành công!');
        setModalVisible(false);
        form.resetFields();
        setEditingRole(null);
      });
    } else {
      // Thêm mới role với permissions mặc định
      const newRole: Role = {
        id: Date.now().toString(),
        name: values.name,
        description: values.description,
        permissions: createDefaultPermissions(),
        userCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      simulateLoading(() => {
        setRoles([...roles, newRole]);
        message.success('Thêm vai trò thành công!');
        setModalVisible(false);
        form.resetFields();
      });
    }
  };

  // Xóa role (chỉ khi userCount === 0)
  const handleDeleteRole = (role: Role) => {
    if (role.userCount && role.userCount > 0) {
      message.error(`Không thể xóa vai trò "${role.name}" vì đang có ${role.userCount} người dùng sử dụng.`);
      return;
    }
    simulateLoading(() => {
      setRoles(roles.filter((r) => r.id !== role.id));
      message.success(`Đã xóa vai trò "${role.name}"`);
    });
  };

  // Mở modal thêm/sửa role
  const showRoleModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      form.setFieldsValue({ name: role.name, description: role.description });
    } else {
      setEditingRole(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  // Mở modal phân quyền
  const openPermissionModal = (role: Role) => {
    setSelectedRoleForPermission(role);
    setCurrentPermissions(JSON.parse(JSON.stringify(role.permissions))); // deep copy
    setPermissionModalVisible(true);
  };

  // Cập nhật permission cho một module và action
  const updatePermission = (
    moduleKey: string,
    action: 'view' | 'create' | 'edit' | 'delete',
    checked: boolean
  ) => {
    setCurrentPermissions((prev) =>
      prev.map((perm) =>
        perm.module === moduleKey
          ? {
              ...perm,
              actions: { ...perm.actions, [action]: checked },
            }
          : perm
      )
    );
  };

  // Lưu permissions
  const savePermissions = () => {
    if (!selectedRoleForPermission) return;
    const updatedRoles = roles.map((role) =>
      role.id === selectedRoleForPermission.id
        ? { ...role, permissions: currentPermissions }
        : role
    );
    simulateLoading(() => {
      setRoles(updatedRoles);
      message.success(`Đã cập nhật phân quyền cho vai trò "${selectedRoleForPermission.name}"`);
      setPermissionModalVisible(false);
      setSelectedRoleForPermission(null);
    });
  };

  // Cột cho bảng roles
  const columns: ColumnsType<Role> = [
    {
      title: 'Tên vai trò',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text: string) => (
        <Space>
          <KeyOutlined className="text-blue-500" />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Số người dùng',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 120,
      render: (count: number) => <Tag color="blue">{count} người</Tag>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Phân quyền chi tiết">
            <Button
              icon={<SecurityScanOutlined />}
              onClick={() => openPermissionModal(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa thông tin">
            <Button
              type="primary"
              ghost
              icon={<EditOutlined />}
              onClick={() => showRoleModal(record)}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="Xóa vai trò"
            description={`Bạn có chắc muốn xóa vai trò "${record.name}"?`}
            onConfirm={() => handleDeleteRole(record)}
            okText="Xóa"
            cancelText="Hủy"
            disabled={record.userCount ? record.userCount > 0 : false}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              disabled={record.userCount ? record.userCount > 0 : false}
            />
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
            <SecurityScanOutlined className="text-2xl text-blue-600" />
            <Title level={3} className="!mb-0">
              Quản lý vai trò & phân quyền
            </Title>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showRoleModal()}
            size="large"
            className="shadow-sm"
          >
            Thêm vai trò
          </Button>
        </div>

        {/* Bảng danh sách roles */}
        <Table
          columns={columns}
          dataSource={roles}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5, showTotal: (total) => `Tổng ${total} vai trò` }}
          className="border rounded-xl overflow-hidden"
        />
      </Card>

      {/* Modal Thêm/Sửa Role */}
      <Modal
        title={editingRole ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingRole(null);
          form.resetFields();
        }}
        footer={null}
        width={500}
        className="rounded-2xl"
      >
        <Form form={form} layout="vertical" onFinish={handleSaveRole} className="mt-4">
          <Form.Item
            name="name"
            label="Tên vai trò"
            rules={[
              { required: true, message: 'Vui lòng nhập tên vai trò!' },
              { max: 50, message: 'Tối đa 50 ký tự' },
            ]}
          >
            <Input size="large" placeholder="VD: Content Manager" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}>
            <Input.TextArea rows={3} placeholder="Mô tả quyền hạn của vai trò này" />
          </Form.Item>
          <Form.Item className="flex justify-end gap-2 mb-0">
            <Button onClick={() => setModalVisible(false)} size="large">
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" size="large" loading={loading}>
              {editingRole ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Phân quyền chi tiết */}
      <Modal
        title={`Phân quyền cho vai trò: ${selectedRoleForPermission?.name}`}
        open={permissionModalVisible}
        onCancel={() => setPermissionModalVisible(false)}
        width={800}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setPermissionModalVisible(false)}>Hủy</Button>
            <Button type="primary" onClick={savePermissions} loading={loading}>
              Lưu phân quyền
            </Button>
          </div>
        }
        className="rounded-2xl"
      >
        <div className="py-2">
          <Text type="secondary" className="block mb-4">
            Thiết lập quyền truy cập cho từng module và hành động tương ứng.
          </Text>
          <div className="space-y-6">
            {modules.map((module) => {
              const perm = currentPermissions.find((p) => p.module === module.key);
              if (!perm) return null;
              const { view, create, edit, delete: del } = perm.actions;
              return (
                <Card key={module.key} size="small" title={<span className="text-base">{module.icon} {module.label}</span>} className="shadow-sm">
                  <Row gutter={[24, 12]}>
                    <Col xs={12} sm={6}>
                      <Checkbox
                        checked={view}
                        onChange={(e) => updatePermission(module.key, 'view', e.target.checked)}
                      >
                        Xem
                      </Checkbox>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Checkbox
                        checked={create}
                        onChange={(e) => updatePermission(module.key, 'create', e.target.checked)}
                      >
                        Thêm mới
                      </Checkbox>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Checkbox
                        checked={edit}
                        onChange={(e) => updatePermission(module.key, 'edit', e.target.checked)}
                      >
                        Chỉnh sửa
                      </Checkbox>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Checkbox
                        checked={del}
                        onChange={(e) => updatePermission(module.key, 'delete', e.target.checked)}
                      >
                        Xóa
                      </Checkbox>
                    </Col>
                  </Row>
                </Card>
              );
            })}
          </div>
          <Divider />
          <Text type="secondary" className="text-xs">
            Lưu ý: Quyền "Xem" là cơ bản, các quyền khác thường yêu cầu quyền "Xem" mới có hiệu lực.
          </Text>
        </div>
      </Modal>
    </div>
  );
};

export default RoleManagement;