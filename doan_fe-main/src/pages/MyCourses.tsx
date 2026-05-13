import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  Tabs,
  Input,
  Progress,
  Tag,
  Button,
  Empty,
  Badge,
  Typography,
  Tooltip,
  Spin,
  message,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { courseService } from "../services/course.service";
import { normalizeMediaUrl } from "../utils/mediaUrl";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

type UiStatus = "in_progress" | "completed";

interface UiCourseRow {
  id: string;
  code: string;
  title: string;
  instructor: string;
  credits: number;
  thumbnail: string;
  progress: number;
  status: UiStatus;
  enrolledAt?: string | null;
  description?: string | null;
  access_kind?: "trial" | "full" | null;
}

const MyCourses: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<UiStatus | "all">("all");
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [rows, setRows] = useState<UiCourseRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let c = false;
    (async () => {
      setLoading(true);
      try {
        const res = await courseService.myEnrollments();
        if (c) return;
        const payload = Array.isArray(res.data) ?
            res.data
          :   [];
        const mapped: UiCourseRow[] = payload.map((e: Record<string, unknown>) => {
          const pct = Number(e.progress_percent ?? 0);
          const status = pct >= 100 ? "completed" : "in_progress";
          const inst = `${String(e.inst_fn ?? "").trim()} ${String(e.inst_ln ?? "").trim()}`.trim();
          const title =
            String((e.title as string) ?? "");
          return {
            id: String(e.course_id ?? ""),
            code: title ? title.slice(0, 12).replace(/\s/g, "").toUpperCase() : "...",
            title,
            instructor: inst || String(e.inst_email ?? "Giảng viên"),
            credits: 3,
            thumbnail: normalizeMediaUrl(
              (e.thumbnail_url as string) ?? "",
            ),
            progress: pct,
            status,
            enrolledAt:
                typeof e.enrolled_at === "string" ? e.enrolled_at : null,
            description:
                typeof e.description === "string" ? e.description : null,
            access_kind:
                e.access_kind === "trial" || e.access_kind === "full" ?
                    e.access_kind
                :   null,
          };
        }).filter((r: UiCourseRow) => r.id);

        setRows(mapped);
      } catch {
        message.error(
          "Không tải được khóa học (cần đăng nhập hoặc lỗi máy chủ).",
        );
        setRows([]);
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, []);

  const filtered = useMemo(() => {
    let list = [...rows];
    if (activeTab !== "all")
      list = list.filter((course) => course.status === activeTab);
    const kw = searchKeyword.trim().toLowerCase();
    if (kw) {
      list = list.filter(
        (course) =>
          course.title.toLowerCase().includes(kw) ||
          course.code.toLowerCase().includes(kw),
      );
    }
    return list;
  }, [rows, activeTab, searchKeyword]);

  const handleContinue = (courseId: string): void => {
    navigate(`/learning?courseId=${encodeURIComponent(courseId)}`);
  };

  const renderCourseCard = (course: UiCourseRow): React.ReactNode => {
    const isCompleted = course.progress >= 100;
    const statusColor: string =
        course.status === "completed" ? "green" : "blue";
    const statusText: string =
        course.status === "completed" ? "Hoàn thành" : "Đang học";

    return (
      <Col xs={24} sm={12} lg={8} xl={8} key={course.id}>
        <Card
          hoverable
          className="h-full rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl"
          cover={
            <div className="relative h-40 overflow-hidden rounded-t-2xl">
              <img
                alt={course.title}
                src={course.thumbnail}
                className="w-full h-full object-cover"
              />
              <Badge.Ribbon
                text={statusText}
                color={statusColor}
                className="absolute top-2 right-2"
              />
            </div>
          }
          actions={[
            <Button
              key="continue"
              type="primary"
              icon={<RightOutlined />}
              onClick={() => handleContinue(course.id)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isCompleted ? "Xem lại" : "Tiếp tục học"}
            </Button>,
          ]}
        >
          <div className="space-y-2">
            <div className="flex justify-between items-start gap-2 flex-wrap">
              <Tag color="cyan" className="font-mono text-xs">
                {course.code}
              </Tag>
              <div className="flex flex-wrap gap-1 justify-end">
                {course.access_kind === "trial" && (
                  <Tag color="orange">Học thử</Tag>
                )}
                {course.access_kind === "full" && (
                  <Tag color="green">Đầy đủ</Tag>
                )}
                <Tooltip title="Số tín chỉ (minh họa)">
                  <div className="flex items-center text-gray-500 text-sm">
                    <CreditCardOutlined className="mr-1" />
                    {course.credits} TC
                  </div>
                </Tooltip>
              </div>
            </div>

            <Title level={5} className="!mb-0 line-clamp-2 min-h-[56px]">
              {course.title}
            </Title>

            <div className="flex items-center text-gray-500 text-sm">
              <UserOutlined className="mr-1" />
              <span className="truncate">{course.instructor}</span>
            </div>

            <div className="flex justify-between gap-6 items-start">
              <div className="flex-1 mt-4">
                <Progress
                  percent={Math.min(100, Math.round(course.progress))}
                  size="small"
                  status={course.status === "completed" ? "success" : "active"}
                />
              </div>
              <div className="flex items-center mt-6 text-xs text-gray-500">
                <ClockCircleOutlined />
                &nbsp;
                Ghi danh:&nbsp;
                {course.enrolledAt ?
                    course.enrolledAt.slice(0, 10)
                :   "—"}
              </div>
            </div>
          </div>
        </Card>
      </Col>
    );
  };

  return (
    <div className="mx-auto px-6 py-8 max-w-[1200px]">
      <Tabs
        activeKey={activeTab}
        animated={{ inkBar: false, tabPane: false }}
        onChange={(k) =>
          setActiveTab(k as UiStatus | "all")
        }
      >
        <TabPane tab="Tất cả" key="all" />
        <TabPane tab="Đang học" key="in_progress" />
        <TabPane tab="Đã hoàn thành" key="completed" />
      </Tabs>

      <div className="flex flex-wrap gap-4 my-8 items-center">
        <span className="text-gray-500 text-sm whitespace-nowrap">
          Tìm trong danh sách của bạn
        </span>
        <Input
          placeholder="Tiêu đề khóa, mã lớp..."
          allowClear
          value={searchKeyword}
          prefix={<SearchOutlined />}
          style={{ flex: "1", minWidth: 220 }}
          onChange={(e) =>
            setSearchKeyword(e.target.value)
          }
        />
      </div>

      <Row gutter={[20, 20]}>
        {loading ?
          <Spin className="w-full py-24" />
        : filtered.length === 0 ?
          <Col span={24}>
            <Empty description="Không có khóa học trùng bộ lọc" />
          </Col>
        : filtered.map((c) => renderCourseCard(c))}
      </Row>
    </div>
  );
};

export default MyCourses;
