import React, { useEffect, useMemo, useState } from "react";
import {
    Card,
    Col,
    Row,
    Typography,
    Statistic,
    Table,
    Button,
    Spin,
    Tag,
    Empty,
    message,
    Space,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
    BookOutlined,
    TeamOutlined,
    RiseOutlined,
    TagsOutlined,
    AppstoreOutlined,
    RightOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { courseService } from "../../services/course.service";
import { authService } from "../../services/auth.service";
import { majorService } from "../../services/major.service";
import { categoryService } from "../../services/category.service";
import { normalizeMediaUrl } from "../../utils/mediaUrl";
import { useAuthStore } from "../../store/useAuthStore";

const { Title, Text, Paragraph } = Typography;

type OverviewCounts = {
    courses: number;
    published: number;
    draft: number;
    users: number;
    majors: number;
    categories: number;
};

interface RecentCourse {
    key: string;
    title: string;
    status: string;
    thumbnail: string;
    updated_at: string | null;
}

function coursePaginationTotal(courseRes: unknown): number {
    const r =
        courseRes &&
        typeof courseRes === "object" &&
        "data" in courseRes
            ? (
                  courseRes as {
                      data?: {
                          result?: { pagination?: { total?: unknown } };
                      };
                  }
              ).data?.result?.pagination?.total
            : undefined;
    const n = typeof r === "number" ? r : Number(r ?? 0);
    return Number.isFinite(n) ? n : 0;
}

function userPaginationTotal(authBody: unknown): number {
    const r =
        authBody &&
        typeof authBody === "object" &&
        "result" in authBody
            ? (
                  authBody as {
                      result?: { pagination?: { total?: unknown } };
                  }
              ).result?.pagination?.total
            : undefined;
    const n = typeof r === "number" ? r : Number(r ?? 0);
    return Number.isFinite(n) ? n : 0;
}

function mcTotal(res: unknown): number {
    if (res && typeof res === "object" && "total" in res) {
        const t = (
            res as { total?: unknown }
        ).total;
        const n = typeof t === "number" ? t : Number(t ?? 0);
        return Number.isFinite(n) ? n : 0;
    }
    return 0;
}

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [counts, setCounts] = useState<OverviewCounts>({
        courses: 0,
        published: 0,
        draft: 0,
        users: 0,
        majors: 0,
        categories: 0,
    });
    const [recentCourses, setRecentCourses] = useState<RecentCourse[]>([]);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const nextCounts: OverviewCounts = {
                courses: 0,
                published: 0,
                draft: 0,
                users: 0,
                majors: 0,
                categories: 0,
            };

            try {
                const settled = await Promise.allSettled([
                    courseService.getCourses({ page: 1, pageSize: 1 }),
                    courseService.getCourses({
                        page: 1,
                        pageSize: 1,
                        status: "published",
                    }),
                    courseService.getCourses({
                        page: 1,
                        pageSize: 1,
                        status: "draft",
                    }),
                    authService.getListUser({
                        page: 1,
                        pageSize: 1,
                        search: "",
                        role: "",
                    }),
                    majorService.getMajors({ page: 1, pageSize: 1 }),
                    categoryService.getCategories({ page: 1, pageSize: 1 }),
                ]);

                nextCounts.courses =
                    settled[0].status === "fulfilled"
                        ? coursePaginationTotal(settled[0].value)
                        : 0;
                nextCounts.published =
                    settled[1].status === "fulfilled"
                        ? coursePaginationTotal(settled[1].value)
                        : 0;
                nextCounts.draft =
                    settled[2].status === "fulfilled"
                        ? coursePaginationTotal(settled[2].value)
                        : 0;
                nextCounts.users =
                    settled[3].status === "fulfilled"
                        ? userPaginationTotal(settled[3].value)
                        : 0;
                nextCounts.majors =
                    settled[4].status === "fulfilled"
                        ? mcTotal(settled[4].value)
                        : 0;
                nextCounts.categories =
                    settled[5].status === "fulfilled"
                        ? mcTotal(settled[5].value)
                        : 0;

                if (settled.every((s) => s.status !== "fulfilled"))
                    message.warning(
                        "Một số số liệu không tải được (kiểm tra API / quyền).",
                    );
            } catch {
                message.error("Không tải được tổng quan admin.");
            } finally {
                setCounts(nextCounts);
            }

            try {
                const res = await courseService.getCourses({
                    page: 1,
                    pageSize: 8,
                });
                const raw =
                    (res as { data?: { result?: { data?: unknown } } }).data
                        ?.result?.data;
                const list = Array.isArray(raw)
                    ? (raw as Record<string, unknown>[])
                    : [];

                const rows = list.flatMap((row): RecentCourse[] => {
                        const key = String(
                            row.course_id ??
                                row.id ??
                                "",
                        );
                        if (!key) return [];
                        return [
                            {
                                key,
                                title: String(row.title ?? ""),
                                status: String(row.status ?? "—"),
                                thumbnail: normalizeMediaUrl(
                                    String(
                                        row.thumbnail_url ??
                                            row.thumbnail ??
                                            "",
                                    ),
                                ),
                                updated_at:
                                    typeof row.updated_at === "string"
                                        ? row.updated_at
                                        : null,
                            },
                        ];
                    });
                setRecentCourses(rows);
            } catch {
                setRecentCourses([]);
            }

            setLoading(false);
        })();
    }, []);

    const greeting = useMemo(() => {
        const name = `${String(user?.first_name ?? "").trim()} ${String(user?.last_name ?? "").trim()}`.trim();
        return name || String(user?.email ?? "Admin");
    }, [user]);

    const statCard = {
        borderRadius: 14,
        boxShadow:
            "0 1px 2px rgba(15,23,42,0.06), 0 0 1px rgba(15,23,42,0.08)",
        border: "1px solid #eef2ff",
        height: "100%",
    } as React.CSSProperties;

    const shortcuts = [
        {
            title: "Khóa học",
            icon: <BookOutlined style={{ fontSize: 22, color: "#2563eb" }} />,
            path: "/admin/v1/courses",
            desc: "Tạo, chỉnh sửa, xuất bản khóa",
        },
        {
            title: "Người dùng",
            icon: <TeamOutlined style={{ fontSize: 22, color: "#0d9488" }} />,
            path: "/admin/v1/user-management",
            desc: "Tài khoản và phân vai",
        },
        {
            title: "Bài giảng",
            icon: <RiseOutlined style={{ fontSize: 22, color: "#7c3aed" }} />,
            path: "/admin/v1/lesson-management",
            desc: "Nội dung & curriculum",
        },
        {
            title: "Danh mục & ngành",
            icon: <AppstoreOutlined style={{ fontSize: 22, color: "#ea580c" }} />,
            path: "/admin/v1/category-management",
            desc: "Danh mục và chuyên ngành",
        },
    ];

    const columns: ColumnsType<RecentCourse> = [
        {
            title: "Khóa học",
            dataIndex: "title",
            key: "title",
            render: (_, record) => (
                <Space>
                    <div className="h-10 w-14 shrink-0 overflow-hidden rounded-md bg-slate-100">
                        <img
                            alt=""
                            src={
                                record.thumbnail ||
                                "https://placehold.co/112x72/eef2ff/334155?text=LMS"
                            }
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="min-w-0">
                        <button
                            type="button"
                            className="line-clamp-2 max-w-[240px] text-left font-medium text-slate-800 hover:text-blue-600 bg-transparent cursor-pointer border-0 p-0"
                            onClick={() =>
                                navigate(
                                    `/admin/v1/courses/${record.key}/contents`,
                                )
                            }
                        >
                            {record.title || "Khóa không tên"}
                        </button>
                    </div>
                </Space>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 120,
            render: (s: string) => (
                <Tag color={s === "published" ? "green" : "default"}>
                    {s === "published" ? "Xuất bản" : "Bản nháp"}
                </Tag>
            ),
        },
        {
            title: "Cập nhật",
            dataIndex: "updated_at",
            key: "updated_at",
            width: 118,
            render: (v: string | null) =>
                typeof v === "string" ? v.slice(0, 10) : "—",
        },
        {
            title: "",
            key: "act",
            width: 94,
            render: () => (
                <Button type="link" onClick={() => navigate("/admin/v1/courses")}>
                    Mở
                    <RightOutlined className="text-xs" />
                </Button>
            ),
        },
    ];

    return (
        <div className="admin-dashboard-scope">
            {loading ?
                <Spin className="my-24 block w-full text-center" />
            :   <>
                    <Row align="middle" justify="space-between" className="mb-6 flex-wrap gap-4">
                        <Col flex="auto">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                <TagsOutlined style={{ fontSize: 24, color: "#4f46e5" }} />
                                <Title level={3} style={{ margin: 0 }}>
                                    Tổng quan
                                </Title>
                            </div>
                            <Paragraph className="!mb-0 text-slate-600">
                                Xin chào <strong>{greeting}</strong> — số liệu
                                được lấy từ các API đang dùng cho trang quản trị.
                            </Paragraph>
                        </Col>
                        <Col>
                            <Button
                                type="primary"
                                size="middle"
                                className="bg-indigo-600"
                                icon={<BookOutlined />}
                                onClick={() => navigate("/admin/v1/courses")}
                            >
                                Vào quản lý khóa
                            </Button>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]} className="mb-6">
                        <Col xs={24} sm={12} xl={8}>
                            <Card style={{ ...statCard, background: "#f8fafc" }}>
                                <Statistic
                                    title={<span>Tổng khóa học</span>}
                                    value={counts.courses}
                                    prefix={<BookOutlined className="text-blue-600" />}
                                />
                                <Text type="secondary" className="text-xs mt-4 block">
                                    Đăng xuất bản: {counts.published} · Nháp:{" "}
                                    {counts.draft}
                                </Text>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} xl={8}>
                            <Card style={{ ...statCard }}>
                                <Statistic
                                    title={<span>Người dùng</span>}
                                    value={counts.users}
                                    prefix={
                                        <TeamOutlined className="text-teal-600" />
                                    }
                                />
                                <Text type="secondary" className="text-xs mt-4 block">
                                    Theo phân trang API danh sách user
                                </Text>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} xl={8}>
                            <Card style={{ ...statCard }}>
                                <Row gutter={[8, 8]}>
                                    <Col span={12}>
                                        <Statistic
                                            title={<span>Chuyên ngành</span>}
                                            value={counts.majors}
                                            prefix={
                                                <RiseOutlined className="text-violet-600" />
                                            }
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Statistic
                                            title={<span>Danh mục</span>}
                                            value={counts.categories}
                                            prefix={
                                                <TagsOutlined className="text-orange-600" />
                                            }
                                        />
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>

                    <Title level={5} className="!mb-3">
                        Đường tắt
                    </Title>
                    <Row gutter={[16, 16]} className="mb-8">
                        {shortcuts.map((s) => (
                            <Col xs={24} sm={12} lg={6} key={s.path}>
                                <Card
                                    hoverable
                                    style={{
                                        ...statCard,
                                        cursor: "pointer",
                                        borderColor: "#e2e8f0",
                                    }}
                                    styles={{ body: { padding: 18 } }}
                                    onClick={() => navigate(s.path)}
                                >
                                    <div className="mb-2">{s.icon}</div>
                                    <Title level={5} className="!mb-1 !text-[16px]">
                                        {s.title}
                                    </Title>
                                    <Text type="secondary" className="text-sm">
                                        {s.desc}
                                    </Text>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <Card
                        title={<span>Cập nhật gần đây</span>}
                        bordered={false}
                        style={{
                            borderRadius: 14,
                            boxShadow:
                                "0 1px 2px rgba(15,23,42,0.06), 0 0 1px rgba(15,23,42,0.08)",
                        }}
                        styles={{ header: { fontWeight: 600 } }}
                        extra={
                            <Button
                                type="link"
                                icon={<BookOutlined />}
                                onClick={() => navigate("/admin/v1/courses")}
                            >
                                Tất cả khóa
                            </Button>
                        }
                    >
                        {recentCourses.length === 0 ?
                            <Empty description="Không có dữ liệu khóa học hoặc lỗi tải" />
                        :   <Table<RecentCourse>
                                size="middle"
                                rowKey="key"
                                pagination={false}
                                columns={columns}
                                dataSource={recentCourses}
                            />
                        }
                    </Card>
                </>
            }
        </div>
    );
};

export default AdminDashboard;
