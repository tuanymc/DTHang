import React, { useEffect, useMemo, useState } from "react";
import {
    Card,
    Row,
    Col,
    Typography,
    Button,
    Progress,
    Statistic,
    Empty,
    Spin,
    Badge,
    List,
    Tag,
    message,
    Avatar,
} from "antd";
import {
    BookOutlined,
    CheckCircleOutlined,
    HeartOutlined,
    RightOutlined,
    UserOutlined,
    RocketOutlined,
    FireOutlined,
    ArrowRightOutlined,
    SafetyCertificateOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { courseService, type CertificateRowDto } from "../services/course.service";
import { normalizeMediaUrl } from "../utils/mediaUrl";
import { useAuthStore } from "../store/useAuthStore";

const { Title, Text, Paragraph } = Typography;

type UiStatus = "in_progress" | "completed";

interface UiCourseRow {
    id: string;
    title: string;
    instructor: string;
    thumbnail: string;
    progress: number;
    status: UiStatus;
    enrolledAt?: string | null;
}

interface WishPeek {
    course_id: string;
    title: string;
    thumbnail: string;
}

interface FeaturedRow {
    id?: string;
    course_id?: string;
    title?: string;
    thumbnail_url?: string;
    thumbnail?: string;
    enrolled_count?: number;
}

function mapEnrollment(e: Record<string, unknown>): UiCourseRow | null {
    const id = String(e.course_id ?? "");
    if (!id) return null;
    const pct = Number(e.progress_percent ?? 0);
    const status = pct >= 100 ? "completed" : "in_progress";
    const inst = `${String(e.inst_fn ?? "").trim()} ${String(e.inst_ln ?? "").trim()}`.trim();
    return {
        id,
        title: String((e.title as string) ?? ""),
        instructor: inst || String(e.inst_email ?? "Giảng viên"),
        thumbnail: normalizeMediaUrl(String((e.thumbnail_url as string) ?? "")),
        progress: pct,
        status,
        enrolledAt: typeof e.enrolled_at === "string" ? e.enrolled_at : null,
    };
}

function featuredId(course: FeaturedRow): string {
    return String(course.id ?? course.course_id ?? "");
}

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [loading, setLoading] = useState(true);
    const [enrolled, setEnrolled] = useState<UiCourseRow[]>([]);
    const [wishPeek, setWishPeek] = useState<WishPeek[]>([]);
    const [wishlistTotal, setWishlistTotal] = useState(0);
    const [suggested, setSuggested] = useState<FeaturedRow[]>([]);
    const [certificates, setCertificates] = useState<CertificateRowDto[]>(
        [],
    );

    useEffect(() => {
        let cancelled = false;

        const loadFeatured = async (): Promise<FeaturedRow[]> => {
            try {
                const res = await courseService.getPopularCourse(12);
                const row = res?.result as
                    | { get_featured_courses?: FeaturedRow[] }
                    | undefined;
                const list = Array.isArray(row?.get_featured_courses)
                    ? row!.get_featured_courses!
                    : [];
                return list.filter((x) => featuredId(x));
            } catch {
                return [];
            }
        };

        (async () => {
            setLoading(true);
            try {
                const [enrRes, wishRes, popular, certRes] =
                    await Promise.all([
                        courseService.myEnrollments(),
                        courseService.myWishlist(),
                        loadFeatured(),
                        courseService.myCertificates().catch(() => null),
                    ]);
                if (cancelled) return;

                const enrPayload = (
                    Array.isArray(enrRes?.data) ?
                        enrRes.data
                    :   []) as Record<string, unknown>[];
                const enrollRows = enrPayload
                    .map((x: Record<string, unknown>) => mapEnrollment(x))
                    .filter((x): x is UiCourseRow => !!x);

                const wishData = (
                    Array.isArray(wishRes?.data) ?
                        wishRes.data
                    :   []) as Record<string, unknown>[];
                const wishMapped: WishPeek[] = wishData
                    .map((r: Record<string, unknown>) => ({
                        course_id: String(r.course_id ?? ""),
                        title: String(r.title ?? ""),
                        thumbnail: normalizeMediaUrl(
                            String((r.thumbnail_url as string) ?? ""),
                        ),
                    }))
                    .filter((x: WishPeek) => !!x.course_id);

                const enrolledIds = new Set(enrollRows.map((c) => c.id));
                const wishIds = new Set(wishMapped.map((w) => w.course_id));

                const suggest = popular.filter((c) => {
                    const id = featuredId(c);
                    return id && !enrolledIds.has(id) && !wishIds.has(id);
                });

                const certPayload = (
                    certRes?.data ?
                        certRes.data
                    :   []
                ) as CertificateRowDto[];

                const certList =
                    Array.isArray(certPayload) ?
                        [...certPayload]
                            .sort(
                                (a, b) =>
                                    Number(
                                        new Date(b.issued_at).getTime() || 0,
                                    ) -
                                    Number(
                                        new Date(a.issued_at).getTime() ||
                                            0,
                                    ),
                            )
                            .slice(0, 6)
                    :   [];

                setEnrolled(enrollRows);
                setWishlistTotal(wishMapped.length);
                setWishPeek(wishMapped.slice(0, 8));
                setSuggested(suggest.slice(0, 6));
                setCertificates(certList);
            } catch {
                if (!cancelled) {
                    message.error("Không tải được bảng điều khiển.");
                    setEnrolled([]);
                    setWishlistTotal(0);
                    setWishPeek([]);
                    setSuggested([]);
                    setCertificates([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const stats = useMemo(() => {
        const total = enrolled.length;
        const inProg = enrolled.filter((c) => c.status === "in_progress").length;
        const done = enrolled.filter((c) => c.status === "completed").length;
        const avgPct =
            total === 0
                ? 0
                : Math.round(
                      enrolled.reduce((s, c) => s + c.progress, 0) / total,
                  );
        return {
            total,
            inProg,
            done,
            avgPct,
            wishCount: wishlistTotal,
        };
    }, [enrolled, wishlistTotal]);

    const continueList = useMemo(() => {
        const inProg = enrolled.filter((c) => c.status === "in_progress");
        const sorted =
            [...inProg].sort(
                (a, b) =>
                    Number(b.progress || 0) - Number(a.progress || 0),
            ) ?? [];
        if (sorted.length > 0) return sorted.slice(0, 4);
        return [...enrolled]
            .sort(
                (a, b) =>
                    Number(a.progress || 0) - Number(b.progress || 0),
            )
            .slice(0, 4);
    }, [enrolled]);

    const displayName = useMemo(() => {
        const fn = `${String(user?.first_name ?? "").trim()} ${String(user?.last_name ?? "").trim()}`.trim();
        return fn || String(user?.email ?? "học viên");
    }, [user]);

    const gotoLearn = (courseId: string) => {
        navigate(`/learning?courseId=${encodeURIComponent(courseId)}`);
    };

    const statCardStyle: React.CSSProperties = {
        borderRadius: 16,
        border: "1px solid #f0f0f0",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    };

    if (loading) {
        return (
            <div className="flex justify-center py-24">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 pb-14 pt-6">
            <Card
                bordered={false}
                className="mb-8 overflow-hidden border-0 shadow-md"
                styles={{ body: { padding: 0 } }}
            >
                <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 px-8 py-10 text-white md:py-12">
                    <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-16 left-1/4 h-40 w-40 rounded-full bg-cyan-300/20 blur-2xl" />
                    <Row gutter={[24, 24]} align="middle">
                        <Col xs={24} lg={14}>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm backdrop-blur">
                                <RocketOutlined /> Bảng điều khiển học viên
                            </div>
                            <Title level={2} className="!mt-2 !mb-2 !text-white">
                                Xin chào, {displayName}
                            </Title>
                            <Paragraph className="!mb-0 max-w-xl !text-blue-50/95 text-[15px]">
                                Theo dõi tiến độ khóa đã đăng ký, xem khóa yêu
                                thích và gợi ý học tiếp — tất cả tại một nơi.
                            </Paragraph>
                            <SpaceActions />
                        </Col>
                        <Col xs={24} lg={10}>
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <HeroMini
                                    icon={<BookOutlined />}
                                    label="Khóa đăng ký"
                                    value={stats.total}
                                />
                                <HeroMini
                                    icon={<CheckCircleOutlined />}
                                    label="Đã hoàn thành"
                                    value={stats.done}
                                />
                                <HeroMini
                                    icon={<FireOutlined />}
                                    label="Đang học"
                                    value={stats.inProg}
                                />
                                <HeroMini
                                    icon={<HeartOutlined />}
                                    label="Wishlist"
                                    value={stats.wishCount}
                                />
                            </div>
                        </Col>
                    </Row>
                </div>
            </Card>

            <Row gutter={[20, 20]} className="mb-8">
                <Col xs={12} md={6}>
                    <Card style={statCardStyle}>
                        <Statistic
                            title={
                                <span className="text-gray-600">
                                    Đăng ký tổng
                                </span>
                            }
                            value={stats.total}
                            prefix={<BookOutlined className="text-blue-600" />}
                        />
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card style={statCardStyle}>
                        <Statistic
                            title={
                                <span className="text-gray-600">Đang học</span>
                            }
                            value={stats.inProg}
                            prefix={<FireOutlined className="text-orange-500" />}
                        />
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card style={statCardStyle}>
                        <Statistic
                            title={
                                <span className="text-gray-600">
                                    Hoàn thành
                                </span>
                            }
                            value={stats.done}
                            prefix={
                                <CheckCircleOutlined className="text-green-600" />
                            }
                        />
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card style={statCardStyle}>
                        <Statistic
                            title={
                                <span className="text-gray-600">
                                    TB tiến độ
                                </span>
                            }
                            value={stats.avgPct}
                            suffix="%"
                            prefix={
                                <ArrowRightOutlined className="rotate-[-45deg] text-indigo-600" />
                            }
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <Title level={4} className="!mb-1">
                                Tiếp tục học
                            </Title>
                            <Text type="secondary">
                                Ưu tiên khóa đang học gần hoàn thành
                            </Text>
                        </div>
                        <Link to="/my-courses">
                            <Button type="link">
                                Danh sách đầy đủ{" "}
                                <RightOutlined className="text-xs" />
                            </Button>
                        </Link>
                    </div>
                    {continueList.length === 0 ? (
                        <Card className="rounded-2xl">
                            <Empty
                                description={
                                    <>
                                        Chưa có khóa nào.{" "}
                                        <Link to="/">Khám phá trang chủ</Link>
                                    </>
                                }
                            />
                        </Card>
                    ) : (
                        <Row gutter={[18, 18]}>
                            {continueList.map((c) => {
                                const isDone = c.progress >= 100;
                                const ribbon = isDone
                                    ? "Hoàn thành"
                                    : "Đang học";
                                const color = isDone ? "green" : "blue";
                                return (
                                    <Col xs={24} sm={12} key={c.id}>
                                        <Card
                                            hoverable
                                            className="h-full overflow-hidden rounded-2xl shadow-sm transition hover:shadow-md"
                                            styles={{ body: { padding: 14 } }}
                                        >
                                            <div className="flex gap-3">
                                                <div className="relative h-28 w-36 shrink-0 overflow-hidden rounded-xl">
                                                    <img
                                                        src={
                                                            c.thumbnail ||
                                                            "https://placehold.co/200x140/e8eef7/446?text=LMS"
                                                        }
                                                        alt=""
                                                        className="h-full w-full object-cover"
                                                    />
                                                    <Badge.Ribbon
                                                        text={ribbon}
                                                        color={color}
                                                        placement="start"
                                                        className="-left-px"
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <Title
                                                        level={5}
                                                        className="!mb-2 line-clamp-2 leading-snug !text-[15px]"
                                                    >
                                                        {c.title || "Khóa học"}
                                                    </Title>
                                                    <div className="mb-3 flex items-center gap-1 text-xs text-gray-500">
                                                        <UserOutlined />
                                                        <span className="truncate">
                                                            {c.instructor}
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        percent={Math.min(
                                                            100,
                                                            Math.round(
                                                                c.progress,
                                                            ),
                                                        )}
                                                        size="small"
                                                        status={
                                                            isDone
                                                                ? "success"
                                                                : "active"
                                                        }
                                                    />
                                                    <Button
                                                        type="primary"
                                                        size="small"
                                                        className="mt-3 bg-blue-600"
                                                        icon={<RightOutlined />}
                                                        onClick={() =>
                                                            gotoLearn(c.id)
                                                        }
                                                    >
                                                        {isDone
                                                            ? "Xem lại"
                                                            : "Học tiếp"}
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    </Col>
                                );
                            })}
                        </Row>
                    )}
                </Col>

                <Col xs={24} lg={8}>
                    <Card className="mb-6 rounded-2xl shadow-sm border-gray-100">
                        <Title level={5} className="!mb-1">
                            Wishlist
                        </Title>
                        <Text type="secondary" className="text-sm">
                            Khóa bạn đã lưu
                        </Text>
                        {wishPeek.length === 0 ? (
                            <Empty
                                className="my-8"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="Chưa có khóa yêu thích"
                            >
                                <Link to="/">
                                    <Button type="primary" ghost size="small">
                                        Tìm khóa học
                                    </Button>
                                </Link>
                            </Empty>
                        ) : (
                            <>
                                <List
                                    itemLayout="horizontal"
                                    dataSource={wishPeek.slice(0, 5)}
                                    className="mt-4"
                                    renderItem={(item) => (
                                        <List.Item className="!px-0">
                                            <List.Item.Meta
                                                avatar={
                                                    <Avatar
                                                        shape="square"
                                                        size={52}
                                                        src={item.thumbnail}
                                                        icon={<BookOutlined />}
                                                    />
                                                }
                                                title={
                                                    <button
                                                        type="button"
                                                        className="line-clamp-2 text-left font-medium text-gray-900 hover:text-blue-600 bg-transparent border-0 p-0 cursor-pointer text-sm leading-snug"
                                                        onClick={() =>
                                                            navigate(
                                                                `/courses/${item.course_id}`,
                                                            )
                                                        }
                                                    >
                                                        {item.title}
                                                    </button>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                                <Link
                                    to="/my-courses/wishlist"
                                    className="mt-2 inline-block text-sm"
                                >
                                    Xem wishlist đầy đủ{" "}
                                    <RightOutlined className="text-xs" />
                                </Link>
                            </>
                        )}
                    </Card>

                    <Card className="mb-6 rounded-2xl shadow-sm border-gray-100">
                        <Title level={5} className="!mb-1">
                            Chứng chỉ
                        </Title>
                        <Text type="secondary" className="text-sm">
                            Được cấp khi hoàn thành khóa (đủ điều kiện)
                        </Text>
                        {certificates.length === 0 ?
                            <Empty
                                className="my-8"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="Chưa có chứng chỉ"
                            />
                        :   <List
                                className="mt-4"
                                dataSource={certificates}
                                renderItem={(c) => (
                                    <List.Item className="!px-0">
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar
                                                    className="bg-emerald-500"
                                                    icon={
                                                        <SafetyCertificateOutlined />
                                                    }
                                                />
                                            }
                                            title={
                                                <button
                                                    type="button"
                                                    className="text-left font-medium text-gray-900 hover:text-blue-600 bg-transparent border-0 p-0 cursor-pointer text-sm"
                                                    onClick={() =>
                                                        navigate(
                                                            `/courses/${c.course_id}`,
                                                        )
                                                    }
                                                >
                                                    {c.title ||
                                                        `Khóa ${c.course_id}`}
                                                </button>
                                            }
                                            description={
                                                <div className="text-xs text-gray-500">
                                                    <div>
                                                        Mã:{" "}
                                                        <strong>
                                                            {
                                                                c.certificate_code
                                                            }
                                                        </strong>
                                                    </div>
                                                    <div>
                                                        {new Date(
                                                            c.issued_at,
                                                        ).toLocaleString(
                                                            "vi-VN",
                                                        )}
                                                    </div>
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        }
                    </Card>

                    <Card className="rounded-2xl border-dashed bg-slate-50/80 shadow-none">
                        <Title level={5} className="!mb-1">
                            Lối tắt
                        </Title>
                        <div className="mt-4 flex flex-col gap-2">
                            <Link to="/profile">
                                <Button block icon={<UserOutlined />}>
                                    Hồ sơ cá nhân
                                </Button>
                            </Link>
                            <Link to="/my-courses">
                                <Button block icon={<BookOutlined />}>
                                    Khóa của tôi
                                </Button>
                            </Link>
                            <Link to="/">
                                <Button block type="default">
                                    Khám phá khóa mới
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </Col>
            </Row>

            <section className="mt-12">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <Title level={4} className="!mb-1">
                            Gợi ý học tiếp
                        </Title>
                        <Text type="secondary">
                            Khóa nổi bật chưa nằm trong danh sách của bạn
                        </Text>
                    </div>
                    <Link to="/">
                        <Button type="primary" ghost icon={<ArrowRightOutlined />}>
                            Đến trang chủ
                        </Button>
                    </Link>
                </div>
                <Row gutter={[18, 18]}>
                    {suggested.length === 0 ? (
                        <Col span={24}>
                            <Empty description="Đã có đủ các khóa gợi ý trong tinh chỉnh — hoặc chưa có dữ liệu nổi bật." />
                        </Col>
                    ) : (
                        suggested.map((course) => {
                            const cid = featuredId(course);
                            const thumb = normalizeMediaUrl(
                                String(
                                    course.thumbnail_url ??
                                        course.thumbnail ??
                                        "",
                                ),
                            );
                            const count = Number(
                                course.enrolled_count ?? 0,
                            );
                            return (
                                <Col xs={24} sm={12} md={8} key={cid}>
                                    <Card
                                        hoverable
                                        className="rounded-2xl shadow-sm overflow-hidden"
                                        styles={{ body: { padding: 12 } }}
                                        cover={
                                            <div className="h-36 overflow-hidden">
                                                <img
                                                    alt=""
                                                    src={
                                                        thumb ||
                                                        "https://placehold.co/400x200/e8eef7/446?text=LMS"
                                                    }
                                                    className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]"
                                                />
                                            </div>
                                        }
                                    >
                                        <Title
                                            level={5}
                                            className="!mt-2 !mb-2 line-clamp-2 leading-snug !text-[15px]"
                                        >
                                            {String(course.title ?? "Khóa học")}
                                        </Title>
                                        <div className="mb-3 flex justify-between gap-2 text-xs text-gray-500">
                                            <Tag color="cyan">Nổi bật</Tag>
                                            {count > 0 ? (
                                                <span>{count} học viên</span>
                                            ) : null}
                                        </div>
                                        <Button
                                            type="link"
                                            size="small"
                                            className="!px-0"
                                            onClick={() =>
                                                navigate(`/courses/${cid}`)
                                            }
                                        >
                                            Chi tiết <RightOutlined />
                                        </Button>
                                    </Card>
                                </Col>
                            );
                        })
                    )}
                </Row>
            </section>
        </div>
    );
};

function SpaceActions() {
    return (
        <div className="mt-6 flex flex-wrap gap-2">
            <Link to="/my-courses">
                <Button
                    size="large"
                    className="border-white/40 bg-white/15 text-white hover:!bg-white/25 hover:!text-white hover:!border-white/50"
                >
                    Khóa của tôi
                </Button>
            </Link>
            <Link to="/">
                <Button size="large" type="primary" ghost className="!text-white">
                    Khám phá khóa mới
                </Button>
            </Link>
        </div>
    );
}

function HeroMini({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
}) {
    return (
        <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-3 backdrop-blur sm:px-4 sm:py-4">
            <div className="mb-2 flex items-center gap-2 text-white/85 text-xs sm:text-sm">
                <span className="text-base opacity-90">{icon}</span>
                <span>{label}</span>
            </div>
            <div className="text-xl font-semibold tracking-tight sm:text-2xl">
                {value}
            </div>
        </div>
    );
}

export default DashboardPage;
