import { Progress, Typography, Avatar, Dropdown, Space, MenuProps } from "antd";
import { UserOutlined, DownOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

interface LearningHeaderProps {
  courseTitle: string;
  progressPercent: number;
}

const LearningHeader = ({ courseTitle, progressPercent }: LearningHeaderProps) => {
  const userMenuItems: MenuProps["items"] = [
    { key: "profile", label: "Hồ sơ" },
    { key: "logout", label: "Đăng xuất" },
  ];

  return (
    <div className="flex items-center justify-between bg-white px-6 py-3 shadow-sm sticky top-0 z-20">
      {/* Logo + Tên khóa học */}
      <div className="flex items-center gap-4">
        <Link to="/" className="text-xl font-bold text-blue-600">
          LMS CNTT
        </Link>
        <div className="hidden md:block h-6 w-px bg-gray-300" />
        <Title level={5} className="!mb-0 hidden md:block">
          {courseTitle}
        </Title>
      </div>

      {/* Tiến độ hình tròn */}
      <div className="flex items-center gap-3">
        <Progress
          type="circle"
          percent={progressPercent}
          size={50}
          strokeColor="#3b82f6"
          format={(percent) => `${percent}%`}
        />
        <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
          <Space className="cursor-pointer">
            <Avatar icon={<UserOutlined />} />
            <DownOutlined className="text-gray-500" />
          </Space>
        </Dropdown>
      </div>
    </div>
  );
};

export default LearningHeader;