import React, { useEffect, useMemo, useState } from "react";
import {
    Card,
    Row,
    Col,
    Typography,
    Button,
    Tag,
    Input,
    Spin,
    Empty,
    message,
    Pagination,
} from "antd";
import {
    BookOutlined,
    UserOutlined,
    ArrowRightOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import {
    courseService,
    type CatalogPublishedPaginationDto,
} from "../services/course.service";
import { normalizeMediaUrl } from "../utils/mediaUrl";

const { Title, Text } = Typography;

const PAGE_SIZE_OPTIONS: (string | number)[] = [12, 24, 48];

type CatalogRow = Record<string, unknown> & {
    id?: string;
    title?: string;
    thumbnail_url?: string;
    description?: string;
    price?: number;
    level?: string;
    enrollment_count?: number;
    slug?: string;
    instructor?: {
        name?: string;
        first_name?: string;
        last_name?: string;
        email?: string;
    };
};

function instructorLabel(course: CatalogRow): string {
    const ins = course.instructor;
    if (!ins || typeof ins !== "object") return "Giảng viên";
    if (typeof ins.name === "string" && ins.name.trim()) return ins.name;
    const n = `${ins.first_name ?? ""} ${ins.last_name ?? ""}`.trim();
    return n || "Giảng viên";
}

const CoursesCatalog: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState<CatalogRow[]>([]);
    const [keyword, setKeyword] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [pagination, setPagination] = useState<CatalogPublishedPaginationDto>(
        {
            total: 0,
            page: 1,
            page_size: 12,
            total_pages: 0,
        },
    );

    useEffect(() => {
        const timer = window.setTimeout(
            () => setAppliedSearch(keyword.trim()),
            380,
        );
        return () => window.clearTimeout(timer);
    }, [keyword]);

    useEffect(() => {
        setPage(1);
    }, [appliedSearch]);

    useEffect(() => {
        let cancel = false;
        (async () => {
            setLoading(true);
            try {
                const bundle = await courseService.catalogPublished({
                    search:
                        appliedSearch.length > 0 ? appliedSearch : undefined,
                    page,
                    page_size: pageSize,
                });
                if (!cancel) {
                    setRows(
                        bundle.items.filter((c): c is CatalogRow =>
                            typeof c === "object" && c !== null,
                        ),
                    );
                    setPagination(bundle.pagination);
                }
            } catch {
                if (!cancel) {
                    message.error("Không tải được danh sách khóa học.");
                    setRows([]);
                    setPagination({
                        total: 0,
                        page: 1,
                        page_size: pageSize,
                        total_pages: 0,
                    });
                }
            } finally {
                if (!cancel) setLoading(false);
            }
        })();
        return () => {
            cancel = true;
        };
    }, [page, pageSize, appliedSearch]);

    const rangeLabel = useMemo(() => {
        const total = pagination.total;
        const p = pagination.page || page;
        const psz = pagination.page_size || pageSize;
        if (total === 0)
            return "0 khóa";
        const start = (p - 1) * psz + 1;
        const end = Math.min(p * psz, total);
        return `${start}–${end} / ${total} khóa`;
    }, [pagination, page, pageSize]);

    const gotoDetail = (id: string): void => {
        navigate(`/courses/${encodeURIComponent(id)}`);
    };

    const onPgChange = (p: number, psz?: number): void => {
        const nextSize = psz ?? pageSize;
        if (nextSize !== pageSize) {
            setPageSize(nextSize);
            setPage(1);
            return;
        }
        setPage(p);
    };

    return (
        <div className="bg-gray-50 min-h-screen py-10 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <Title level={2} className="!mb-1">
                            <BookOutlined className="mr-2 text-blue-500" />
                            Tất cả khóa học
                        </Title>
                        <Text type="secondary">
                            Khóa đã xuất bản (API có phân trang).{" "}
                            <Text type="secondary" className="!font-semibold">
                                {rangeLabel}
                            </Text>
                        </Text>
                    </div>
                    <Link to="/">
                        <Button type="link">« Về trang chủ</Button>
                    </Link>
                </div>

                <div className="mb-8 flex flex-wrap gap-4 items-center">
                    <Input
                        allowClear
                        placeholder="Tìm khóa (tiêu đề / mô tả / ngành / danh mục — server)"
                        prefix={<SearchOutlined className="text-gray-400" />}
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        style={{ flex: "1", minWidth: 260, maxWidth: 560 }}
                    />
                </div>

                {!loading && pagination.total === 0 ?
                    <Empty description="Không có khóa học đã xuất bản" />
                :   <>
                        {loading && rows.length === 0 ?
                            <div className="flex justify-center py-24">
                                <Spin size="large" />
                            </div>
                        :   <Row
                                gutter={[24, 24]}
                                className={`mb-10 ${loading ? "opacity-60 pointer-events-none" : ""}`}
                            >
                                {rows.map((course) => {
                                    const id = String(course.id ?? "");
                                    if (!id) return null;
                                    const price = Number(course.price ?? 0);
                                    return (
                                        <Col
                                            xs={24}
                                            sm={12}
                                            lg={8}
                                            xl={6}
                                            key={id}
                                        >
                                            <Card
                                                hoverable
                                                className="h-full rounded-xl shadow-md hover:shadow-lg transition-all"
                                                cover={
                                                    <div className="h-48 overflow-hidden rounded-t-xl">
                                                        <img
                                                            alt={String(
                                                                course.title,
                                                            )}
                                                            src={normalizeMediaUrl(
                                                                course.thumbnail_url ??
                                                                    "",
                                                            )}
                                                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                                                        />
                                                    </div>
                                                }
                                                actions={[
                                                    <Button
                                                        key="go"
                                                        type="link"
                                                        icon={
                                                            <ArrowRightOutlined />
                                                        }
                                                        className="text-blue-600 font-medium"
                                                        onClick={() =>
                                                            gotoDetail(id)
                                                        }
                                                    >
                                                        Xem chi tiết
                                                    </Button>,
                                                ]}
                                            >
                                                {course.level ?
                                                    <Tag className="mb-2 capitalize">
                                                        {String(course.level)}
                                                    </Tag>
                                                :   null}
                                                <Title
                                                    level={5}
                                                    className="!mt-1 !mb-1 line-clamp-2 min-h-[48px]"
                                                >
                                                    {course.title}
                                                </Title>
                                                <Text
                                                    type="secondary"
                                                    className="text-sm block mb-2 line-clamp-2"
                                                >
                                                    {instructorLabel(course)}
                                                </Text>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                    <UserOutlined />
                                                    <span>
                                                        {Number(
                                                            course.enrollment_count ??
                                                                0,
                                                        ).toLocaleString()}{" "}
                                                        học viên
                                                    </span>
                                                </div>
                                                <div>
                                                    {price <= 0 ?
                                                        <Tag color="green">
                                                            Miễn phí
                                                        </Tag>
                                                    :   <Text strong>
                                                            {price.toLocaleString(
                                                                "vi-VN",
                                                            )}{" "}
                                                            đ
                                                        </Text>
                                                    }
                                                </div>
                                            </Card>
                                        </Col>
                                    );
                                })}
                            </Row>
                        }

                        {pagination.total > 0 ?
                            <div className="flex justify-center pb-8">
                                <Pagination
                                    current={pagination.page || page}
                                    pageSize={
                                        pagination.page_size || pageSize
                                    }
                                    total={pagination.total}
                                    disabled={loading}
                                    pageSizeOptions={PAGE_SIZE_OPTIONS}
                                    showSizeChanger
                                    showQuickJumper
                                    showTotal={(t) =>
                                        `${t} khóa (đã xuất bản)`
                                    }
                                    onChange={onPgChange}
                                />
                            </div>
                        :   null}
                    </>
                }
            </div>
        </div>
    );
};

export default CoursesCatalog;
