import React, { useState } from "react";
import {
    DashboardOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    OrderedListOutlined,
    ProfileOutlined,
    SettingOutlined,
    ShoppingOutlined,
    TagOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
    Avatar,
    Breadcrumb,
    Button,
    Dropdown,
    Layout,
    Menu,
    Space,
    theme,
} from "antd";
import { useAuthStore } from "../store/useAuthStore";

const { Header, Sider, Content } = Layout;

/** Ant Design Menu chỉ nhận `selectedKeys`; map URL → item key của sidebar admin. */
function sidebarSelectedKeys(pathname: string): string[] {
    if (pathname === "/admin/dashboard") return ["1"];
    if (pathname.startsWith("/admin/v1/courses")) return ["2"];
    if (
        pathname.startsWith("/admin/v1/lesson-management") ||
        pathname.startsWith("/admin/v1/lesson-detail")
    )
        return ["3"];
    if (pathname.startsWith("/admin/v1/user-management")) return ["4"];
    if (pathname.startsWith("/admin/v1/role-management")) return ["5"];
    if (pathname.startsWith("/admin/v1/major-management")) return ["6"];
    if (pathname.startsWith("/admin/v1/category-management")) return ["7"];
    return [];
}

const AdminLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuthStore();

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const menuItems = [
        {
            key: "1",
            icon: <DashboardOutlined />,
            label: "Tổng quan",
            roles: ["admin", "user"],
        },
        {
            key: "2",
            icon: <ShoppingOutlined />,
            label: "Quản lý khóa học",
            roles: ["admin", "user"],
        },
        {
            key: "3",
            icon: <OrderedListOutlined />,
            label: "Quản lý bài giảng",
            roles: ["admin", "user"],
        },
        {
            key: "4",
            icon: <UserOutlined />,
            label: "Quản lý người dùng",
            roles: ["admin", "user"],
        },
        {
            key: "5",
            icon: <TagOutlined />,
            label: "Quản lý vai trò",
            roles: ["user"],
        },
        {
            key: "6",
            icon: <TagOutlined />,
            label: "Quản lý chuyên ngành",
            roles: ["admin", "user"],
        },
        {
            key: "7",
            icon: <SettingOutlined />,
            label: "Quản lý danh mục",
            roles: ["admin", "user"],
        },
        {
            key: "8",
            icon: <SettingOutlined />,
            label: "Cài đặt",
            roles: ["admin"],
        },
    ];

    const userRoles = user?.roles || [];

    const filteredMenu = menuItems.filter((item) =>
        item.roles?.some((role: string) => userRoles.includes(role)),
    );

    // const filteredMenuItems = menuItems.filter((item) =>
    //     item.roles.includes(userRole)
    // );

    const handleMenuClick = ({ key }: { key: string }) => {
        switch (key) {
            case "1":
                navigate("/admin/dashboard");
                break;
            case "2":
                navigate("/admin/v1/courses");
                break;
            case "3":
                navigate("/admin/v1/lesson-management");
                break;
            case "4":
                navigate("/admin/v1/user-management");
                break;
            case "5":
                navigate("/admin/v1/role-management");
                break;
            case "6":
                navigate("/admin/v1/major-management");
                break;
            case "7":
                navigate("/admin/v1/category-management");
                break;
            case "8":
                navigate("/feedbacks");
                break;
            default:
                break;
        }
    };

    const userMenuItems = [
        {
            key: "profile",
            icon: <ProfileOutlined />,
            label: "Hồ sơ",
            onClick: () => navigate("/admin/v1/profile"),
        },
        {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Đăng xuất",
            danger: true,
            onClick: async () => {
                await logout();
                navigate("/auth/admin/login");
            },
        },
    ];

    return (
        <Layout style={{ minHeight: "100vh" }}>
            {/* Sidebar */}
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                theme="dark"
                width={250}
                style={{
                    overflow: "auto",
                    height: "100vh",
                    position: "sticky",
                    insetInlineStart: 0,
                    top: 0,
                    bottom: 0,
                    scrollbarWidth: "thin",
                    scrollbarGutter: "stable",
                }}
            >
                <div className="p-4 text-white text-center border-b border-gray-700">
                    <h1
                        className={`font-bold text-xl ${
                            collapsed ? "text-lg" : "text-xl"
                        }`}
                    >
                        {collapsed ? "A" : "Admin Panel"}
                    </h1>
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={sidebarSelectedKeys(location.pathname)}
                    items={filteredMenu}
                    onClick={handleMenuClick}
                    // onClick={({ key }) => (window.location.href = key)}
                />
            </Sider>

            <Layout>
                {/* Header */}
                <Header
                    style={{
                        padding: "0 16px",
                        background: colorBgContainer,
                        display: "flex",
                        alignItems: "center",
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                        justifyContent: "space-between",
                        boxShadow: "0 1px 4px rgba(0,21,41,.08)",
                    }}
                >
                    <div className="flex items-center">
                        <Button
                            type="text"
                            icon={
                                collapsed ? (
                                    <MenuUnfoldOutlined />
                                ) : (
                                    <MenuFoldOutlined />
                                )
                            }
                            onClick={() => setCollapsed(!collapsed)}
                            style={{ fontSize: "16px", width: 64, height: 64 }}
                        />

                        <Breadcrumb style={{ margin: "0 16px" }}>
                            {/* {getBreadcrumbItems()} */}
                        </Breadcrumb>
                    </div>

                    <Space>
                        <Dropdown
                            menu={{
                                items: userMenuItems,
                                onClick: ({ key }) => {
                                    if (key === "logout") {
                                        // Handle logout
                                        console.log("Logout");
                                    }
                                },
                            }}
                            placement="bottomRight"
                            arrow
                        >
                            <Button
                                type="text"
                                className="flex items-center gap-2"
                            >
                                <Avatar size="small" icon={<UserOutlined />} />
                                <span>Admin User</span>
                            </Button>
                        </Dropdown>
                    </Space>
                </Header>

                {/* Main Content */}
                <Content
                    style={{
                        margin: "24px 16px",
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;
