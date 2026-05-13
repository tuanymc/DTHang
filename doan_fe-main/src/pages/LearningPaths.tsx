import React, { useEffect, useState } from "react";
import {
    Card,
    Row,
    Col,
    Typography,
    Button,
    Tag,
    Spin,
    Empty,
    message,
} from "antd";
import {
    TeamOutlined,
    ShoppingCartOutlined,
    BookOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import {
    courseService,
    type LearningPathDto,
} from "../services/course.service";
import { useAuthStore } from "../store/useAuthStore";

const { Title, Text, Paragraph } = Typography;

const fmtMoney = (n: number) =>
    `${Number.isFinite(n) ? Math.round(Number(n)).toLocaleString("vi-VN") : "0"} đ`;

const LearningPaths: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [paths, setPaths] = useState<LearningPathDto[]>([]);
    const [buyingId, setBuyingId] = useState<string | null>(null);

    useEffect(() => {
        let c = false;
        (async () => {
            setLoading(true);
            try {
                const rows = await courseService.listLearningPaths();
                if (!c) setPaths(rows.filter((p) => p.course_ids?.length > 0));
            } catch {
                if (!c) message.error("Không tải được lộ trình.");
            } finally {
                if (!c) setLoading(false);
            }
        })();
        return () => {
            c = true;
        };
    }, []);

    const handleBuy = async (pathId: string) => {
        if (!isAuthenticated) {
            message.warning("Đăng nhập để mua combo lộ trình.");
            navigate("/auth/login", { state: { from: location } });
            return;
        }
        setBuyingId(pathId);
        try {
            await courseService.purchaseBundle(pathId);
            message.success(
                "Đã ghi danh các khóa trong lộ trình (thanh toán demo).",
            );
            navigate("/my-courses");
        } catch (e: unknown) {
            const msg =
                (e as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message ?? "Không thể mua combo.";
            message.error(msg);
        } finally {
            setBuyingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-24">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8">
            <div className="mb-8">
                <Title level={2}>Combo lộ trình</Title>
                <Paragraph type="secondary" className="!mb-0 max-w-2xl">
                    Các gói khóa theo nhóm đối tượng (audience): mua một lần —
                    được ghi danh đầy đủ toàn bộ khóa trong lộ trình.
                </Paragraph>
            </div>

            {paths.length === 0 ? (
                <Empty description="Chưa có lộ trình được xuất bản." />
            ) : (
                <Row gutter={[20, 20]}>
                    {paths.map((p) => (
                        <Col xs={24} md={12} lg={8} key={p.id}>
                            <Card
                                className="h-full rounded-2xl shadow-sm border-gray-100"
                                title={
                                    <span className="line-clamp-2 text-[15px] leading-snug">
                                        {p.title}
                                    </span>
                                }
                                actions={[
                                    <Button
                                        key="buy"
                                        type="primary"
                                        block
                                        className="!rounded-none bg-blue-600"
                                        icon={<ShoppingCartOutlined />}
                                        loading={buyingId === p.id}
                                        onClick={() => handleBuy(p.id)}
                                    >
                                        Mua combo
                                    </Button>,
                                ]}
                            >
                                <div className="space-y-3">
                                    {p.audience_tag ?
                                        <Tag
                                            icon={<TeamOutlined />}
                                            color="geekblue"
                                        >
                                            {p.audience_tag}
                                        </Tag>
                                    :   <Tag>Mọi đối tượng</Tag>}
                                    <div>
                                        <Text className="text-2xl font-bold text-blue-700">
                                            {fmtMoney(Number(p.bundle_price))}
                                        </Text>
                                        <Text
                                            type="secondary"
                                            className="block text-xs mt-1"
                                        >
                                            Giá combo (demo)
                                        </Text>
                                    </div>
                                    {p.description ?
                                        <Paragraph
                                            className="!mb-0 text-sm text-gray-600 line-clamp-3"
                                        >
                                            {p.description}
                                        </Paragraph>
                                    :   null}
                                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                                        <BookOutlined />
                                        <span>
                                            Gồm {p.course_ids.length} khóa học
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

export default LearningPaths;
