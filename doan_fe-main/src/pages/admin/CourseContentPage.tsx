import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Table, Space, Tag, Avatar, Typography, message, Spin } from 'antd';
import { SearchOutlined, EditOutlined, BookOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { useCourseStore } from '../../store/useCourseStore';

const { Title } = Typography;

interface Course {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string;
  instructor_name: string;
  level: string;
  status: string;
  sections_count: number;
  lessons_count: number;
}

const CourseContentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const { courses, getCourses, isLoading } = useCourseStore();

  useEffect(() => {
    getCourses();
  }, []);

  const handleEditContent = (courseId: string) => {
    navigate(`/admin/v1/courses/${courseId}/contents`);
  };

  // const filteredCourses = courses.filter(course => {
  //   const matchSearch = course.title.toLowerCase().includes(searchText.toLowerCase()) ||
  //                       course.instructor_name.toLowerCase().includes(searchText.toLowerCase());
  //   const matchStatus = statusFilter === 'all' || course.status === statusFilter;
  //   return matchSearch && matchStatus;
  // });

  const columns: ColumnsType<Course> = [
    {
      title: 'Khóa học',
      key: 'course',
      render: (_, record) => (
        <Space>
          <Avatar shape="square" size={48} src={ 'http://' + record.thumbnail_url} icon={<BookOutlined />} />
          <div>
            <div className="font-medium">{record.title}</div>
            <div className="text-xs text-gray-500">Giảng viên: {record.instructor_name}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Cấp độ',
      dataIndex: 'level',
      key: 'level',
      render: (level) => <Tag color={level === 'beginner' ? 'green' : level === 'intermediate' ? 'orange' : 'red'}>{level}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={status === 'published' ? 'blue' : 'default'}>{status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}</Tag>,
    },
    {
      title: 'Số sections',
      dataIndex: 'sections_count',
      key: 'sections_count',
    },
    {
      title: 'Số bài học',
      dataIndex: 'lessons_count',
      key: 'lessons_count',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" ghost icon={<EditOutlined />} onClick={() => handleEditContent(record.id)}>
          Quản lý nội dung
        </Button>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <Card className="shadow-md rounded-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <Title level={3} className="!mb-0">Quản lý bài giảng</Title>
          <Space>
            <Input
              placeholder="Tìm kiếm khóa học..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
            />
          </Space>
        </div>
        <Table
          columns={columns}
          dataSource={courses}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 8 }}
          className="border rounded-xl overflow-hidden"
        />
      </Card>
    </div>
  );
};

export default CourseContentPage;