import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  Avatar,
  message,
  Tabs,
  Row,
  Col,
  Typography,
  Divider,
  Space,
  Tooltip,
  Tag,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  CameraOutlined,
  LockOutlined,
  SaveOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { RcFile } from 'antd/es/upload';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// Mock dữ liệu admin hiện tại
interface AdminProfileData {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  birthday: string;
  avatar: string;
  role: string;
  department: string;
  joinDate: string;
}

const initialAdminData: AdminProfileData = {
  id: 'ADM001',
  username: 'admin_nguyenvan',
  email: 'admin@lms.edu.vn',
  fullName: 'Nguyễn Văn Admin',
  phone: '0901234567',
  address: 'Hà Nội, Việt Nam',
  birthday: '1985-05-15',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  role: 'Quản trị viên hệ thống',
  department: 'Phòng Đào tạo',
  joinDate: '2020-01-01',
};

const AdminProfile: React.FC = () => {
  const [adminData, setAdminData] = useState<AdminProfileData>(initialAdminData);
  const [loading, setLoading] = useState(false);
  const [infoForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // Xử lý upload avatar (giả lập)
  const handleAvatarChange: UploadProps['onChange'] = (info) => {
    if (info.file.status === 'uploading') {
      return;
    }
    if (info.file.status === 'done') {
      // Giả lập lấy URL từ response
      const newAvatarUrl = URL.createObjectURL(info.file.originFileObj as RcFile);
      setAdminData({ ...adminData, avatar: newAvatarUrl });
      message.success('Cập nhật ảnh đại diện thành công!');
    } else if (info.file.status === 'error') {
      message.error('Upload ảnh thất bại!');
    }
  };

  const uploadProps: UploadProps = {
    name: 'avatar',
    showUploadList: false,
    action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188', // mock api
    onChange: handleAvatarChange,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Chỉ chấp nhận file ảnh!');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Ảnh phải nhỏ hơn 2MB!');
        return false;
      }
      return true;
    },
  };

  // Cập nhật thông tin cá nhân
  const handleUpdateInfo = async (values: any) => {
    setLoading(true);
    // Giả lập API update
    setTimeout(() => {
      setAdminData({
        ...adminData,
        fullName: values.fullName,
        phone: values.phone,
        address: values.address,
        birthday: values.birthday,
      });
      message.success('Cập nhật thông tin thành công!');
      setLoading(false);
    }, 800);
  };

  // Đổi mật khẩu
  const handleChangePassword = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp!');
      return;
    }
    setLoading(true);
    // Giả lập API đổi mật khẩu
    setTimeout(() => {
      message.success('Đổi mật khẩu thành công!');
      passwordForm.resetFields();
      setLoading(false);
    }, 800);
  };

  // Format ngày tháng hiển thị
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Title level={3} className="!mb-1">Hồ sơ của tôi</Title>
          <Text type="secondary">Quản lý thông tin cá nhân và bảo mật tài khoản</Text>
        </div>

        <Row gutter={[24, 24]}>
          {/* Cột trái: Avatar & thông tin tóm tắt */}
          <Col xs={24} lg={8}>
            <Card className="shadow-md rounded-2xl text-center sticky top-6">
              <div className="relative inline-block">
                <Avatar
                  size={120}
                  src={adminData.avatar}
                  icon={<UserOutlined />}
                  className="border-4 border-white shadow-lg"
                />
                <Upload {...uploadProps} className="absolute bottom-0 right-0">
                  <Tooltip title="Đổi ảnh đại diện">
                    <Button
                      shape="circle"
                      icon={<CameraOutlined />}
                      className="bg-blue-500 border-none shadow-md hover:bg-blue-600"
                      size="small"
                    />
                  </Tooltip>
                </Upload>
              </div>
              <div className="mt-4">
                <Title level={4} className="!mb-0">{adminData.fullName}</Title>
                <Text type="secondary">@{adminData.username}</Text>
                <div className="mt-3">
                  <Tag color="blue" className="rounded-full px-3 py-1">
                    {adminData.role}
                  </Tag>
                </div>
              </div>
              <Divider className="my-4" />
              <div className="text-left space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <MailOutlined className="w-5" />
                  <span>{adminData.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <PhoneOutlined className="w-5" />
                  <span>{adminData.phone || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <EnvironmentOutlined className="w-5" />
                  <span>{adminData.address || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <IdcardOutlined className="w-5" />
                  <span>Mã NV: {adminData.id}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <CalendarOutlined className="w-5" />
                  <span>Tham gia: {formatDate(adminData.joinDate)}</span>
                </div>
              </div>
            </Card>
          </Col>

          {/* Cột phải: Form chỉnh sửa thông tin & đổi mật khẩu */}
          <Col xs={24} lg={16}>
            <Card className="shadow-md rounded-2xl">
              <Tabs defaultActiveKey="info" className="profile-tabs">
                <TabPane
                  tab={<span><UserOutlined /> Thông tin cá nhân</span>}
                  key="info"
                >
                  <Form
                    form={infoForm}
                    layout="vertical"
                    initialValues={{
                      fullName: adminData.fullName,
                      phone: adminData.phone,
                      address: adminData.address,
                      birthday: adminData.birthday,
                    }}
                    onFinish={handleUpdateInfo}
                    className="mt-4"
                  >
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          name="fullName"
                          label="Họ và tên"
                          rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                        >
                          <Input size="large" prefix={<UserOutlined className="text-gray-400" />} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="phone"
                          label="Số điện thoại"
                          rules={[
                            { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                          ]}
                        >
                          <Input size="large" prefix={<PhoneOutlined className="text-gray-400" />} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="birthday" label="Ngày sinh">
                          <Input type="date" size="large" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item name="address" label="Địa chỉ">
                          <Input size="large" prefix={<EnvironmentOutlined className="text-gray-400" />} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        icon={<SaveOutlined />}
                        size="large"
                        className="shadow-sm"
                      >
                        Lưu thay đổi
                      </Button>
                    </Form.Item>
                  </Form>
                </TabPane>

                <TabPane
                  tab={<span><LockOutlined /> Đổi mật khẩu</span>}
                  key="password"
                >
                  <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handleChangePassword}
                    className="mt-4"
                  >
                    <Form.Item
                      name="currentPassword"
                      label="Mật khẩu hiện tại"
                      rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                    >
                      <Input.Password size="large" placeholder="••••••••" />
                    </Form.Item>
                    <Form.Item
                      name="newPassword"
                      label="Mật khẩu mới"
                      rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                        { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự!' }
                      ]}
                    >
                      <Input.Password size="large" placeholder="Mật khẩu mới" />
                    </Form.Item>
                    <Form.Item
                      name="confirmPassword"
                      label="Xác nhận mật khẩu mới"
                      dependencies={['newPassword']}
                      rules={[
                        { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password size="large" placeholder="Nhập lại mật khẩu mới" />
                    </Form.Item>
                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        icon={<LockOutlined />}
                        size="large"
                        className="shadow-sm"
                      >
                        Đổi mật khẩu
                      </Button>
                    </Form.Item>
                  </Form>
                </TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>
      </div>

      <style>{`
        .profile-tabs .ant-tabs-nav {
          margin-bottom: 1rem;
        }
        .profile-tabs .ant-tabs-tab {
          font-size: 1rem;
          padding: 12px 0;
        }
      `}</style>
    </div>
  );
};

export default AdminProfile;