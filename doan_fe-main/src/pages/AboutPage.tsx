import React from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Avatar,
  Divider,
  Timeline,
  Tag,
  Space,
  Statistic,
  Tooltip,
} from 'antd';
import {
  RocketOutlined,
  TeamOutlined,
  BookOutlined,
  CloudOutlined,
  SafetyOutlined,
  TrophyOutlined,
  GlobalOutlined,
  HeartOutlined,
  ExperimentOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

// Dữ liệu đội ngũ giảng viên chủ chốt
const teamMembers = [
  {
    name: 'PGS.TS. Trần Văn Bình',
    role: 'Trưởng khoa CNTT',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    bio: 'Chuyên gia về Hệ thống thông tin và AI, với hơn 20 năm kinh nghiệm giảng dạy và nghiên cứu.',
  },
  {
    name: 'TS. Nguyễn Thị Lan',
    role: 'Phó trưởng khoa - Đào tạo',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    bio: 'Chuyên ngành Khoa học dữ liệu, tác giả nhiều công trình quốc tế.',
  },
  {
    name: 'ThS. Lê Hoàng Nam',
    role: 'Trưởng bộ môn PTPM',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    bio: 'Giảng viên xuất sắc về Phát triển phần mềm và Công nghệ Web.',
  },
  {
    name: 'TS. Phạm Minh Đức',
    role: 'Trưởng phòng Lab AI',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    bio: 'Nghiên cứu về Học máy và Thị giác máy tính, hướng dẫn nhiều sinh viên đạt giải thưởng.',
  },
];

// Các tính năng nổi bật của LMS
const features = [
  {
    icon: <BookOutlined className="text-3xl text-blue-500" />,
    title: 'Khóa học đa dạng',
    description: 'Hơn 100+ khóa học từ cơ bản đến nâng cao, cập nhật xu hướng công nghệ mới.',
  },
  {
    icon: <ExperimentOutlined className="text-3xl text-purple-500" />,
    title: 'Thực hành trực tuyến',
    description: 'Môi trường lab ảo, bài tập coding tương tác, đánh giá tự động.',
  },
  {
    icon: <TrophyOutlined className="text-3xl text-yellow-500" />,
    title: 'Chứng chỉ uy tín',
    description: 'Chứng chỉ được công nhận bởi khoa CNTT và các đối tác doanh nghiệp.',
  },
  {
    icon: <TeamOutlined className="text-3xl text-green-500" />,
    title: 'Cộng đồng học tập',
    description: 'Diễn đàn thảo luận, mentor hỗ trợ 24/7, dự án nhóm thực tế.',
  },
  {
    icon: <CloudOutlined className="text-3xl text-cyan-500" />,
    title: 'Học mọi lúc, mọi nơi',
    description: 'Nội dung được tối ưu trên mobile, xem offline, đồng bộ tiến trình.',
  },
  {
    icon: <SafetyOutlined className="text-3xl text-red-500" />,
    title: 'Bảo mật & Tin cậy',
    description: 'Hệ thống bảo mật cao, lưu trữ dữ liệu an toàn, sao lưu định kỳ.',
  },
];

// Các mốc phát triển
const milestones = [
  { year: '2020', event: 'Thành lập khoa Công nghệ thông tin', icon: <RocketOutlined /> },
  { year: '2021', event: 'Ra mắt hệ thống LMS phiên bản beta', icon: <ExperimentOutlined /> },
  { year: '2022', event: 'Hợp tác với 20+ doanh nghiệp công nghệ', icon: <TeamOutlined /> },
  { year: '2023', event: 'Đạt chuẩn kiểm định chất lượng ABET', icon: <TrophyOutlined /> },
  { year: '2024', event: 'Triển khai khóa học AI & Data Science', icon: <GlobalOutlined /> },
  { year: '2025', event: 'Nâng cấp LMS với tính năng học tập cá nhân hóa', icon: <HeartOutlined /> },
];

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-800 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative z-10">
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} md={14}>
              <Tag color="gold" className="mb-4 text-base">
                🌟 Hệ thống quản lý học tập thế hệ mới
              </Tag>
              <Title className="!text-white !text-3xl md:!text-5xl !mb-4">
                Khoa Công nghệ thông tin
              </Title>
              <Title level={2} className="!text-blue-200 !text-xl md:!text-2xl !mb-4">
                Đào tạo nguồn nhân lực CNTT chất lượng cao
              </Title>
              <Paragraph className="text-gray-200 text-base md:text-lg">
                LMS (Learning Management System) được thiết kế dành riêng cho sinh viên khoa CNTT, 
                cung cấp môi trường học tập trực tuyến hiện đại, tương tác và hiệu quả.
              </Paragraph>
              <Space className="mt-6">
                <Button type="primary" size="large" className="bg-blue-500 hover:bg-blue-600" onClick={() => window.location.href='https://www.utehy.edu.vn/'}>
                  Khám phá ngay
                </Button>
                {/* <Button ghost size="large">
                  Xem video giới thiệu
                </Button> */}
              </Space>
            </Col>
            <Col xs={24} md={10} className="flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 md:w-80 md:h-80 bg-blue-400/20 rounded-full flex items-center justify-center">
                  <BookOutlined className="text-7xl text-white/80" />
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <Row gutter={[32, 32]}>
          <Col xs={24} md={12}>
            <Card className="h-full rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center mb-4">
                <RocketOutlined className="text-5xl text-blue-500" />
              </div>
              <Title level={3} className="text-center">
                Sứ mệnh
              </Title>
              <Paragraph className="text-gray-600 text-center">
                Đào tạo nguồn nhân lực Công nghệ thông tin có kiến thức chuyên môn vững vàng, 
                kỹ năng thực hành xuất sắc, tư duy sáng tạo và khả năng thích ứng với sự phát triển 
                không ngừng của công nghệ, đáp ứng nhu cầu của thị trường lao động trong nước và quốc tế.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card className="h-full rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center mb-4">
                <GlobalOutlined className="text-5xl text-green-500" />
              </div>
              <Title level={3} className="text-center">
                Tầm nhìn
              </Title>
              <Paragraph className="text-gray-600 text-center">
                Trở thành khoa đào tạo Công nghệ thông tin hàng đầu khu vực, tiên phong trong việc 
                áp dụng công nghệ mới vào giảng dạy, nghiên cứu và chuyển giao tri thức, góp phần 
                xây dựng hệ sinh thái công nghệ số bền vững.
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Core Values */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Tag color="blue" className="text-base">Giá trị cốt lõi</Tag>
            <Title level={2} className="mt-2">Định hướng phát triển của chúng tôi</Title>
            <Text type="secondary" className="text-lg">
              5 giá trị nền tảng xuyên suốt mọi hoạt động
            </Text>
          </div>
          <Row gutter={[32, 32]}>
            <Col xs={24} sm={12} md={8} lg={4} className="text-center">
              <HeartOutlined className="text-4xl text-red-400" />
              <Title level={5} className="mt-2">Tận tâm</Title>
              <Text type="secondary">Luôn đặt lợi ích người học lên hàng đầu</Text>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4} className="text-center">
              <ExperimentOutlined className="text-4xl text-purple-400" />
              <Title level={5} className="mt-2">Sáng tạo</Title>
              <Text type="secondary">Không ngừng đổi mới phương pháp giảng dạy</Text>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4} className="text-center">
              <TeamOutlined className="text-4xl text-blue-400" />
              <Title level={5} className="mt-2">Hợp tác</Title>
              <Text type="secondary">Xây dựng cộng đồng học tập gắn kết</Text>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4} className="text-center">
              <TrophyOutlined className="text-4xl text-yellow-500" />
              <Title level={5} className="mt-2">Chất lượng</Title>
              <Text type="secondary">Kiểm định và cải tiến liên tục</Text>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4} className="text-center">
              <SafetyOutlined className="text-4xl text-green-500" />
              <Title level={5} className="mt-2">Trách nhiệm</Title>
              <Text type="secondary">Đóng góp cho cộng đồng và xã hội</Text>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4} className="text-center">
              <GlobalOutlined className="text-4xl text-indigo-400" />
              <Title level={5} className="mt-2">Hội nhập</Title>
              <Text type="secondary">Kết nối tri thức toàn cầu</Text>
            </Col>
          </Row>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Tag color="cyan" className="text-base">Tính năng nổi bật</Tag>
            <Title level={2}>Hệ thống LMS hiện đại, toàn diện</Title>
            <Text type="secondary">
              Được xây dựng dựa trên nền tảng công nghệ mới nhất, đáp ứng mọi nhu cầu học tập trực tuyến
            </Text>
          </div>
          <Row gutter={[32, 32]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <Card className="h-full text-center rounded-xl shadow-sm hover:shadow-lg transition-all">
                  <div className="mb-4">{feature.icon}</div>
                  <Title level={4}>{feature.title}</Title>
                  <Paragraph className="text-gray-500">{feature.description}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Milestones Timeline */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Tag color="purple" className="text-base">Lịch sử phát triển</Tag>
            <Title level={2}>Hành trình đổi mới giáo dục</Title>
            <Text type="secondary">Những cột mốc quan trọng của khoa CNTT và hệ thống LMS</Text>
          </div>
          <Timeline mode="alternate" className="max-w-3xl mx-auto">
            {milestones.map((item, idx) => (
              <Timeline.Item key={idx} dot={item.icon} color="blue">
                <div className="pb-4">
                  <Tag color="blue" className="text-base font-bold">{item.year}</Tag>
                  <Title level={5} className="mt-1">{item.event}</Title>
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Tag color="geekblue" className="text-base">Đội ngũ lãnh đạo</Tag>
            <Title level={2}>Những người dẫn dắt và truyền cảm hứng</Title>
            <Text type="secondary">
              Giảng viên giàu kinh nghiệm, tận tâm và luôn cập nhật xu hướng công nghệ mới
            </Text>
          </div>
          <Row gutter={[32, 32]}>
            {teamMembers.map((member, idx) => (
              <Col xs={24} sm={12} md={6} key={idx}>
                <Card className="text-center h-full rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <Avatar size={100} src={member.avatar} icon={<UserOutlined />} className="mb-4" />
                  <Title level={4} className="!mb-0">{member.name}</Title>
                  <Tag color="blue" className="mt-1">{member.role}</Tag>
                  <Paragraph className="text-gray-500 mt-3">{member.bio}</Paragraph>
                  <Space className="mt-2">
                    <Tooltip title="Email">
                      <MailOutlined className="text-gray-400 cursor-pointer hover:text-blue-500" />
                    </Tooltip>
                    <Tooltip title="Liên hệ">
                      <PhoneOutlined className="text-gray-400 cursor-pointer hover:text-blue-500" />
                    </Tooltip>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Stats & Contact */}
      <div className="py-16 bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} md={12}>
              <Title level={2} className="!text-white">Sẵn sàng đồng hành cùng bạn?</Title>
              <Paragraph className="text-blue-100 text-lg">
                Hãy tham gia ngay cộng đồng học tập của khoa CNTT để trải nghiệm hệ thống LMS hiện đại
                và mở ra cơ hội nghề nghiệp rộng mở.
              </Paragraph>
              <Space>
                <Button type="primary" size="large" className="bg-blue-500 hover:bg-blue-600">
                  Đăng ký ngay
                </Button>
                <Button ghost size="large">
                  Liên hệ tư vấn
                </Button>
              </Space>
              <div className="mt-8 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <EnvironmentOutlined />
                  <Text className="text-blue-100">Khu phố 6, P. Linh Trung, TP. Thủ Đức, TP. Hồ Chí Minh</Text>
                </div>
                <div className="flex items-center gap-2">
                  <MailOutlined />
                  <Text className="text-blue-100">itfaculty@hcmut.edu.vn</Text>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneOutlined />
                  <Text className="text-blue-100">(028) 1234 5678</Text>
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card className="text-center bg-white/10 border-white/20">
                    <Statistic title="Sinh viên" value={3500} valueStyle={{ color: '#fff' }} />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card className="text-center bg-white/10 border-white/20">
                    <Statistic title="Khóa học" value={120} valueStyle={{ color: '#fff' }} />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card className="text-center bg-white/10 border-white/20">
                    <Statistic title="Giảng viên" value={45} valueStyle={{ color: '#fff' }} />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card className="text-center bg-white/10 border-white/20">
                    <Statistic title="Đối tác DN" value={30} valueStyle={{ color: '#fff' }} />
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </div>

      {/* Footer simple */}
      <div className="bg-gray-800 text-white py-6 text-center">
        <Text className="text-gray-400">
          © {new Date().getFullYear()} Khoa Công nghệ thông tin - Hệ thống LMS. All rights reserved.
        </Text>
      </div>
    </div>
  );
};

export default AboutPage;