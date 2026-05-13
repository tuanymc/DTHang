import {
    Carousel,
    Card,
    Row,
    Col,
    Typography,
    Button,
    Space,
    Avatar,
    Rate,
    Divider,
    Tag,
} from "antd";
import type { CarouselRef } from "antd/es/carousel";
import {
    BookOutlined,
    UserOutlined,
    ArrowRightOutlined,
    TeamOutlined,
    HeartOutlined,
    LeftOutlined,
    RightOutlined,
    ApartmentOutlined,
} from "@ant-design/icons";
import { useEffect, useRef } from "react";
import { useCourseStore } from "../store/useCourseStore";
import { Link, useNavigate } from "react-router-dom";
import { normalizeMediaUrl } from "../utils/mediaUrl";

const { Title, Text, Paragraph } = Typography;

// Dữ liệu slides hero (giữ nguyên 3 slide)
const slides = [
    {
        id: 1,
        title: "Chào mừng đến với LMS Khoa CNTT",
        description:
            "Nền tảng học tập trực tuyến hàng đầu dành cho sinh viên Công nghệ Thông tin",
        image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    },
    {
        id: 2,
        title: "Học lập trình từ cơ bản đến nâng cao",
        description:
            "Hơn 50 khoá học chất lượng cao từ các giảng viên giàu kinh nghiệm",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    },
    {
        id: 3,
        title: "Dự án thực tế - Cơ hội việc làm rộng mở",
        description: "Tham gia các dự án thực tế và nhận chứng chỉ có giá trị",
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    },
];

const instructors = [
    {
        id: 1,
        name: "TS. Nguyễn Văn A",
        role: "Trưởng bộ môn CNPM",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        bio: "Chuyên gia về Web Development và Cloud Computing",
        coursesCount: 12,
    },
    {
        id: 2,
        name: "PGS. Trần Thị B",
        role: "Giảng viên cao cấp",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        bio: "15 năm kinh nghiệm về Thuật toán và AI",
        coursesCount: 8,
    },
    {
        id: 3,
        name: "TS. Lê Văn C",
        role: "Nghiên cứu viên AI",
        avatar: "https://randomuser.me/api/portraits/men/75.jpg",
        bio: "Tác giả nhiều bài báo quốc tế về Machine Learning",
        coursesCount: 6,
    },
    {
        id: 4,
        name: "ThS. Phạm Thị D",
        role: "Chuyên gia Mobile",
        avatar: "https://randomuser.me/api/portraits/women/63.jpg",
        bio: "Lead Developer tại các startup công nghệ",
        coursesCount: 9,
    },
];

// Dữ liệu testimonials (slide thay thế cho CTA cũ)
const testimonials = [
    {
        id: 1,
        name: "Lê Minh Tuấn",
        role: "Sinh viên năm 3",
        avatar: "https://randomuser.me/api/portraits/men/21.jpg",
        content:
            "Khóa học React tại LMS Khoa CNTT đã giúp mình có được việc làm thực tập tại một công ty công nghệ ngay khi chưa tốt nghiệp. Giảng viên nhiệt tình, bài bản!",
        rating: 5,
    },
    {
        id: 2,
        name: "Nguyễn Thị Hoa",
        role: "Học viên cao học",
        avatar: "https://randomuser.me/api/portraits/women/28.jpg",
        content:
            "Cấu trúc dữ liệu và giải thuật được giảng dạy rất dễ hiểu, có nhiều bài tập thực hành. Mình đã đạt điểm cao trong kỳ thi tuyển sau đại học nhờ LMS.",
        rating: 5,
    },
    {
        id: 3,
        name: "Trần Văn Nam",
        role: "Lập trình viên tự do",
        avatar: "https://randomuser.me/api/portraits/men/45.jpg",
        content:
            "Machine Learning cơ bản giúp mình tiếp cận AI một cách có hệ thống. Tài liệu phong phú, hỗ trợ 24/7. Rất đáng để đầu tư thời gian.",
        rating: 4.8,
    },
];

const HomePage = () => {
    const testimonialRef = useRef<CarouselRef>(null);

    // Custom arrows cho testimonial carousel
    const next = () => testimonialRef.current?.next();
    const prev = () => testimonialRef.current?.prev();
    const { allPopularCourse, getPopularCourse } = useCourseStore();
    const navigate = useNavigate();

    useEffect(() => {
        getPopularCourse(8);
    }, [getPopularCourse]);

    const handleOpen = (id: string) => {
        navigate(`/courses/${id}`);
    };

    type PopularRow = Record<string, unknown> & {
        id?: string;
        instructor?: { name?: string; first_name?: string; last_name?: string };
    };

    const instructorLabel = (course: PopularRow): string => {
        const ins = course.instructor as PopularRow["instructor"];
        if (!ins || typeof ins !== "object") return "Giảng viên";
        if (typeof ins.name === "string") return ins.name;
        const n = `${ins.first_name ?? ""} ${ins.last_name ?? ""}`.trim();
        return n || "Giảng viên";
    };

    return (
        <>
            {/* Hero Carousel - cải thiện hiệu ứng và typography */}
            <div className="w-full">
                <Carousel autoplay autoplaySpeed={3500} className="h-[550px]">
                    {slides.map((slide) => (
                        <div key={slide.id} className="relative h-[550px]">
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className="w-full h-full object-cover brightness-50"
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 bg-black/30">
                                <Title
                                    level={1}
                                    style={{ color: "#fff" }}
                                    className="text-center mb-4 drop-shadow-lg animate-fadeInUp"
                                >
                                    {slide.title}
                                </Title>

                                <Paragraph
                                    style={{ color: "#fff" }}
                                    className="text-xl text-center max-w-2xl drop-shadow-md"
                                >
                                    {slide.description}
                                </Paragraph>
                                <Space
                                    size="middle"
                                    wrap
                                    className="mt-8 justify-center"
                                >
                                    <Button
                                        type="primary"
                                        size="large"
                                        className="shadow-lg hover:scale-105 transition-transform"
                                        onClick={() =>
                                            document
                                                .getElementById(
                                                    "featured-courses",
                                                )
                                                ?.scrollIntoView({
                                                    behavior: "smooth",
                                                })
                                        }
                                    >
                                        Khám phá khóa học{" "}
                                        <ArrowRightOutlined />
                                    </Button>
                                    <Link to="/learning-paths">
                                        <Button
                                            size="large"
                                            className="!bg-white/15 !border-white !text-white hover:!bg-white/25 hover:!text-white"
                                            icon={<ApartmentOutlined />}
                                        >
                                            Lộ trình & combo
                                        </Button>
                                    </Link>
                                </Space>
                            </div>
                        </div>
                    ))}
                </Carousel>
            </div>

            {/* Featured Courses - thêm tags, hover effect */}
            <div
                id="featured-courses"
                className="max-w-7xl mx-auto px-4 py-20"
            >
                <div className="text-center mb-14">
                    <Title level={2}>
                        <BookOutlined className="mr-2 text-blue-500" />
                        Khoá học nổi bật
                    </Title>
                    <Text type="secondary" className="text-lg block mb-5">
                        Lựa chọn hàng đầu của sinh viên CNTT
                    </Text>
                    <Link to="/learning-paths">
                        <Button type="primary" ghost icon={<ApartmentOutlined />}>
                            Xem combo theo lộ trình
                        </Button>
                    </Link>
                </div>
                <Row gutter={[28, 28]}>
                    {allPopularCourse?.map((raw) => {
                        const course = raw as PopularRow & {
                            enrollment_count?: number;
                            title?: string;
                            thumbnail_url?: string;
                            categories?: { id: string; name: string }[];
                        };
                        const id = course.id ?? "";
                        if (!id) return null;
                        return (
                        <Col xs={24} sm={12} lg={6} key={id}>
                            <Card
                                hoverable
                                cover={
                                    <div className="overflow-hidden rounded-t-lg">
                                        <img
                                            alt={course.title ?? ""}
                                            src={normalizeMediaUrl(
                                                course.thumbnail_url,
                                            )}
                                            className="h-52 w-full object-cover transition-transform duration-500 hover:scale-110"
                                        />
                                    </div>
                                }
                                actions={[
                                    <Button
                                        type="link"
                                        icon={<ArrowRightOutlined />}
                                        className="text-blue-600 font-medium"
                                        key="detail"
                                        onClick={() => handleOpen(id)}
                                    >
                                        Xem chi tiết
                                    </Button>,
                                ]}
                                className="rounded-xl shadow-md hover:shadow-xl transition-all"
                            >
                                <div className="mb-2">
                                    {Array.isArray(course.categories)
                                        ? course.categories.map((tag) => (
                                              <Tag
                                                  color="blue"
                                                  key={tag.id ?? tag.name}
                                                  className="mr-1 mb-1"
                                              >
                                                  {tag.name}
                                              </Tag>
                                          ))
                                        : null}
                                </div>
                                <Title level={5} className="mb-1 line-clamp-2">
                                    {course.title}
                                </Title>
                                <Text type="secondary" className="block mb-2">
                                    {instructorLabel(course)}
                                </Text>
                                <div className="flex items-center justify-between mt-3">
                                    <div>
                                        <Rate
                                            disabled
                                            defaultValue={
                                                typeof course.rating ===
                                                "number"
                                                    ? course.rating
                                                    :   4.8
                                            }
                                            allowHalf
                                            className="text-sm"
                                        />
                                    </div>
                                    <div>
                                        <UserOutlined className="mr-1 text-gray-400" />
                                        <Text className="text-sm">
                                            {Number(
                                                course.enrollment_count ?? 0,
                                            ).toLocaleString()}{" "}
                                            học viên
                                        </Text>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    );
                    })}
                </Row>
                <div className="text-center mt-12">
                    <Link to="/courses">
                        <Button type="primary" size="large" shape="round">
                            Xem tất cả khóa học
                            <ArrowRightOutlined className="ml-1" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Instructors Section - thêm số khóa học, social hint */}
            <div className="bg-gradient-to-b from-gray-50 to-white py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-14">
                        <Title level={2}>
                            <TeamOutlined className="mr-2 text-blue-500" />
                            Đội ngũ giảng viên
                        </Title>
                        <Text type="secondary" className="text-lg">
                            Học tập cùng chuyên gia đầu ngành, giàu kinh nghiệm
                            thực tế
                        </Text>
                    </div>
                    <Row gutter={[32, 32]}>
                        {instructors.map((instructor) => (
                            <Col xs={24} sm={12} md={6} key={instructor.id}>
                                <Card
                                    className="text-center shadow-md hover:shadow-xl transition-all rounded-xl border-0"
                                    bodyStyle={{ padding: "28px 20px" }}
                                >
                                    <Avatar
                                        size={100}
                                        src={instructor.avatar}
                                        icon={<UserOutlined />}
                                        className="mb-4 ring-4 ring-blue-100"
                                    />
                                    <Title level={4} className="mb-1">
                                        {instructor.name}
                                    </Title>
                                    <Text
                                        type="secondary"
                                        className="block mb-2"
                                    >
                                        {instructor.role}
                                    </Text>
                                    <Text className="text-sm text-gray-600">
                                        {instructor.bio}
                                    </Text>
                                    <Divider dashed className="my-4" />
                                    <div className="flex justify-center items-center gap-2">
                                        <BookOutlined className="text-blue-500" />
                                        <Text strong>
                                            {instructor.coursesCount} khoá học
                                        </Text>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </div>

            {/* Thay thế CTA cũ bằng Testimonial Carousel (slide khác) */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-20">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <Title level={2} className="text-white mb-2">
                        Học viên nói gì về chúng tôi?
                    </Title>
                    <Text className="text-white/80 text-lg block mb-12">
                        Hơn 10.000 học viên đã tin tưởng và phát triển sự nghiệp
                    </Text>

                    <div className="relative">
                        <Carousel
                            ref={testimonialRef}
                            dots={{ className: "custom-dots" }}
                            autoplay
                            autoplaySpeed={6000}
                            slidesToShow={1}
                            slidesToScroll={1}
                            effect="fade"
                            className="px-4 md:px-12"
                        >
                            {testimonials.map((item) => (
                                <div key={item.id} className="px-4 md:px-8">
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-10 shadow-xl border border-white/20">
                                        <div className="flex flex-col items-center">
                                            <Avatar
                                                src={item.avatar}
                                                size={70}
                                                className="ring-4 ring-white/30 mb-4"
                                            />
                                            <Rate
                                                disabled
                                                defaultValue={item.rating}
                                                allowHalf
                                                className="text-yellow-300 mb-3"
                                            />
                                            <Paragraph className="text-white text-lg italic max-w-2xl mb-4">
                                                “{item.content}”
                                            </Paragraph>
                                            <Title
                                                level={4}
                                                className="text-white mb-0"
                                            >
                                                {item.name}
                                            </Title>
                                            <Text className="text-white/80">
                                                {item.role}
                                            </Text>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Carousel>

                        {/* Nút điều hướng tùy chỉnh */}
                        <button
                            onClick={prev}
                            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-3 backdrop-blur transition-all z-10"
                        >
                            <LeftOutlined />
                        </button>
                        <button
                            onClick={next}
                            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-3 backdrop-blur transition-all z-10"
                        >
                            <RightOutlined />
                        </button>
                    </div>

                    {/* Thêm một nút hành động nhẹ nhàng bên dưới carousel */}
                    <div className="mt-12">
                        <Button
                            size="large"
                            ghost
                            shape="round"
                            icon={<HeartOutlined />}
                        >
                            Đăng ký nhận ưu đãi
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HomePage;
