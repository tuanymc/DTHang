import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Avatar,
  Typography,
  Tabs,
  Button,
  Descriptions,
  Statistic,
  Progress,
  List,
  Tag,
  Divider,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Upload,
  message,
  Badge,
  Tooltip,
  Space,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  BookOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  EditOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  GithubOutlined,
  LinkedinOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { UploadProps } from 'antd';
import type { Dayjs } from 'dayjs';
import { authService } from '../services/auth.service';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// Định nghĩa kiểu dữ liệu người dùng
interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: Dayjs | string;
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  role: 'student' | 'instructor' | 'admin';
  department: string;
  studentId?: string;
  enrolledSince: Dayjs | string;
  totalCoursesEnrolled: number;
  totalCoursesCompleted: number;
  totalLearningHours: number;
  averageScore: number;
  certificates: number;
  recentActivities: Activity[];
  enrolledCourses: EnrolledCourse[];
}

interface Activity {
  id: string;
  type: 'enroll' | 'complete' | 'earn_certificate' | 'watch';
  courseName: string;
  timestamp: Dayjs | string;
  detail?: string;
}

interface EnrolledCourse {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  progress: number;
  lastAccessed: Dayjs | string;
  status: 'in_progress' | 'completed';
  grade?: number;
}

// Dữ liệu mẫu
const mockUserProfile: UserProfile = {
  id: 'STU001',
  fullName: 'Nguyễn Văn A',
  email: 'nguyenvana@hcmut.edu.vn',
  phone: '0901234567',
  avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
  dateOfBirth: dayjs('2000-05-15'),
  bio: 'Sinh viên năm 3 khoa Công nghệ thông tin. Đam mê AI và phát triển ứng dụng.',
  location: 'TP. Hồ Chí Minh, Việt Nam',
  website: 'https://nguyenvana.dev',
  github: 'nguyenvana',
  linkedin: 'nguyenvana',
  role: 'student',
  department: 'Công nghệ thông tin',
  studentId: '20210001',
  enrolledSince: dayjs('2021-09-01'),
  totalCoursesEnrolled: 12,
  totalCoursesCompleted: 8,
  totalLearningHours: 284,
  averageScore: 85.6,
  certificates: 5,
  recentActivities: [
    {
      id: '1',
      type: 'complete',
      courseName: 'Lập trình Web nâng cao',
      timestamp: dayjs().subtract(2, 'days'),
      detail: 'Hoàn thành 100%',
    },
    {
      id: '2',
      type: 'enroll',
      courseName: 'Trí tuệ nhân tạo',
      timestamp: dayjs().subtract(7, 'days'),
      detail: 'Đã đăng ký',
    },
    {
      id: '3',
      type: 'earn_certificate',
      courseName: 'Cơ sở dữ liệu phân tán',
      timestamp: dayjs().subtract(14, 'days'),
      detail: 'Chứng chỉ đạt 92 điểm',
    },
    {
      id: '4',
      type: 'watch',
      courseName: 'Nhập môn an toàn thông tin',
      timestamp: dayjs().subtract(3, 'days'),
      detail: 'Đã xem bài 5',
    },
  ],
  enrolledCourses: [
    {
      id: '1',
      title: 'Lập trình Web nâng cao',
      instructor: 'TS. Nguyễn Văn A',
      thumbnail: 'https://picsum.photos/id/20/300/200',
      progress: 100,
      lastAccessed: dayjs().subtract(1, 'days'),
      status: 'completed',
      grade: 88.5,
    },
    {
      id: '2',
      title: 'Trí tuệ nhân tạo',
      instructor: 'PGS. Trần Thị B',
      thumbnail: 'https://picsum.photos/id/26/300/200',
      progress: 65,
      lastAccessed: dayjs().subtract(2, 'days'),
      status: 'in_progress',
    },
    {
      id: '3',
      title: 'Phát triển ứng dụng di động',
      instructor: 'ThS. Hoàng Văn E',
      thumbnail: 'https://picsum.photos/id/29/300/200',
      progress: 30,
      lastAccessed: dayjs().subtract(5, 'days'),
      status: 'in_progress',
    },
  ],
};

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

  useEffect(() => {
    authService.getProfile().then((res) => {
      const data = res.user ?? res;
      if (!data) return;
      const firstRole = data.roles?.[0] ?? 'student';
      const roleMap: Record<string, 'student' | 'instructor' | 'admin'> = {
        admin: 'admin',
        instructor: 'instructor',
        student: 'student',
      };
      setProfile({
        id: data.id ?? '',
        fullName: `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim(),
        email: data.email ?? '',
        phone: undefined,
        avatar: data.avatar_url ?? undefined,
        dateOfBirth: undefined,
        bio: undefined,
        location: undefined,
        website: undefined,
        github: undefined,
        linkedin: undefined,
        role: roleMap[firstRole] ?? 'student',
        department: '',
        studentId: undefined,
        enrolledSince: dayjs(),
        totalCoursesEnrolled: 0,
        totalCoursesCompleted: 0,
        totalLearningHours: 0,
        averageScore: 0,
        certificates: 0,
        recentActivities: [],
        enrolledCourses: [],
      });
    }).catch((err: any) => {
      console.error('Lỗi khi lấy profile:', err);
    });
  }, []);

  console.log('profie: ', profile);
  

  // Xử lý upload avatar
  const handleAvatarChange: UploadProps['onChange'] = (info) => {
    if (info.file.status === 'uploading') {
      setAvatarLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      const avatarUrl = URL.createObjectURL(info.file.originFileObj as Blob);
      setProfile((prev) => prev ? { ...prev, avatar: avatarUrl } : prev);
      message.success('Cập nhật avatar thành công');
      setAvatarLoading(false);
    }
  };

  // Mở modal chỉnh sửa profile
  const handleEditProfile = () => {
    if (!profile) return;
    form.setFieldsValue({
      fullName: profile.fullName,
      phone: profile.phone,
      dateOfBirth: profile.dateOfBirth,
      bio: profile.bio,
      location: profile.location,
      website: profile.website,
      github: profile.github,
      linkedin: profile.linkedin,
    });
    setIsEditModalOpen(true);
  };

  // Lưu thay đổi profile
  const handleSaveProfile = async (values: any) => {
    setProfile((prev) => prev ? ({
      ...prev,
      fullName: values.fullName,
      phone: values.phone,
      dateOfBirth: values.dateOfBirth,
      bio: values.bio,
      location: values.location,
      website: values.website,
      github: values.github,
      linkedin: values.linkedin,
    }) : prev);
    message.success('Cập nhật thông tin thành công');
    setIsEditModalOpen(false);
  };

  // Render thống kê
  // const renderStats = () => (
  //   <Row gutter={[16, 16]} className="mb-6">
  //     <Col xs={12} sm={12} md={6}>
  //       <Card className="text-center rounded-xl shadow-sm">
  //         <Statistic
  //           title="Khóa học đã tham gia"
  //           value={profile.totalCoursesEnrolled}
  //           prefix={<BookOutlined className="text-blue-500" />}
  //           valueStyle={{ color: '#1890ff' }}
  //         />
  //       </Card>
  //     </Col>
  //     <Col xs={12} sm={12} md={6}>
  //       <Card className="text-center rounded-xl shadow-sm">
  //         <Statistic
  //           title="Đã hoàn thành"
  //           value={profile.totalCoursesCompleted}
  //           prefix={<CheckCircleOutlined className="text-green-500" />}
  //           valueStyle={{ color: '#52c41a' }}
  //         />
  //       </Card>
  //     </Col>
  //     <Col xs={12} sm={12} md={6}>
  //       <Card className="text-center rounded-xl shadow-sm">
  //         <Statistic
  //           title="Giờ học"
  //           value={profile.totalLearningHours}
  //           prefix={<ClockCircleOutlined className="text-orange-500" />}
  //           valueStyle={{ color: '#fa8c16' }}
  //         />
  //       </Card>
  //     </Col>
  //     <Col xs={12} sm={12} md={6}>
  //       <Card className="text-center rounded-xl shadow-sm">
  //         <Statistic
  //           title="Chứng chỉ"
  //           value={profile.certificates}
  //           prefix={<TrophyOutlined className="text-yellow-500" />}
  //           valueStyle={{ color: '#faad14' }}
  //         />
  //       </Card>
  //     </Col>
  //   </Row>
  // );

  // Render thông tin cá nhân
  const renderPersonalInfo = () => {
    if (!profile) return null;
    return (
    <Card className="rounded-xl shadow-sm mb-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <Badge
            count={
              <Upload
                showUploadList={false}
                onChange={handleAvatarChange}
                beforeUpload={() => false}
                accept="image/*"
              >
                <Button
                  type="text"
                  shape="circle"
                  icon={avatarLoading ? <LoadingOutlined /> : <CameraOutlined />}
                  className="absolute bottom-0 right-0 bg-white shadow-md"
                  size="small"
                />
              </Upload>
            }
            offset={[10, 10]}
          >
            <Avatar
              size={120}
              src={profile.avatar}
              icon={<UserOutlined />}
              className="border-4 border-white shadow-lg"
            />
          </Badge>
          {/* <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={handleEditProfile}
            className="mt-2"
          >
            Chỉnh sửa
          </Button> */}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex flex-wrap justify-between items-start">
            <div>
              <Title level={3} className="!mb-0">
                {profile.fullName}
              </Title>
              <Tag color="blue" className="mt-1">
                {profile.role === 'student' ? 'Sinh viên' : profile.role === 'instructor' ? 'Giảng viên' : 'Quản trị viên'}
              </Tag>
              <Tag color="cyan">{profile.department}</Tag>
              {profile.studentId && <Tag color="geekblue">MSSV: {profile.studentId}</Tag>}
            </div>
          </div>

          <Descriptions column={{ xs: 1, sm: 2 }} className="mt-4">
            <Descriptions.Item label={<MailOutlined />} span={1}>
              {profile.email}
            </Descriptions.Item>
            {profile.phone && (
              <Descriptions.Item label={<PhoneOutlined />} span={1}>
                {profile.phone}
              </Descriptions.Item>
            )}
            {profile.dateOfBirth && (
              <Descriptions.Item label={<CalendarOutlined />} span={1}>
                {dayjs(profile.dateOfBirth).format('DD/MM/YYYY')}
              </Descriptions.Item>
            )}
            {profile.location && (
              <Descriptions.Item label={<EnvironmentOutlined />} span={1}>
                {profile.location}
              </Descriptions.Item>
            )}
            {profile.website && (
              <Descriptions.Item label={<GlobalOutlined />} span={1}>
                <a href={profile.website} target="_blank" rel="noopener noreferrer">
                  {profile.website}
                </a>
              </Descriptions.Item>
            )}
            {profile.github && (
              <Descriptions.Item label={<GithubOutlined />} span={1}>
                <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer">
                  @{profile.github}
                </a>
              </Descriptions.Item>
            )}
            {profile.linkedin && (
              <Descriptions.Item label={<LinkedinOutlined />} span={1}>
                <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer">
                  {profile.linkedin}
                </a>
              </Descriptions.Item>
            )}
          </Descriptions>
          {profile.bio && (
            <Paragraph className="mt-3 text-gray-600">
              {profile.bio}
            </Paragraph>
          )}
        </div>
      </div>
    </Card>
    );
  };

  // Render khóa học đã tham gia
  // const renderEnrolledCourses = () => (
  //   <Card title="Khóa học của tôi" className="rounded-xl shadow-sm">
  //     <List
  //       itemLayout="vertical"
  //       dataSource={profile.enrolledCourses}
  //       renderItem={(course) => (
  //         <List.Item
  //           key={course.id}
  //           className="hover:bg-gray-50 rounded-lg transition-colors"
  //           extra={
  //             course.status === 'completed' && course.grade ? (
  //               <div className="text-right">
  //                 <Tag color="green" className="text-sm">
  //                   Điểm: {course.grade}
  //                 </Tag>
  //               </div>
  //             ) : null
  //           }
  //         >
  //           <div className="flex flex-col md:flex-row gap-4">
  //             <img
  //               src={course.thumbnail}
  //               alt={course.title}
  //               className="w-full md:w-40 h-28 object-cover rounded-lg"
  //             />
  //             <div className="flex-1">
  //               <div className="flex justify-between items-start flex-wrap gap-2">
  //                 <div>
  //                   <Text strong className="text-lg">
  //                     {course.title}
  //                   </Text>
  //                   <div className="text-gray-500 text-sm">{course.instructor}</div>
  //                 </div>
  //                 <Tag color={course.status === 'completed' ? 'green' : 'blue'}>
  //                   {course.status === 'completed' ? 'Hoàn thành' : 'Đang học'}
  //                 </Tag>
  //               </div>
  //               <div className="mt-3">
  //                 <div className="flex justify-between text-xs text-gray-500 mb-1">
  //                   <span>Tiến trình</span>
  //                   <span>{course.progress}%</span>
  //                 </div>
  //                 <Progress percent={course.progress} size="small" strokeColor={course.status === 'completed' ? '#52c41a' : '#1890ff'} />
  //               </div>
  //               <div className="mt-2 text-xs text-gray-400">
  //                 Lần cuối truy cập: {dayjs(course.lastAccessed).format('DD/MM/YYYY HH:mm')}
  //               </div>
  //             </div>
  //           </div>
  //         </List.Item>
  //       )}
  //     />
  //   </Card>
  // );

  // // Render hoạt động gần đây
  // const renderRecentActivities = () => (
  //   <Card title="Hoạt động gần đây" className="rounded-xl shadow-sm">
  //     <List
  //       dataSource={profile.recentActivities}
  //       renderItem={(activity) => {
  //         let icon = null;
  //         switch (activity.type) {
  //           case 'enroll':
  //             icon = <BookOutlined className="text-blue-500" />;
  //             break;
  //           case 'complete':
  //             icon = <CheckCircleOutlined className="text-green-500" />;
  //             break;
  //           case 'earn_certificate':
  //             icon = <TrophyOutlined className="text-yellow-500" />;
  //             break;
  //           case 'watch':
  //             icon = <ClockCircleOutlined className="text-purple-500" />;
  //             break;
  //         }
  //         return (
  //           <List.Item>
  //             <div className="flex items-start gap-3 w-full">
  //               <div className="mt-1">{icon}</div>
  //               <div className="flex-1">
  //                 <div>
  //                   <Text strong>{activity.courseName}</Text>
  //                 </div>
  //                 <Text type="secondary" className="text-sm">
  //                   {activity.detail}
  //                 </Text>
  //                 <div className="text-xs text-gray-400 mt-1">
  //                   {dayjs(activity.timestamp).fromNow()}
  //                 </div>
  //               </div>
  //             </div>
  //           </List.Item>
  //         );
  //       }}
  //     />
  //   </Card>
  // );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <Title level={2} className="!mb-6 text-blue-800">
          👤 Hồ sơ cá nhân
        </Title>

        {!profile ? (
          <div className="text-center text-gray-400 py-20">Đang tải...</div>
        ) : (
          <>
            {renderPersonalInfo()}
          </>
        )}
      </div>

      {/* Modal chỉnh sửa profile */}
      <Modal
        title="Chỉnh sửa thông tin cá nhân"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={() => form.submit()}
        width={700}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveProfile}
          initialValues={{
            fullName: profile?.fullName,
            phone: profile?.phone,
            dateOfBirth: profile?.dateOfBirth,
            bio: profile?.bio,
            location: profile?.location,
            website: profile?.website,
            github: profile?.github,
            linkedin: profile?.linkedin,
          }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="Số điện thoại">
                <Input prefix={<PhoneOutlined />} placeholder="0901234567" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dateOfBirth" label="Ngày sinh">
                <DatePicker format="DD/MM/YYYY" className="w-full" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="location" label="Địa chỉ">
                <Input prefix={<EnvironmentOutlined />} placeholder="TP. Hồ Chí Minh" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="bio" label="Giới thiệu">
                <Input.TextArea rows={3} placeholder="Đôi nét về bản thân..." />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="website" label="Website">
                <Input prefix={<GlobalOutlined />} placeholder="https://example.com" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="github" label="GitHub username">
                <Input prefix={<GithubOutlined />} placeholder="username" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="linkedin" label="LinkedIn username">
                <Input prefix={<LinkedinOutlined />} placeholder="username" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;