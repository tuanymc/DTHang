import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, Typography } from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { hasAdminRole } from "../../utils/hasAdminRole";
import { toast } from "sonner";

const { Title, Text } = Typography;

interface LoginFormValues {
    username: string;
    password: string;
}


const AuthAdmin: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);

    const { login, logout, isAuthenticated, user, hasFetched, isLoading } =
        useAuthStore();

    useEffect(() => {
        const st = location.state as { forbidden?: boolean } | null;
        if (st?.forbidden) {
            toast.error("Tài khoản không có quyền truy cập trang quản trị.");
            navigate(location.pathname, { replace: true, state: null });
        }
    }, [location.pathname, location.state, navigate]);

    useEffect(() => {
        if (!hasFetched || isLoading) return;
        if (isAuthenticated && hasAdminRole(user)) {
            navigate("/admin/dashboard", { replace: true });
        }
    }, [hasFetched, isLoading, isAuthenticated, user, navigate]);

    const onFinish = async (values: LoginFormValues) => {
        setLoading(true);

        // Giả lập gọi API kiểm tra đăng nhập
        try {
            await login({
                email: values.username,
                password: values.password,
            });

            const { user } = useAuthStore.getState(); // 👈 lấy state mới nhất

            if (!hasAdminRole(user)) {
                await logout();
                toast.error("Bạn không có quyền admin!");
                return;
            }

            toast.success("Đăng nhập admin thành công!");
            navigate("/admin/dashboard");
        } catch (err: any) {
            toast.error('Sai tài khoản hoặc mật khẩu!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md rounded-2xl shadow-xl border-0">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                        <LoginOutlined className="text-white text-2xl" />
                    </div>
                    <Title level={2} className="!mb-1">
                        Admin Login
                    </Title>
                    <Text type="secondary">
                        Đăng nhập vào hệ thống quản trị LMS
                    </Text>
                </div>

                <Form
                    name="admin_login"
                    layout="vertical"
                    onFinish={onFinish}
                    autoComplete="off"
                    size="large"
                >
                    <Form.Item
                        name="username"
                        label="Tên đăng nhập"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập tên đăng nhập!",
                            },
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined className="text-gray-400" />}
                            placeholder="admin"
                            className="rounded-lg"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Mật khẩu"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập mật khẩu!",
                            },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="text-gray-400" />}
                            placeholder="••••••"
                            className="rounded-lg"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            className="bg-blue-600 hover:bg-blue-700 h-12 text-base font-semibold rounded-lg"
                        >
                            Đăng nhập
                        </Button>
                    </Form.Item>

                    <div className="text-center text-gray-400 text-sm">
                        <Text type="secondary">
                            Tài khoản demo: admin / admin123
                        </Text>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default AuthAdmin;
