import { useState } from "react";
import { Card, Radio, Button, Typography, Space, message, Result } from "antd";
import { QuizContent } from "../../../data/courseData";

const { Title, Text } = Typography;

export interface QuizCompleteDetail {
    scorePercent: number;
    passed: boolean;
    selectedIndexes: number[];
    correctCount: number;
    totalQuestions: number;
}

interface QuizPlayerProps {
    content: QuizContent;
    onComplete: (detail: QuizCompleteDetail) => void;
}

const QuizPlayer = ({ content, onComplete }: QuizPlayerProps) => {
    const [answers, setAnswers] = useState<number[]>(
        new Array(content.questions.length).fill(-1),
    );
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    const handleSubmit = () => {
        if (answers.some((a) => a === -1)) {
            message.warning("Vui lòng trả lời tất cả câu hỏi");
            return;
        }
        let correct = 0;
        content.questions.forEach((q, idx) => {
            if (answers[idx] === q.correctAnswer) correct++;
        });
        const finalScore = (correct / content.questions.length) * 100;
        const passed = finalScore >= (content.passingScore || 70);
        setScore(finalScore);
        setSubmitted(true);
        onComplete({
            scorePercent: finalScore,
            passed,
            selectedIndexes: [...answers],
            correctCount: correct,
            totalQuestions: content.questions.length,
        });
    };

    if (submitted) {
        return (
            <Result
                status={
                    score >= (content.passingScore || 70) ? "success" : "error"
                }
                title={
                    score >= (content.passingScore || 70) ?
                        "Hoàn thành xuất sắc!"
                    :   "Chưa đạt yêu cầu"
                }
                subTitle={`Điểm của bạn: ${score.toFixed(0)}%`}
            />
        );
    }

    return (
        <Card className="shadow-md">
            <Title level={3}>📝 Bài kiểm tra</Title>
            {content.questions.map((q, idx) => (
                <div key={q.id} className="mb-6">
                    <Text strong className="block mb-2">
                        {idx + 1}. {q.text}
                    </Text>
                    <Radio.Group
                        onChange={(e) => {
                            const newAnswers = [...answers];
                            newAnswers[idx] = e.target.value;
                            setAnswers(newAnswers);
                        }}
                        value={answers[idx]}
                    >
                        <Space direction="vertical">
                            {q.options.map((opt, optIdx) => (
                                <Radio key={optIdx} value={optIdx}>
                                    {opt}
                                </Radio>
                            ))}
                        </Space>
                    </Radio.Group>
                </div>
            ))}
            <Button type="primary" onClick={handleSubmit}>
                Nộp bài
            </Button>
        </Card>
    );
};

export default QuizPlayer;
