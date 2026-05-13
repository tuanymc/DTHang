import React, { useEffect, useRef, useState } from "react";
import {
    Form,
    Input,
    Button,
    Tabs,
    message,
    Row,
    Col,
    Typography,
    Card,
} from "antd";
import {
    UserOutlined,
    LockOutlined,
    MailOutlined,
    TeamOutlined,
} from "@ant-design/icons";
import "./AuthPage.css"; // Custom styles nếu cần
import logo from "../../../public/Logo_Trường_Đại_học_Sư_phạm_Kỹ_thuật_Hưng_Yên.svg";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "../../store/useAuthStore";
import { authService } from "../../services/auth.service";

const { Title, Text, Paragraph } = Typography;

const AuthPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<"login" | "register">("login");
    const [loginForm] = Form.useForm();
    const [registerForm] = Form.useForm();
    const location = useLocation();
    const hasShown = useRef(false);

    const { login } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state?.needLogin && !hasShown.current) {
            toast.error("Vui lòng đăng nhập để sử dụng hệ thống!");

            hasShown.current = true;
        }
    }, []);

    // Xử lý đăng nhập
    const handleLogin = async (values: any) => {
        try {
            await login(values);

            toast.success("Đăng nhập thành công!");

            // 👉 redirect về trang trước đó
            const from = location.state?.from?.pathname || "/";
            navigate(from, { replace: true });
        } catch (error: any) {
            toast.error("Sai email hoặc mật khẩu!");
        }
    };

    // Xử lý đăng ký
    const handleRegister = async (values: any) => {
        const { password, confirmPassword } = values;
        if (password !== confirmPassword) {
            message.error("Mật khẩu xác nhận không khớp!");
            return;
        }
        console.log("Register values:", values);
        // Gọi API register tại đây
        const payload = {
            email: values.email,
            password_hash: values.password,
            first_name: values.firstName,
            last_name: values.lastName,
            role_id: '6781b786-bb4e-4855-a433-f134236b2256',
        };

        const result = await authService.register(payload);
        if (result) {
            console.log("result", result);
            toast.success("Đăng ký thành công. Vui lòng đăng nhập để sử dụng hệ thống!")
            setActiveTab("login");
            registerForm.resetFields();
        } else {
            console.log("result", result);
            toast.success("Đăng ký không thành công. Vui lòng kiểm tra lại thông tin!");
            registerForm.resetFields();
        }

    };

    // Nội dung tab Login
    const loginContent = (
        <Form
            form={loginForm}
            layout="vertical"
            onFinish={handleLogin}
            className="auth-form"
        >
            <Form.Item
                name="email"
                label="Email"
                rules={[
                    { required: true, message: "Vui lòng nhập email!" },
                    { type: "email", message: "Email không hợp lệ!" },
                ]}
            >
                <Input
                    prefix={<MailOutlined className="text-gray-400" />}
                    size="large"
                    placeholder="example@lms.edu.vn"
                    className="rounded-lg"
                />
            </Form.Item>

            <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
                <Input.Password
                    prefix={<LockOutlined className="text-gray-400" />}
                    size="large"
                    placeholder="••••••••"
                    className="rounded-lg"
                />
            </Form.Item>

            <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    className="h-11 text-base font-semibold rounded-xl shadow-md bg-blue-600 hover:bg-blue-700"
                >
                    Đăng nhập
                </Button>
            </Form.Item>

            <div className="text-center mt-2">
                <Text type="secondary">
                    Chưa có tài khoản?{" "}
                    <Button
                        type="link"
                        onClick={() => setActiveTab("register")}
                        className="p-0"
                    >
                        Đăng ký ngay
                    </Button>
                </Text>
            </div>
        </Form>
    );

    // Nội dung tab Register
    const registerContent = (
        <Form
            form={registerForm}
            layout="vertical"
            onFinish={handleRegister}
            className="auth-form"
        >
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="lastName"
                        label="Họ"
                        rules={[
                            { required: true, message: "Vui lòng nhập họ!" },
                        ]}
                    >
                        <Input
                            size="large"
                            placeholder="Nguyễn"
                            className="rounded-lg"
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="firstName"
                        label="Tên"
                        rules={[
                            { required: true, message: "Vui lòng nhập tên!" },
                        ]}
                    >
                        <Input
                            size="large"
                            placeholder="Văn A"
                            className="rounded-lg"
                        />
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
                <Input
                    prefix={<MailOutlined className="text-gray-400" />}
                    size="large"
                    placeholder="student@lms.edu.vn"
                    className="rounded-lg"
                />
            </Form.Item>

            <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu!" },
                    { min: 6, message: "Mật khẩu tối thiểu 6 ký tự!" },
                ]}
            >
                <Input.Password
                    prefix={<LockOutlined className="text-gray-400" />}
                    size="large"
                    placeholder="Tạo mật khẩu"
                    className="rounded-lg"
                />
            </Form.Item>

            <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu"
                dependencies={["password"]}
                rules={[
                    { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue("password") === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(
                                new Error("Mật khẩu xác nhận không khớp!"),
                            );
                        },
                    }),
                ]}
            >
                <Input.Password
                    prefix={<LockOutlined className="text-gray-400" />}
                    size="large"
                    placeholder="Nhập lại mật khẩu"
                    className="rounded-lg"
                />
            </Form.Item>

            <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    className="h-11 text-base font-semibold rounded-xl shadow-md bg-green-600 hover:bg-green-700"
                >
                    Đăng ký tài khoản
                </Button>
            </Form.Item>

            <div className="text-center mt-2">
                <Text type="secondary">
                    Đã có tài khoản?{" "}
                    <Button
                        type="link"
                        onClick={() => setActiveTab("login")}
                        className="p-0"
                    >
                        Đăng nhập ngay
                    </Button>
                </Text>
            </div>
        </Form>
    );

    const tabItems = [
        {
            key: "login",
            label: <span className="text-base font-semibold">Đăng nhập</span>,
            children: loginContent,
        },
        {
            key: "register",
            label: <span className="text-base font-semibold">Đăng ký</span>,
            children: registerContent,
        },
    ];

    return (
        <div className="auth-wrapper min-h-screen w-full flex items-center justify-center p-4">
            <div className="container max-w-6xl mx-auto">
                <Card className="auth-card overflow-hidden shadow-2xl rounded-2xl border-0 bg-white/95 backdrop-blur-sm">
                    <Row gutter={0} className="min-h-[580px] md:min-h-[620px]">
                        {/* Left side - Logo & Branding */}
                        <Col
                            xs={24}
                            md={12}
                            className="bg-linear-to-br bg-[#00a859] text-white flex flex-col justify-center items-center p-8 md:p-10"
                        >
                            <div className="text-center max-w-full">
                                <div className="mb-6 flex justify-center">
                                    <div className="flex items-center justify-center">
                                        {/* <GraduationCapOutlined className="text-5xl text-white" /> */}
                                        <img src={logo} alt="" width={140} />
                                    </div>
                                </div>
                                <Title
                                    level={1}
                                    className="!text-white !mb-3 text-3xl md:text-4xl font-bold"
                                >
                                    LMS Education
                                </Title>
                                <Paragraph className="text-blue-100 text-base">
                                    Hệ thống quản lý học tập thông minh, kết nối
                                    giảng viên và học viên mọi lúc, mọi nơi.
                                </Paragraph>

                                <div className="mt-8 space-y-3 text-left">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center">
                                            <UserOutlined className="text-white text-xs" />
                                        </div>
                                        <span>
                                            Hơn 10,000+ học viên tin dùng
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center">
                                            <TeamOutlined className="text-white text-xs" />
                                        </div>
                                        <span>
                                            500+ khóa học chất lượng cao
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center">
                                            {/* <GraduationCapOutlined className="text-white text-xs" /> */}
                                        </div>
                                        <span>
                                            Chứng chỉ uy tín, được công nhận
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Col>

                        {/* Right side - Auth Form */}
                        <Col
                            xs={24}
                            md={12}
                            className="bg-white/90 flex flex-col justify-center p-6 sm:p-8 lg:p-10"
                        >
                            <div className="w-full max-w-md mx-auto">
                                <div className="text-center mb-6">
                                    <Title
                                        level={3}
                                        className="mb-1! text-gray-800"
                                    >
                                        {activeTab === "login"
                                            ? "Hệ thống đào tạo trực tuyến"
                                            : "Bắt đầu hành trình học tập"}
                                    </Title>
                                    <Text type="secondary" className="text-sm">
                                        {activeTab === "login"
                                            ? "Đăng nhập để tiếp tục học tập"
                                            : "Điền thông tin để tạo tài khoản LMS"}
                                    </Text>
                                </div>

                                <Tabs
                                    activeKey={activeTab}
                                    onChange={(key) =>
                                        setActiveTab(
                                            key as "login" | "register",
                                        )
                                    }
                                    centered
                                    size="large"
                                    items={tabItems}
                                    className="auth-tabs"
                                    tabBarGutter={32}
                                />

                                <div className="mt-6 text-center text-gray-400 text-xs">
                                    <span>
                                        Bằng việc đăng ký, bạn đồng ý với{" "}
                                    </span>
                                    <a
                                        href="#"
                                        className="text-blue-600 hover:underline"
                                    >
                                        Điều khoản
                                    </a>
                                    <span> và </span>
                                    <a
                                        href="#"
                                        className="text-blue-600 hover:underline"
                                    >
                                        Chính sách bảo mật
                                    </a>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Card>
            </div>
        </div>
    );
};

export default AuthPage;
