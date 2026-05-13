import React, { useState } from 'react';
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
  TreeSelect,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  FolderOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Option } = Select;

// Định nghĩa kiểu dữ liệu danh mục
interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  description: string;
  status: 'active' | 'inactive';
  order: number;
  createdAt: string;
}

// Mock data ban đầu
const initialCategories: Category[] = [
  {
    id: '1',
    name: 'Lập trình',
    slug: 'lap-trinh',
    parentId: null,
    description: 'Các khóa học về lập trình máy tính',
    status: 'active',
    order: 1,
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Web Development',
    slug: 'web-dev',
    parentId: '1',
    description: 'Phát triển ứng dụng web',
    status: 'active',
    order: 1,
    createdAt: '2024-01-05',
  },
  {
    id: '3',
    name: 'Mobile App',
    slug: 'mobile-app',
    parentId: '1',
    description: 'Phát triển ứng dụng di động',
    status: 'active',
    order: 2,
    createdAt: '2024-01-10',
  },
  {
    id: '4',
    name: 'Thiết kế',
    slug: 'thiet-ke',
    parentId: null,
    description: 'Thiết kế đồ họa, UI/UX',
    status: 'active',
    order: 2,
    createdAt: '2024-01-15',
  },
  {
    id: '5',
    name: 'UI/UX Design',
    slug: 'ui-ux',
    parentId: '4',
    description: 'Thiết kế trải nghiệm người dùng',
    status: 'inactive',
    order: 1,
    createdAt: '2024-02-01',
  },
  {
    id: '6',
    name: 'Kinh doanh',
    slug: 'kinh-doanh',
    parentId: null,
    description: 'Kỹ năng quản trị, khởi nghiệp',
    status: 'active',
    order: 3,
    createdAt: '2024-02-10',
  },
];

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Helper: lấy danh sách category để làm parent (dạng tree select)
  const getCategoryTreeData = (items: Category[], parentId: string | null = null, level = 0): any[] => {
    return items
      .filter(item => item.parentId === parentId && item.status === 'active')
      .map(item => ({
        title: '--'.repeat(level) + ' ' + item.name,
        value: item.id,
        key: item.id,
        children: getCategoryTreeData(items, item.id, level + 1),
      }));
  };

  // Xây dựng dữ liệu cho TreeSelect (loại trừ chính nó và con cháu khi edit)
  const getParentOptions = (excludeId?: string) => {
    let filtered = categories;
    if (excludeId) {
      // Lấy tất cả id của category cần exclude và các category con (để tránh vòng lặp)
      const getDescendantIds = (id: string): string[] => {
        const children = categories.filter(c => c.parentId === id);
        return [id, ...children.flatMap(c => getDescendantIds(c.id))];
      };
      const excludeIds = getDescendantIds(excludeId);
      filtered = categories.filter(c => !excludeIds.includes(c.id));
    }
    return getCategoryTreeData(filtered);
  };

  // Thêm hoặc cập nhật danh mục
  const handleSaveCategory = (values: any) => {
    const slug = values.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    if (editingCategory) {
      // Cập nhật
      const updatedCategories = categories.map((cat) =>
        cat.id === editingCategory.id
          ? { ...cat, ...values, slug }
          : cat
      );
      simulateLoading(() => {
        setCategories(updatedCategories);
        message.success('Cập nhật danh mục thành công!');
        setModalVisible(false);
        form.resetFields();
        setEditingCategory(null);
      });
    } else {
      // Thêm mới
      const maxOrder = categories.reduce((max, cat) => Math.max(max, cat.order), 0);
      const newCategory: Category = {
        id: Date.now().toString(),
        ...values,
        slug,
        order: maxOrder + 1,
        createdAt: new Date().toISOString().split('T')[0],
      };
      simulateLoading(() => {
        setCategories([...categories, newCategory]);
        message.success('Thêm danh mục thành công!');
        setModalVisible(false);
        form.resetFields();
      });
    }
  };

  // Xóa danh mục
  const handleDeleteCategory = (id: string) => {
    // Kiểm tra nếu có danh mục con
    const hasChildren = categories.some(cat => cat.parentId === id);
    if (hasChildren) {
      message.error('Không thể xóa danh mục này vì có danh mục con!');
      return;
    }
    simulateLoading(() => {
      setCategories(categories.filter((cat) => cat.id !== id));
      message.success('Xóa danh mục thành công!');
    });
  };

  const simulateLoading = (fn: () => void) => {
    setLoading(true);
    setTimeout(() => {
      fn();
      setLoading(false);
    }, 500);
  };

  const showAddModal = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      parentId: category.parentId,
      description: category.description,
      status: category.status,
    });
    setModalVisible(true);
  };

  // Lọc và tìm kiếm
  const filteredCategories = categories.filter((cat) => {
    const matchSearch = cat.name.toLowerCase().includes(searchText.toLowerCase()) ||
                        cat.slug.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = statusFilter === 'all' || cat.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Hiển thị tên danh mục cha
  const getParentName = (parentId: string | null) => {
    if (!parentId) return <Tag>Gốc</Tag>;
    const parent = categories.find(c => c.id === parentId);
    return parent ? parent.name : 'Không xác định';
  };

  // Định nghĩa cột cho bảng
  const columns: ColumnsType<Category> = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text: string, record) => (
        <Space>
          {record.parentId ? <FolderOpenOutlined className="text-blue-500" /> : <FolderOutlined className="text-orange-500" />}
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      width: 150,
      render: (text: string) => <Tag color="geekblue">{text}</Tag>,
    },
    {
      title: 'Danh mục cha',
      key: 'parent',
      width: 150,
      render: (_, record) => getParentName(record.parentId),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: 'Hoạt động', value: 'active' },
        { text: 'Tạm dừng', value: 'inactive' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'orange'}>
          {status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
        </Tag>
      ),
    },
    {
      title: 'Thứ tự',
      dataIndex: 'order',
      key: 'order',
      width: 80,
      sorter: (a, b) => a.order - b.order,
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
            title="Xóa danh mục"
            description={`Bạn có chắc muốn xóa danh mục "${record.name}"?`}
            onConfirm={() => handleDeleteCategory(record.id)}
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
            <FolderOutlined className="text-2xl text-blue-600" />
            <Title level={3} className="!mb-0">
              Quản lý danh mục khóa học
            </Title>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showAddModal}
            size="large"
            className="shadow-sm"
          >
            Thêm danh mục
          </Button>
        </div>

        {/* Bộ lọc và tìm kiếm */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} md={12} lg={8}>
            <Input
              placeholder="Tìm kiếm theo tên hoặc slug"
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              size="large"
              className="rounded-lg"
            />
          </Col>
          <Col xs={24} md={12} lg={6}>
            <Select
              placeholder="Lọc theo trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
              size="large"
              className="w-full rounded-lg"
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="active">Đang hoạt động</Option>
              <Option value="inactive">Tạm dừng</Option>
            </Select>
          </Col>
          <Col xs={24} md={0} lg={10} />
          <Col xs={24} md={12} lg={6} className="flex justify-end">
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSearchText('');
                setStatusFilter('all');
              }}
              size="large"
            >
              Đặt lại
            </Button>
          </Col>
        </Row>

        {/* Bảng danh mục */}
        <Table
          columns={columns}
          dataSource={filteredCategories}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} trên ${total} danh mục`,
          }}
          className="border rounded-xl overflow-hidden"
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Modal Thêm/Sửa danh mục */}
      <Modal
        title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingCategory(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
        className="rounded-2xl"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveCategory}
          className="mt-4"
        >
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
          >
            <Input size="large" placeholder="VD: Lập trình" />
          </Form.Item>

          <Form.Item
            name="parentId"
            label="Danh mục cha"
          >
            <TreeSelect
              size="large"
              treeData={getParentOptions(editingCategory?.id)}
              placeholder="Chọn danh mục cha (để trống nếu là danh mục gốc)"
              allowClear
              treeDefaultExpandAll
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <Input.TextArea rows={3} placeholder="Mô tả danh mục..." />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true }]}
            initialValue="active"
          >
            <Select size="large">
              <Option value="active">Đang hoạt động</Option>
              <Option value="inactive">Tạm dừng</Option>
            </Select>
          </Form.Item>

          <Form.Item className="flex justify-end gap-2 mb-0">
            <Button onClick={() => setModalVisible(false)} size="large">
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" size="large" loading={loading}>
              {editingCategory ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManagement;