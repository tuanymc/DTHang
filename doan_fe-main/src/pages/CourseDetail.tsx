import React, { useEffect, useState } from "react";
import {
    Card,
    Row,
    Col,
    Tabs,
    Progress,
    Tag,
    Button,
    Typography,
    Avatar,
    Divider,
    List,
    Rate,
    Statistic,
    Collapse,
    Badge,
    Space,
    Tooltip,
    Image,
    Descriptions,
    Timeline,
    Alert,
    message,
    Form,
    Modal,
    Input,
} from "antd";
import {
    PlayCircleOutlined,
    ClockCircleOutlined,
    UserOutlined,
    FileTextOutlined,
    VideoCameraOutlined,
    CodeOutlined,
    CheckCircleOutlined,
    StarOutlined,
    DownloadOutlined,
    ShareAltOutlined,
    HeartOutlined,
    ShoppingCartOutlined,
    BookOutlined,
    TrophyOutlined,
    TeamOutlined,
    GlobalOutlined,
    ExperimentOutlined,
    SafetyOutlined,
    RocketOutlined,
} from "@ant-design/icons";
import { useCourseStore } from "../store/useCourseStore";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { courseService, type EnrollmentMetaDto } from "../services/course.service";
import { normalizeMediaUrl } from "../utils/mediaUrl";
import { useAuthStore } from "../store/useAuthStore";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// Định nghĩa kiểu dữ liệu
interface Chapter {
    title: string;
    duration: string;
    lessons: Lesson[];
}

interface Lesson {
    title: string;
    duration: string;
    type: "video" | "article" | "quiz" | "coding";
    isPreview?: boolean;
}

interface CourseDetailPayload {
    id: string;
    title: string;
    subtitle: string;
    headline: string;
    description: string;
    instructor: {
        name: string;
        title: string;
        avatar: string;
        bio: string;
        students: number;
        courses: number;
        rating: number;
        reviews: number;
    };
    rating: number;
    totalReviews: number;
    totalStudents: number;
    lastUpdated: string;
    language: string;
    subtitles: string[];
    totalHours: number;
    totalLectures: number;
    totalArticles: number;
    totalResources: number;
    level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
    certificate: boolean;
    whatYouWillLearn: string[];
    requirements: string[];
    targetAudience: string[];
    chapters: Chapter[];
    price: number;
    originalPrice?: number;
    thumbnail: string;
    thumbnail_url?: string;
    promoVideo: string;
    featuredReview?: {
        userName: string;
        userAvatar: string;
        rating: number;
        date: string;
        content: string;
    };
    relatedCourses?: RelatedCourse[];
}

interface RelatedCourse {
    id: string;
    title: string;
    instructor: string;
    rating: number;
    totalReviews: number;
    price: number;
    originalPrice?: number;
    thumbnail: string;
    duration: string;
}



const CourseDetail: React.FC = () => {
    const { course_id } = useParams<{ course_id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuthStore();

    const [isEnrolled, setIsEnrolled] = useState(false);
    const [inWishlist, setInWishlist] = useState(false);
    const [enrollMeta, setEnrollMeta] = useState<EnrollmentMetaDto | null>(
        null,
    );
    const [reviewsList, setReviewsList] = useState<
        {
            id: string;
            rating: number;
            comment: string | null;
            created_at: string;
            first_name: string | null;
            last_name: string | null;
        }[]
    >([]);
    const [reviewsAgg, setReviewsAgg] = useState<{
        avg_rating: number;
        count: number;
    }>({ avg_rating: 0, count: 0 });
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewForm] = Form.useForm();
    const [reviewSubmitting, setReviewSubmitting] = useState(false);

    const [activeTab, setActiveTab] = useState("overview");
    const { courseDetail, getCourseDetail } = useCourseStore();

    useEffect(() => {
        if (course_id) {
            getCourseDetail(course_id);
        }
    }, [course_id, getCourseDetail]);

    useEffect(() => {
        if (!course_id) return;

        let cancel = false;
        (async () => {
            try {
                const meta = await courseService.enrollmentStatus(course_id);
                if (cancel) return;
                setEnrollMeta(meta);
                setIsEnrolled(Boolean(meta.enrolled));
                setInWishlist(Boolean(meta.wishlisted));
            } catch {
                if (!cancel) {
                    setEnrollMeta(null);
                    setIsEnrolled(false);
                }
            }
        })();

        return () => {
            cancel = true;
        };
    }, [course_id, isAuthenticated]);

    useEffect(() => {
        if (!course_id) return;

        let cancel = false;
        (async () => {
            try {
                const rv = await courseService.getCourseReviews(course_id);
                if (cancel) return;
                setReviewsAgg(rv.aggregate ?? { avg_rating: 0, count: 0 });
                setReviewsList(
                    Array.isArray(rv.data) ?
                        rv.data
                    :   [],
                );
            } catch {
                if (!cancel) {
                    setReviewsAgg({ avg_rating: 0, count: 0 });
                    setReviewsList([]);
                }
            }
        })();
        return () => {
            cancel = true;
        };
    }, [course_id]);

    const handleEnroll = async () => {
        if (!course_id) return;
        if (!isAuthenticated) {
            message.warning("Vui lòng đăng nhập để ghi danh.");
            navigate("/auth/login", { state: { from: location } });
            return;
        }

        try {
            await courseService.enrollCourse(course_id);
            const meta = await courseService.enrollmentStatus(course_id);
            setEnrollMeta(meta);
            setIsEnrolled(Boolean(meta.enrolled));
            message.success("Đăng ký khóa học thành công.");
        } catch (e: unknown) {
            const msg =
                (e as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message ?? "Ghi danh thất bại.";
            message.error(msg);
        }
    };

    const handlePurchase = async () => {
        if (!course_id) return;
        if (!isAuthenticated) {
            message.warning("Vui lòng đăng nhập để mua khóa học.");
            navigate("/auth/login", { state: { from: location } });
            return;
        }
        try {
            await courseService.purchaseCourse(course_id);
            const meta = await courseService.enrollmentStatus(course_id);
            setEnrollMeta(meta);
            setIsEnrolled(Boolean(meta.enrolled));
            message.success("Mua khóa học thành công.");
        } catch (e: unknown) {
            const msg =
                (e as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message ?? "Mua không thành công.";
            message.error(msg);
        }
    };

    const handleStartTrial = async () => {
        if (!course_id) return;
        if (!isAuthenticated) {
            message.warning("Vui lòng đăng nhập để học thử.");
            navigate("/auth/login", { state: { from: location } });
            return;
        }
        try {
            await courseService.startTrial(course_id);
            const meta = await courseService.enrollmentStatus(course_id);
            setEnrollMeta(meta);
            setIsEnrolled(Boolean(meta.enrolled));
            message.success("Đã kích hoạt học thử.");
        } catch (e: unknown) {
            const msg =
                (e as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message ?? "Không thể học thử.";
            message.error(msg);
        }
    };

    const handleSubmitReview = async () => {
        if (!course_id) return;
        try {
            const v = await reviewForm.validateFields();
            setReviewSubmitting(true);
            await courseService.submitCourseReview({
                course_id,
                rating: v.rating,
                comment: v.comment?.trim() || undefined,
            });
            message.success("Đã gửi đánh giá.");
            reviewForm.resetFields();
            setReviewModalOpen(false);

            const [rv, meta] = await Promise.all([
                courseService.getCourseReviews(course_id),
                courseService.enrollmentStatus(course_id),
            ]);
            setReviewsAgg(rv.aggregate ?? { avg_rating: 0, count: 0 });
            setReviewsList(
                Array.isArray(rv.data) ? rv.data : [],
            );
            setEnrollMeta(meta);
            setIsEnrolled(Boolean(meta.enrolled));
        } catch (e: unknown) {
            const errFields = (
                e as { errorFields?: unknown }
            )?.errorFields;
            if (errFields !== undefined && errFields !== null) return;
            const msg =
                (e as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message ?? "Gửi đánh giá thất bại.";
            message.error(msg);
        } finally {
            setReviewSubmitting(false);
        }
    };

    const toggleWishlist = async () => {
        if (!course_id) return;
        if (!isAuthenticated) {
            message.warning("Đăng nhập để dùng wishlist.");
            navigate("/auth/login", { state: { from: location } });
            return;
        }

        try {
            if (inWishlist) {
                await courseService.wishlistRemove(course_id);
                setInWishlist(false);
                message.success("Đã bỏ khỏi yêu thích");
            } else {
                await courseService.wishlistAdd(course_id);
                setInWishlist(true);
                message.success("Đã thêm vào yêu thích");
            }
        } catch (e: unknown) {
            const msg =
                (e as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message ?? "Không thể cập nhật.";
            message.error(msg);
        }
    };

    if (!courseDetail) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center text-gray-500">Loading...</div>
            </div>
        );
    }

    const cd = courseDetail as CourseDetailPayload;

    const displayPrice =
        enrollMeta?.price !== undefined && enrollMeta?.price !== null
            ? Number(enrollMeta.price) || 0
            : Number(cd.price) || 0;

    const isFullAccess = enrollMeta?.access_kind === "full";
    const isTrialAccess = enrollMeta?.access_kind === "trial";

    const avgRatingDisplay =
        reviewsAgg.count > 0 ?
            Math.round(Number(reviewsAgg.avg_rating) * 10) / 10
        :   cd.rating;
    const reviewCountDisplay =
        reviewsAgg.count > 0 ?
            reviewsAgg.count
        :   cd.totalReviews;

    const renderCourseInfoCard = () => (
        <Card className="sticky top-6 rounded-xl shadow-lg border-0 overflow-hidden">
            {/* Video Preview */}
            <div className="relative bg-black rounded-t-xl overflow-hidden">
                <div className="aspect-video">
                    <img
                        src={normalizeMediaUrl(
                            cd.thumbnail_url ?? cd.thumbnail,
                        )}
                        alt={cd.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <PlayCircleOutlined className="text-white text-6xl cursor-pointer hover:scale-110 transition-transform" />
                    </div>
                </div>
            </div>

            {/* Course Info */}
            <div className="p-6">
                {/* Access badges & progress */}
                {isEnrolled && enrollMeta && (
                    <div className="mb-4 space-y-2">
                        {isTrialAccess && (
                            <div>
                                <Tag color="orange">Học thử — chỉ bài xem trước</Tag>
                            </div>
                        )}
                        {isFullAccess && displayPrice > 0 && (
                            <div>
                                <Tag color="green">Đã mua đầy đủ</Tag>
                            </div>
                        )}
                        {displayPrice <= 0 && isFullAccess && (
                            <div>
                                <Tag color="blue">Khóa miễn phí</Tag>
                            </div>
                        )}
                        {typeof enrollMeta.progress_percent === "number" && (
                            <div>
                                <div className="flex justify-between text-sm text-gray-500 mb-1">
                                    <span>Tiến độ</span>
                                    <span>
                                        {Math.round(
                                            enrollMeta.progress_percent,
                                        )}
                                        %
                                    </span>
                                </div>
                                <Progress
                                    percent={Math.min(
                                        100,
                                        Math.round(enrollMeta.progress_percent),
                                    )}
                                    status="active"
                                    showInfo={false}
                                />
                            </div>
                        )}
                        {enrollMeta.completed_at && (
                            <Text type="success" className="!block text-sm">
                                Đã hoàn thành:{" "}
                                {new Date(
                                    enrollMeta.completed_at,
                                ).toLocaleString("vi-VN")}
                            </Text>
                        )}
                    </div>
                )}

                {/* Price */}
                <div className="mb-4">
                    {displayPrice <= 0 ? (
                        <div className="flex items-center gap-2">
                            <Text className="text-3xl font-bold text-green-600">
                                MIỄN PHÍ
                            </Text>
                            {cd.originalPrice ? (
                                <Text delete className="text-gray-400 text-lg">
                                    ${cd.originalPrice}
                                </Text>
                            ) : null}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <Text className="text-3xl font-bold">
                                    ${displayPrice}
                                </Text>
                                {cd.originalPrice ?
                                    <Text
                                        delete
                                        className="text-gray-400 text-lg"
                                    >
                                        ${cd.originalPrice}
                                    </Text>
                                :   null}
                            </div>
                            {enrollMeta?.allows_trial && !isEnrolled && (
                                <Text type="secondary" className="text-sm">
                                    Có học thử — xem các bài được đánh dấu
                                    Preview.
                                </Text>
                            )}
                        </div>
                    )}
                </div>

                {/* Enroll / purchase / trial */}
                {displayPrice <= 0 ?
                    <Button
                        type="primary"
                        size="large"
                        block
                        icon={
                            isEnrolled && isFullAccess ?
                                <CheckCircleOutlined />
                            :   <BookOutlined />
                        }
                        disabled={Boolean(isEnrolled && isFullAccess)}
                        onClick={handleEnroll}
                        className="bg-blue-600 hover:bg-blue-700 h-12 text-base font-semibold mb-3"
                    >
                        {isEnrolled && isFullAccess ?
                            "Đã ghi danh"
                        :   "Ghi danh học"}
                    </Button>
                : !isEnrolled ?
                    <>
                        <Button
                            type="primary"
                            size="large"
                            block
                            icon={<ShoppingCartOutlined />}
                            onClick={handlePurchase}
                            className="bg-blue-600 hover:bg-blue-700 h-12 text-base font-semibold mb-3"
                        >
                            Mua khóa học
                        </Button>
                        {enrollMeta?.allows_trial && (
                            <Button
                                size="large"
                                block
                                className="h-12 text-base mb-3"
                                onClick={handleStartTrial}
                            >
                                Học thử
                            </Button>
                        )}
                    </>
                : isTrialAccess ?
                    <>
                        <Button
                            type="primary"
                            size="large"
                            block
                            icon={<ShoppingCartOutlined />}
                            onClick={handlePurchase}
                            className="bg-blue-600 hover:bg-blue-700 h-12 text-base font-semibold mb-3"
                        >
                            Mua để học đầy đủ
                        </Button>
                    </>
                :   <Button
                        size="large"
                        block
                        disabled
                        icon={<CheckCircleOutlined />}
                        className="h-12 text-base font-semibold mb-3"
                    >
                        Đã có quyền học đầy đủ
                    </Button>
                }

                {isEnrolled && course_id && (
                    <Button
                        block
                        size="large"
                        type="default"
                        className="mb-3"
                        icon={<BookOutlined />}
                        onClick={() =>
                            navigate(`/learning?courseId=${course_id}`)
                        }
                    >
                        Vào học ngay
                    </Button>
                )}

                {/* 30-Day Guarantee */}
                <Text
                    type="secondary"
                    className="text-center block text-sm mb-4"
                >
                    🔒 30-Day Money-Back Guarantee
                </Text>

                {/* Course Includes */}
                <Divider className="!my-4" />
                <Title level={5} className="!mb-3">
                    This course includes:
                </Title>
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-gray-600">
                        <VideoCameraOutlined className="text-blue-500" />
                        <span>
                            {cd.totalHours} hours on-demand video
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                        <FileTextOutlined className="text-blue-500" />
                        <span>{cd.totalArticles} articles</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                        <DownloadOutlined className="text-blue-500" />
                        <span>
                            {cd.totalResources} downloadable resources
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                        <TrophyOutlined className="text-blue-500" />
                        <span>Certificate of completion</span>
                    </div>
                </div>

                {/* Share Buttons */}
                <Divider className="!my-4" />
                <div className="flex gap-2">
                    <Button
                        icon={<HeartOutlined />}
                        className="flex-1"
                        type={inWishlist ? "primary" : "default"}
                        onClick={() => toggleWishlist()}
                    >
                        {inWishlist ? "Đã thích" : "Wishlist"}
                    </Button>
                    <Button icon={<ShareAltOutlined />} className="flex-1">
                        Share
                    </Button>
                </div>
            </div>
        </Card>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
                <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
                    <Row gutter={[32, 32]}>
                        <Col xs={24} lg={16}>
                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                <Tag
                                    color="gold"
                                    className="bg-yellow-500/20 border-yellow-500 text-yellow-300"
                                >
                                    🔥 Bestseller
                                </Tag>
                                <Tag
                                    color="blue"
                                    className="bg-blue-500/20 border-blue-500 text-blue-300"
                                >
                                    Updated {cd.lastUpdated}
                                </Tag>
                                <Tag
                                    color="purple"
                                    className="bg-purple-500/20 border-purple-500 text-purple-300"
                                >
                                    {cd.level}
                                </Tag>
                            </div>

                            {/* Title */}
                            <Title
                                level={1}
                                className="!text-white !text-2xl md:!text-3xl lg:!text-4xl !mb-4"
                            >
                                {cd.title}
                            </Title>

                            {/* Headline */}
                            <Text className="text-gray-200 text-base block mb-4">
                                {cd.headline}
                            </Text>

                            {/* Rating & Stats */}
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                    <Rate
                                        allowHalf
                                        disabled
                                        value={avgRatingDisplay}
                                        className="text-yellow-400 text-sm"
                                    />
                                    <Text className="text-yellow-400 font-semibold ml-1">
                                        {avgRatingDisplay}
                                    </Text>
                                    <Text className="text-gray-300 ml-1">
                                        (
                                        {Number(
                                            reviewCountDisplay,
                                        ).toLocaleString()}{" "}
                                        đánh giá)
                                    </Text>
                                </div>
                                <div className="flex items-center gap-1 text-gray-300">
                                    <UserOutlined />
                                    <span>
                                        {cd.totalStudents.toLocaleString()}{" "}
                                        students
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-300">
                                    <ClockCircleOutlined />
                                    <span>
                                        Last updated {cd.lastUpdated}
                                    </span>
                                </div>
                            </div>

                            {/* Instructor */}
                            <div className="flex items-center gap-3 mt-4">
                                <Avatar
                                    src={cd.instructor.avatar}
                                    size={48}
                                />
                                <div>
                                    <Text className="text-gray-200">
                                        Created by
                                    </Text>
                                    <Text strong className="text-white block">
                                        {cd.instructor.name}
                                    </Text>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} lg={8}>
                            {/* Hidden on mobile, will show in sticky card */}
                            <div className="hidden lg:block">
                                {renderCourseInfoCard()}
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Row gutter={[32, 32]}>
                    <Col xs={24} className="lg:hidden mb-6">
                        {renderCourseInfoCard()}
                    </Col>
                    <Col xs={24} lg={16}>
                        {/* Tabs */}
                        <Tabs
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            className="course-tabs"
                            size="large"
                            items={[
                                {
                                    key: "overview",
                                    label: "Overview",
                                    children: (
                                        <div className="space-y-8">
                                            {/* What You'll Learn */}
                                            <Card
                                                title="What you'll learn"
                                                className="rounded-xl"
                                            >
                                                <Row gutter={[16, 16]}>
                                                    {cd.whatYouWillLearn.map(
                                                        (item, index) => (
                                                            <Col
                                                                xs={24}
                                                                md={12}
                                                                key={index}
                                                            >
                                                                <div className="flex items-start gap-2">
                                                                    <CheckCircleOutlined className="text-green-500 mt-1" />
                                                                    <Text>
                                                                        {item}
                                                                    </Text>
                                                                </div>
                                                            </Col>
                                                        ),
                                                    )}
                                                </Row>
                                            </Card>

                                            {/* Course Content */}
                                            <Card
                                                title={`Course content`}
                                                className="rounded-xl"
                                            >
                                                <div className="flex justify-between text-gray-500 mb-4">
                                                    <Text>
                                                        {cd.chapters.reduce(
                                                            (acc, ch) =>
                                                                acc +
                                                                ch.lessons
                                                                    .length,
                                                            0,
                                                        )}{" "}
                                                        lectures •{" "}
                                                        {cd.totalHours}{" "}
                                                        hours total length
                                                    </Text>
                                                </div>
                                                <Collapse
                                                    accordion
                                                    className="bg-white"
                                                >
                                                    {cd.chapters.map(
                                                        (chapter, idx) => (
                                                            <Panel
                                                                header={
                                                                    <div className="flex justify-between items-center w-full">
                                                                        <span className="font-medium">
                                                                            {
                                                                                chapter.title
                                                                            }
                                                                        </span>
                                                                        <span className="text-gray-400 text-sm">
                                                                            {
                                                                                chapter
                                                                                    .lessons
                                                                                    .length
                                                                            }{" "}
                                                                            lectures
                                                                            •{" "}
                                                                            {
                                                                                chapter.duration
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                }
                                                                key={idx}
                                                            >
                                                                <List
                                                                    dataSource={
                                                                        chapter.lessons
                                                                    }
                                                                    renderItem={(
                                                                        lesson,
                                                                        lessonIdx,
                                                                    ) => (
                                                                        <List.Item className="!px-4 hover:bg-gray-50 rounded-lg cursor-pointer">
                                                                            <div className="flex items-center justify-between w-full">
                                                                                <div className="flex items-center gap-3">
                                                                                    {lesson.type ===
                                                                                        "video" && (
                                                                                        <PlayCircleOutlined className="text-blue-500" />
                                                                                    )}
                                                                                    {lesson.type ===
                                                                                        "article" && (
                                                                                        <FileTextOutlined className="text-green-500" />
                                                                                    )}
                                                                                    {lesson.type ===
                                                                                        "quiz" && (
                                                                                        <ExperimentOutlined className="text-purple-500" />
                                                                                    )}
                                                                                    {lesson.type ===
                                                                                        "coding" && (
                                                                                        <CodeOutlined className="text-orange-500" />
                                                                                    )}
                                                                                    <span>
                                                                                        {
                                                                                            lesson.title
                                                                                        }
                                                                                    </span>
                                                                                    {lesson.isPreview && (
                                                                                        <Tag
                                                                                            color="blue"
                                                                                            className="ml-2"
                                                                                        >
                                                                                            Preview
                                                                                        </Tag>
                                                                                    )}
                                                                                </div>
                                                                                <span className="text-gray-400 text-sm">
                                                                                    {
                                                                                        lesson.duration
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                        </List.Item>
                                                                    )}
                                                                />
                                                            </Panel>
                                                        ),
                                                    )}
                                                </Collapse>
                                            </Card>

                                            {/* Requirements */}
                                            <Card
                                                title="Requirements"
                                                className="rounded-xl"
                                            >
                                                <List
                                                    dataSource={
                                                        cd.requirements
                                                    }
                                                    renderItem={(item) => (
                                                        <List.Item className="!border-0 !py-1">
                                                            <div className="flex items-start gap-2">
                                                                <SafetyOutlined className="text-blue-500 mt-1" />
                                                                <Text>
                                                                    {item}
                                                                </Text>
                                                            </div>
                                                        </List.Item>
                                                    )}
                                                />
                                            </Card>

                                            {/* Description */}
                                            <Card
                                                title="Description"
                                                className="rounded-xl"
                                            >
                                                <Paragraph className="whitespace-pre-line">
                                                    {cd.description}
                                                </Paragraph>
                                            </Card>

                                            {/* Target Audience */}
                                            <Card
                                                title="Who this course is for"
                                                className="rounded-xl"
                                            >
                                                <List
                                                    dataSource={
                                                        cd.targetAudience
                                                    }
                                                    renderItem={(item) => (
                                                        <List.Item className="!border-0 !py-1">
                                                            <div className="flex items-start gap-2">
                                                                <TeamOutlined className="text-blue-500 mt-1" />
                                                                <Text>
                                                                    {item}
                                                                </Text>
                                                            </div>
                                                        </List.Item>
                                                    )}
                                                />
                                            </Card>

                                            {/* Featured Review */}
                                            {cd.featuredReview && (
                                                <Card
                                                    title="Featured review"
                                                    className="rounded-xl"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <Avatar
                                                            src={
                                                                cd
                                                                    .featuredReview
                                                                    .userAvatar
                                                            }
                                                            size={48}
                                                        />
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <Text strong>
                                                                    {
                                                                        cd
                                                                            .featuredReview
                                                                            .userName
                                                                    }
                                                                </Text>
                                                                <Rate
                                                                    disabled
                                                                    defaultValue={
                                                                        cd
                                                                            .featuredReview
                                                                            .rating
                                                                    }
                                                                    className="text-yellow-400 text-sm"
                                                                />
                                                            </div>
                                                            <Text
                                                                type="secondary"
                                                                className="text-xs"
                                                            >
                                                                {
                                                                    cd
                                                                        .featuredReview
                                                                        .date
                                                                }
                                                            </Text>
                                                            <Paragraph className="mt-2">
                                                                "
                                                                {
                                                                    cd
                                                                        .featuredReview
                                                                        .content
                                                                }
                                                                "
                                                            </Paragraph>
                                                        </div>
                                                    </div>
                                                </Card>
                                            )}

                                            {/* Instructor */}
                                            <Card
                                                title={
                                                    <div className="flex items-center gap-3">
                                                        <Avatar
                                                            src={
                                                                cd.instructor.avatar
                                                            }
                                                            size={56}
                                                        />
                                                        <div>
                                                            <Text
                                                                strong
                                                                className="text-lg"
                                                            >
                                                                {
                                                                    cd
                                                                        .instructor
                                                                        .name
                                                                }
                                                            </Text>
                                                            <Text
                                                                type="secondary"
                                                                className="block text-sm"
                                                            >
                                                                {
                                                                    cd
                                                                        .instructor
                                                                        .title
                                                                }
                                                            </Text>
                                                        </div>
                                                    </div>
                                                }
                                                className="rounded-xl"
                                            >
                                                <Paragraph>
                                                    {cd.instructor.bio}
                                                </Paragraph>
                                                <Divider className="!my-4" />
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                                    <div>
                                                        <Text
                                                            strong
                                                            className="text-xl"
                                                        >
                                                            {cd.instructor.students.toLocaleString()}
                                                        </Text>
                                                        <Text
                                                            type="secondary"
                                                            className="block text-sm"
                                                        >
                                                            Students
                                                        </Text>
                                                    </div>
                                                    <div>
                                                        <Text
                                                            strong
                                                            className="text-xl"
                                                        >
                                                            {
                                                                cd
                                                                    .instructor
                                                                    .courses
                                                            }
                                                        </Text>
                                                        <Text
                                                            type="secondary"
                                                            className="block text-sm"
                                                        >
                                                            Courses
                                                        </Text>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Text
                                                                strong
                                                                className="text-xl"
                                                            >
                                                                {
                                                                    cd
                                                                        .instructor
                                                                        .rating
                                                                }
                                                            </Text>
                                                            <StarOutlined className="text-yellow-500" />
                                                        </div>
                                                        <Text
                                                            type="secondary"
                                                            className="block text-sm"
                                                        >
                                                            Instructor Rating
                                                        </Text>
                                                    </div>
                                                    <div>
                                                        <Text
                                                            strong
                                                            className="text-xl"
                                                        >
                                                            {cd.instructor.reviews.toLocaleString()}
                                                        </Text>
                                                        <Text
                                                            type="secondary"
                                                            className="block text-sm"
                                                        >
                                                            Reviews
                                                        </Text>
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>
                                    ),
                                },
                                {
                                    key: "curriculum",
                                    label: "Curriculum",
                                    children: (
                                        <Card
                                            title="Course curriculum"
                                            className="rounded-xl"
                                        >
                                            <div className="flex justify-between text-gray-500 mb-4">
                                                <Text>
                                                    {cd.chapters.reduce(
                                                        (acc, ch) =>
                                                            acc +
                                                            ch.lessons.length,
                                                        0,
                                                    )}{" "}
                                                    lectures •{" "}
                                                    {cd.totalHours}{" "}
                                                    hours total length
                                                </Text>
                                            </div>
                                            <Collapse
                                                accordion
                                                className="bg-white"
                                            >
                                                {cd.chapters.map(
                                                    (chapter, idx) => (
                                                        <Panel
                                                            header={
                                                                <div className="flex justify-between items-center w-full">
                                                                    <span className="font-medium">
                                                                        {
                                                                            chapter.title
                                                                        }
                                                                    </span>
                                                                    <span className="text-gray-400 text-sm">
                                                                        {
                                                                            chapter
                                                                                .lessons
                                                                                .length
                                                                        }{" "}
                                                                        lectures
                                                                        •{" "}
                                                                        {
                                                                            chapter.duration
                                                                        }
                                                                    </span>
                                                                </div>
                                                            }
                                                            key={idx}
                                                        >
                                                            <List
                                                                dataSource={
                                                                    chapter.lessons
                                                                }
                                                                renderItem={(
                                                                    lesson,
                                                                ) => (
                                                                    <List.Item className="!px-4 hover:bg-gray-50 rounded-lg cursor-pointer">
                                                                        <div className="flex items-center justify-between w-full">
                                                                            <div className="flex items-center gap-3">
                                                                                {lesson.type ===
                                                                                    "video" && (
                                                                                    <PlayCircleOutlined className="text-blue-500" />
                                                                                )}
                                                                                {lesson.type ===
                                                                                    "article" && (
                                                                                    <FileTextOutlined className="text-green-500" />
                                                                                )}
                                                                                {lesson.type ===
                                                                                    "quiz" && (
                                                                                    <ExperimentOutlined className="text-purple-500" />
                                                                                )}
                                                                                {lesson.type ===
                                                                                    "coding" && (
                                                                                    <CodeOutlined className="text-orange-500" />
                                                                                )}
                                                                                <span>
                                                                                    {
                                                                                        lesson.title
                                                                                    }
                                                                                </span>
                                                                                {lesson.isPreview && (
                                                                                    <Tag
                                                                                        color="blue"
                                                                                        className="ml-2"
                                                                                    >
                                                                                        Preview
                                                                                    </Tag>
                                                                                )}
                                                                            </div>
                                                                            <span className="text-gray-400 text-sm">
                                                                                {
                                                                                    lesson.duration
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    </List.Item>
                                                                )}
                                                            />
                                                        </Panel>
                                                    ),
                                                )}
                                            </Collapse>
                                        </Card>
                                    ),
                                },
                                {
                                    key: "reviews",
                                    label: "Đánh giá",
                                    children: (
                                        <Card
                                            title="Đánh giá học viên"
                                            className="rounded-xl"
                                            extra={
                                                isAuthenticated &&
                                                isEnrolled &&
                                                (isFullAccess ||
                                                    displayPrice <= 0) ?
                                                    <Button
                                                        type="primary"
                                                        icon={
                                                            <StarOutlined />
                                                        }
                                                        onClick={() => {
                                                            reviewForm.resetFields();
                                                            setReviewModalOpen(
                                                                true,
                                                            );
                                                        }}
                                                    >
                                                        Viết đánh giá
                                                    </Button>
                                                :   null
                                            }
                                        >
                                            <div className="text-center mb-8">
                                                <div className="flex items-center justify-center gap-2 mb-2">
                                                    <Rate
                                                        allowHalf
                                                        disabled
                                                        value={
                                                            avgRatingDisplay
                                                        }
                                                        className="text-yellow-400 text-2xl"
                                                    />
                                                    <Text className="text-3xl font-bold">
                                                        {avgRatingDisplay}
                                                    </Text>
                                                </div>
                                                <Text type="secondary">
                                                    {Number(
                                                        reviewCountDisplay,
                                                    ).toLocaleString()}{" "}
                                                    đánh giá
                                                </Text>
                                            </div>

                                            <Divider />
                                            <List
                                                dataSource={reviewsList}
                                                locale={{
                                                    emptyText:
                                                        "Chưa có đánh giá nào.",
                                                }}
                                                renderItem={(item) => (
                                                    <List.Item>
                                                        <List.Item.Meta
                                                            title={
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <Text strong>
                                                                        {`${item.first_name ?? ""}${item.first_name || item.last_name ? " " : ""}${item.last_name ?? ""}`.trim() ||
                                                                            "Học viên"}
                                                                    </Text>
                                                                    <Rate
                                                                        disabled
                                                                        value={
                                                                            item.rating
                                                                        }
                                                                        className="text-yellow-400 text-sm"
                                                                    />
                                                                    <Text
                                                                        type="secondary"
                                                                        className="text-sm"
                                                                    >
                                                                        {new Date(
                                                                            item.created_at,
                                                                        ).toLocaleString(
                                                                            "vi-VN",
                                                                        )}
                                                                    </Text>
                                                                </div>
                                                            }
                                                            description={
                                                                item.comment ?
                                                                    item.comment
                                                                :   (
                                                                    <Text
                                                                        type="secondary"
                                                                        italic
                                                                    >
                                                                        (Không
                                                                        có nhận
                                                                        xét)
                                                                    </Text>
                                                                )
                                                            }
                                                        />
                                                    </List.Item>
                                                )}
                                            />
                                        </Card>
                                    ),
                                },
                            ]}
                        />
                    </Col>
                </Row>

                {/* Related Courses Section */}
                <Divider className="!my-12" />
                <Title level={3} className="!mb-6">
                    Students also bought
                </Title>
                <Row gutter={[24, 24]}>
                    {cd.relatedCourses?.map((course) => (
                        <Col xs={24} sm={12} md={8} lg={8} key={course.id}>
                            <Card
                                hoverable
                                className="rounded-xl overflow-hidden"
                                cover={
                                    <img
                                        alt={course.title}
                                        src={course.thumbnail}
                                        className="h-40 w-full object-cover"
                                    />
                                }
                            >
                                <div className="space-y-2">
                                    <Title
                                        level={5}
                                        className="!mb-0 line-clamp-2 min-h-[56px]"
                                    >
                                        {course.title}
                                    </Title>
                                    <Text
                                        type="secondary"
                                        className="text-sm block"
                                    >
                                        {course.instructor}
                                    </Text>
                                    <div className="flex items-center gap-2">
                                        <Rate
                                            disabled
                                            defaultValue={course.rating}
                                            className="text-yellow-400 text-sm"
                                        />
                                        <Text className="text-sm font-medium">
                                            {course.rating}
                                        </Text>
                                        <Text
                                            type="secondary"
                                            className="text-sm"
                                        >
                                            (
                                            {course.totalReviews.toLocaleString()}
                                            )
                                        </Text>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ClockCircleOutlined className="text-gray-400" />
                                            <Text
                                                type="secondary"
                                                className="text-sm"
                                            >
                                                {course.duration}
                                            </Text>
                                        </div>
                                        {course.price === 0 ? (
                                            <Text
                                                strong
                                                className="text-green-600"
                                            >
                                                FREE
                                            </Text>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Text strong>
                                                    ${course.price}
                                                </Text>
                                                {course.originalPrice && (
                                                    <Text
                                                        delete
                                                        type="secondary"
                                                        className="text-sm"
                                                    >
                                                        ${course.originalPrice}
                                                    </Text>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <Modal
                    title="Viết đánh giá khóa học"
                    open={reviewModalOpen}
                    destroyOnClose
                    onCancel={() => {
                        setReviewModalOpen(false);
                        reviewForm.resetFields();
                    }}
                    footer={[
                        <Button
                            key="cancel"
                            onClick={() => {
                                setReviewModalOpen(false);
                                reviewForm.resetFields();
                            }}
                        >
                            Huỷ
                        </Button>,
                        <Button
                            key="submit"
                            type="primary"
                            loading={reviewSubmitting}
                            onClick={() => handleSubmitReview()}
                        >
                            Gửi đánh giá
                        </Button>,
                    ]}
                    forceRender
                >
                    <Form form={reviewForm} layout="vertical">
                        <Form.Item
                            name="rating"
                            label="Điểm số"
                            rules={[
                                {
                                    required: true,
                                    message: "Chọn số sao đánh giá",
                                },
                            ]}
                        >
                            <Rate allowHalf />
                        </Form.Item>
                        <Form.Item
                            name="comment"
                            label="Nhận xét"
                        >
                            <Input.TextArea
                                rows={4}
                                placeholder="Tuỳ chọn — chia sẻ trải nghiệm của bạn."
                                maxLength={2000}
                                showCount
                            />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </div>
    );
};

export default CourseDetail;
