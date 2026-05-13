import { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import type { MenuProps } from "antd";
import { Layout, Menu, Space, Button, Dropdown, Avatar, theme } from "antd";
import {
    HomeOutlined,
    BookOutlined,
    CodeOutlined,
    ApartmentOutlined,
    HeartOutlined,
    DatabaseOutlined,
    TeamOutlined,
    InfoCircleOutlined,
    UserOutlined,
    DashboardOutlined,
    SettingOutlined,
    LogoutOutlined,
    DownOutlined,
} from "@ant-design/icons";
import logo from "../../public/Logo_Trường_Đại_học_Sư_phạm_Kỹ_thuật_Hưng_Yên.svg";
import { useAuthStore } from "../store/useAuthStore";

const { Header, Content, Footer } = Layout;

const MainLayout = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { token } = theme.useToken(); // Lấy token theme để đồng bộ màu
    const { isAuthenticated, user, logout } = useAuthStore();
    // Menu items giữ nguyên
    const learnerMenuExtras: MenuProps["items"] = isAuthenticated ?
            [
                {
                    key: "/dashboard",
                    icon: <DashboardOutlined />,
                    label: <Link to="/dashboard">Bảng điều khiển</Link>,
                },
                {
                    key: "/my-courses",
                    icon: <BookOutlined />,
                    label: (
                        <Link to="/my-courses">Khóa học của tôi</Link>
                    ),
                },
                {
                    key: "/my-courses/wishlist",
                    icon: <HeartOutlined />,
                    label: <Link to="/my-courses/wishlist">Yêu thích</Link>,
                },
            ]
        :   [];

    const menuItems: MenuProps["items"] = [
        {
            key: "/",
            icon: <HomeOutlined />,
            label: <Link to="/">Trang chủ</Link>,
        },
        {
            key: "/learning-paths",
            icon: <ApartmentOutlined />,
            label: (
                <Link to="/learning-paths">Lộ trình / Combo</Link>
            ),
        },
        ...learnerMenuExtras,
        // {
        //     key: "/courses",
        //     icon: <BookOutlined />,
        //     label: "Khóa học",
        // },
        // {
        //     key: "/instructors",
        //     icon: <TeamOutlined />,
        //     label: <Link to="/instructors">Giảng viên</Link>,
        // },
        {
            key: "/about",
            icon: <InfoCircleOutlined />,
            label: <Link to="/about">Giới thiệu</Link>,
        },
    ];

    const userMenuItems: MenuProps["items"] = [
        {
            key: "dashboard",
            icon: <DashboardOutlined />,
            label: <Link to="/dashboard">Bảng điều khiển</Link>,
        },
        {
            key: "profile",
            icon: <UserOutlined />,
            label: <Link to="/profile">Hồ sơ cá nhân</Link>,
        },
        // { key: "settings", icon: <SettingOutlined />, label: "Cài đặt" },
        { type: "divider" },
        {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Đăng xuất",
            onClick: async () => {
                await logout();
                navigate("/auth/login");
            },
        },
    ];

    return (
        <Layout className="min-h-screen">
            {/* Header với gradient và hiệu ứng mờ khi scroll (tuỳ chọn) */}
            <Header
                className="sticky top-0 z-20 w-full"
                style={{
                    background: "#ffffff",
                    color: "#000",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                    borderBottom: "1px solid #f0f0f0",
                    padding: "0 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                {/* Logo */}
                <div className="flex items-center">
                    <Link to="/" className="flex items-center gap-2">
                        <img src={logo} alt="" width={40} />
                        <div className="text-2xl font-bold tracking-tight">
                            LMS CNTT
                        </div>
                    </Link>
                </div>

                {/* Menu chính - màu trắng, nổi bật trên nền gradient */}
                <Menu
                    mode="horizontal"
                    selectedKeys={[location.pathname]}
                    // defaultOpenKeys={["/courses"]}
                    items={menuItems}
                    className="border-none flex-1 justify-center text-base font-medium"
                    style={{
                        minWidth: 0,
                        flex: "auto",
                        background: "transparent",
                        lineHeight: "64px",
                    }}
                    theme="light" // 🔥 đổi từ dark → light
                />

                {/* Phần bên phải */}
                <div className="flex items-center">
                    {!isAuthenticated ? (
                        <Space>
                            <Button
                                type="default"
                                style={{ color: "#000" }}
                                onClick={() => navigate("/auth/login")}
                            >
                                Đăng nhập
                            </Button>

                            <Button type="primary">Đăng ký</Button>
                        </Space>
                    ) : (
                        <Dropdown
                            menu={{ items: userMenuItems }}
                            trigger={["click"]}
                            placement="bottomRight"
                        >
                            <Space className="cursor-pointer rounded-full px-3 py-1 transition-all">
                                <Avatar
                                    size="small"
                                    src="https://randomuser.me/api/portraits/men/1.jpg"
                                    icon={<UserOutlined />}
                                />
                                <span className="font-medium text-black hidden sm:inline">
                                    {user?.first_name + " " + user?.last_name ||
                                        "User"}
                                </span>
                                <DownOutlined className="text-gray-500 text-xs" />
                            </Space>
                        </Dropdown>
                    )}
                </div>
            </Header>

            {/* Nội dung chính */}
            <Content className="bg-gray-50">
                <Outlet />
            </Content>

            {/* Footer giữ nguyên như cũ, có thể tuỳ chỉnh thêm */}
            <Footer className="bg-gray-900 text-gray-400">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <h4 className="text-white text-lg font-semibold mb-4">
                                LMS CNTT
                            </h4>
                            <p className="text-gray-400 text-sm">
                                Nền tảng học tập trực tuyến hàng đầu dành cho
                                sinh viên Công nghệ Thông tin.
                            </p>
                        </div>
                        <div>
                            <h5 className="text-white font-medium mb-4">
                                Liên kết nhanh
                            </h5>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        to="/learning-paths"
                                        className="text-gray-400 hover:text-white transition"
                                    >
                                        Lộ trình / Combo
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/instructors"
                                        className="text-gray-400 hover:text-white transition"
                                    >
                                        Giảng viên
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/blog"
                                        className="text-gray-400 hover:text-white transition"
                                    >
                                        Blog
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-white font-medium mb-4">
                                Hỗ trợ
                            </h5>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        to="/help"
                                        className="text-gray-400 hover:text-white transition"
                                    >
                                        Trung tâm trợ giúp
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/terms"
                                        className="text-gray-400 hover:text-white transition"
                                    >
                                        Điều khoản sử dụng
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/privacy"
                                        className="text-gray-400 hover:text-white transition"
                                    >
                                        Chính sách bảo mật
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-white font-medium mb-4">
                                Liên hệ
                            </h5>
                            <p className="text-gray-400 text-sm mb-1">
                                📧 lms@cntt.edu.vn
                            </p>
                            <p className="text-gray-400 text-sm">
                                📞 (024) 1234 5678
                            </p>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
                        <p>© 2024 LMS Khoa CNTT. All rights reserved.</p>
                    </div>
                </div>
            </Footer>
        </Layout>
    );
};

export default MainLayout;
