import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  Input,
  Button,
  Empty,
  Typography,
  Avatar,
  Tag,
  Rate,
  message,
  Spin,
} from "antd";
import {
  HeartFilled,
  EyeOutlined,
  SearchOutlined,
  UserOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { courseService } from "../services/course.service";
import { normalizeMediaUrl } from "../utils/mediaUrl";

const { Title, Text, Paragraph } = Typography;

interface WishRow {
  course_id: string;
  title: string;
  thumbnail: string;
  instructor: string;
  price: number;
  level: string | null;
  addedDate: string;
  rating: number;
  totalReviews: number;
}

const Wishlist: React.FC = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState<WishRow[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const load = (): void => {
    (async () => {
      setLoading(true);
      try {
        const res = await courseService.myWishlist();
        const data = Array.isArray(res.data) ? res.data : [];
        const mapped: WishRow[] = data.map((r: Record<string, unknown>) => {
          const inst = `${String(r.inst_fn ?? "").trim()} ${String(r.inst_ln ?? "").trim()}`.trim();
          return {
            course_id: String(r.course_id ?? ""),
            title: String(r.title ?? ""),
            thumbnail: normalizeMediaUrl(
              (r.thumbnail_url as string) ?? "",
            ),
            instructor: inst || "Giảng viên",
            price: Number(r.price ?? 0),
            level: r.level ? String(r.level) : null,
            addedDate:
                typeof r.created_at_wish === "string" ?
                    r.created_at_wish.slice(0, 10)
                :   "",
            rating: 4.8,
            totalReviews: Number(r.enrolled_count ?? 0),
          };
        }).filter((x: WishRow) => x.course_id);

        setItems(mapped);
      } catch {
        message.error("Không tải được wishlist — cần đăng nhập.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  };

  useEffect(() => {
    load();
  }, []);

  const filteredItems = useMemo(() => {
    const kw = searchKeyword.toLowerCase().trim();
    return items.filter((course) =>
      !kw
        ? true
        : course.title.toLowerCase().includes(kw)
            || course.instructor.toLowerCase().includes(kw),
    );
  }, [items, searchKeyword]);

  const removeFromWishlist = async (courseId: string) => {
    try {
      await courseService.wishlistRemove(courseId);
      setItems((prev) =>
        prev.filter((item) => item.course_id !== courseId),
      );
      message.success("Đã xóa khỏi yêu thích");
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })
            ?.response?.data?.message ?? "Lỗi xóa";
      message.error(msg);
    }
  };

  const goToCourseDetail = (courseId: string) =>
    navigate(`/courses/${courseId}`);

  const renderCourseCard = (course: WishRow) => {
    const isFree = course.price === 0;

    return (
      <Col xs={24} sm={12} lg={8} xl={6} key={course.course_id}>
        <Card
          hoverable
          className="h-full rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
          cover={
            <div className="relative h-44 overflow-hidden bg-gray-100">
              <img
                alt={course.title}
                src={course.thumbnail}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              <Button
                type="text"
                danger
                icon={<HeartFilled className="text-red-500" />}
                className="absolute top-2 right-2 z-10 bg-white/80 rounded-full"
                aria-label="Bỏ yêu thích"
                onClick={() => removeFromWishlist(course.course_id)}
              />
            </div>
          }
          actions={[
            <Button
              type="primary"
              key="study"
              icon={<EyeOutlined />}
              onClick={() => goToCourseDetail(course.course_id)}
            >
              Xem chi tiết
            </Button>,
          ]}
        >
          <Title level={5} className="line-clamp-2 min-h-[48px] !mb-2">
            {course.title}
          </Title>

          <div className="flex gap-3 mb-4">
            <Avatar size={32} icon={<UserOutlined />} />
            <div className="flex flex-col gap-1">
              <Text type="secondary" className="text-xs uppercase">
                Giảng viên
              </Text>
              <Text strong>{course.instructor}</Text>
            </div>
          </div>

          <div className="flex items-center mb-4">
            <Rate
              allowHalf
              disabled
              value={course.rating}
              className="text-sm mr-2"
            />
            <StarOutlined />
            &nbsp;
            <span className="text-sm text-gray-500">
              {course.totalReviews.toLocaleString()} học viên
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <Text delete={!isFree} className={isFree ? "text-green-600" : ""}>
                {isFree ? "FREE" : `${course.price.toLocaleString("vi-VN")} ₫`}
              </Text>
            </div>
            <div className="text-gray-400 text-xs">
              Thêm: {course.addedDate || "—"}
            </div>
          </div>

          <div className="mt-2">
            <Tag>{course.level || "All levels"}</Tag>
          </div>
        </Card>
      </Col>
    );
  };

  return (
    <div className="min-h-[70vh] max-w-[1280px] mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <Title level={2} className="!mb-2">
          <HeartFilled className="text-red-500 mr-2" />
          Danh sách yêu thích
        </Title>
        <Paragraph type="secondary" className="!mb-0">
          Khóa học bạn đã lưu — đăng nhập và thêm bằng nút Wishlist trên trang chi tiết.
        </Paragraph>
      </div>

      <Card className="rounded-2xl shadow-sm mb-8">
        <Input
          placeholder="Tìm theo tiêu đề hay giảng viên..."
          allowClear
          size="large"
          prefix={<SearchOutlined className="text-gray-400" />}
          className="max-w-xl"
          value={searchKeyword}
          onChange={(e) =>
            setSearchKeyword(e.target.value)
          }
        />
      </Card>

      {loading ?
        <div className="flex justify-center py-24">
          <Spin size="large" />
        </div>
      : filteredItems.length === 0 ?
        <Empty description="Chưa có khóa học yêu thích" />
      :   <Row gutter={[24, 24]}>{filteredItems.map(renderCourseCard)}</Row>}
    </div>
  );
};

export default Wishlist;
