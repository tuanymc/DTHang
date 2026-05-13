import React, { useState } from 'react';
import { Form, Input, Button, Space, Table, Popconfirm, message, InputNumber, Card, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Exam, Question } from './types';

interface ExamFormProps {
  exam: Exam;
  onUpdate: (exam: Exam) => void;
}

const ExamForm: React.FC<ExamFormProps> = ({ exam, onUpdate }) => {
  const [questions, setQuestions] = useState<Question[]>(exam.questions || []);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleSaveQuestion = (values: any) => {
    if (editingQuestion) {
      const updated = questions.map(q => q.id === editingQuestion.id ? { ...q, ...values } : q);
      setQuestions(updated);
      message.success('Cập nhật câu hỏi thành công');
    } else {
      const newQuestion: Question = {
        id: Date.now().toString(),
        text: values.text,
        options: values.options.split(',').map((opt: string) => opt.trim()),
        correctAnswer: values.correctAnswer,
        points: values.points,
      };
      setQuestions([...questions, newQuestion]);
      message.success('Thêm câu hỏi thành công');
    }
    setModalVisible(false);
    setEditingQuestion(null);
    form.resetFields();
    onUpdate({ ...exam, questions: [...questions, ...(editingQuestion ? [] : [])] }); // cần cập nhật sau state
  };

  // Cập nhật exam khi questions thay đổi
  React.useEffect(() => {
    onUpdate({ ...exam, questions });
  }, [questions]);

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    message.success('Xóa câu hỏi thành công');
  };

  const openEditModal = (q: Question) => {
    setEditingQuestion(q);
    form.setFieldsValue({
      text: q.text,
      options: q.options.join(', '),
      correctAnswer: q.correctAnswer,
      points: q.points,
    });
    setModalVisible(true);
  };

  const columns = [
    { title: 'Câu hỏi', dataIndex: 'text', key: 'text' },
    { title: 'Điểm', dataIndex: 'points', key: 'points', width: 80 },
    {
      title: 'Hành động',
      key: 'action',
      width: 100,
      render: (_: any, record: Question) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEditModal(record)} />
          <Popconfirm title="Xóa câu hỏi?" onConfirm={() => deleteQuestion(record.id)}>
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <Input
          value={exam.title}
          onChange={(e) => onUpdate({ ...exam, title: e.target.value })}
          placeholder="Tiêu đề bài kiểm tra"
          className="max-w-md"
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingQuestion(null); form.resetFields(); setModalVisible(true); }}>
          Thêm câu hỏi
        </Button>
      </div>
      <Table
        dataSource={questions}
        columns={columns}
        rowKey="id"
        pagination={false}
        size="small"
        className="mb-3"
      />
      <div className="flex items-center gap-2 mt-2">
        <span className="text-sm">Điểm đạt:</span>
        <InputNumber
          min={0}
          max={100}
          value={exam.passingScore}
          onChange={(val) => onUpdate({ ...exam, passingScore: val || 0 })}
          className="w-24"
          addonAfter="%"
        />
      </div>

      {/* Modal thêm/sửa câu hỏi */}
      <Modal
        title={editingQuestion ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}
        open={modalVisible}
        onCancel={() => { setModalVisible(false); setEditingQuestion(null); form.resetFields(); }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveQuestion}>
          <Form.Item name="text" label="Nội dung câu hỏi" rules={[{ required: true }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="options" label="Các lựa chọn (cách nhau bằng dấu phẩy)" rules={[{ required: true }]}>
            <Input placeholder="Đáp án A, Đáp án B, Đáp án C, Đáp án D" />
          </Form.Item>
          <Form.Item name="correctAnswer" label="Đáp án đúng" rules={[{ required: true }]}>
            <Input placeholder="Nhập chính xác nội dung đáp án đúng" />
          </Form.Item>
          <Form.Item name="points" label="Điểm" initialValue={1} rules={[{ required: true }]}>
            <InputNumber min={0.5} step={0.5} className="w-full" />
          </Form.Item>
          <Form.Item className="flex justify-end">
            <Button onClick={() => setModalVisible(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" className="ml-2">Lưu</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExamForm;