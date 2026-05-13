import { useState, useEffect, useCallback, useRef } from "react";
import {
    Card,
    Radio,
    Button,
    Typography,
    Space,
    message,
    Result,
    Progress,
} from "antd";
import { ExamContent } from "../../../data/courseData";
import type { QuizCompleteDetail } from "./QuizPlayer";

const { Title, Text } = Typography;

interface ExamPlayerProps {
    content: ExamContent;
    onComplete: (detail: QuizCompleteDetail) => void;
}

const ExamPlayer = ({ content, onComplete }: ExamPlayerProps) => {
    const [answers, setAnswers] = useState<number[]>(
        new Array(content.questions.length).fill(-1),
    );
    const [submitted, setSubmitted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(content.timeLimit * 60);
    const [score, setScore] = useState(0);
    const finalizedRef = useRef(false);

    const computeAndSubmit = useCallback(() => {
        if (finalizedRef.current) return;
        finalizedRef.current = true;

        let correct = 0;
        const total = content.questions.length;

        answers.forEach((a, idx) => {
            if (a !== -1 && a === content.questions[idx]?.correctAnswer) {
                correct++;
            }
        });

        const finalScore = total === 0 ? 0 : (correct / total) * 100;
        const passed = finalScore >= content.passingScore;
        setScore(finalScore);
        setSubmitted(true);
        onComplete({
            scorePercent: finalScore,
            passed,
            selectedIndexes: [...answers],
            correctCount: correct,
            totalQuestions: total,
        });
    }, [answers, content, onComplete]);

    useEffect(() => {
        if (submitted) return;
        if (timeLeft <= 0) {
            computeAndSubmit();
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, submitted, computeAndSubmit]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const handleSubmitClick = () => {
        if (answers.some((a) => a === -1)) {
            message.warning(
                "Vui lòng trả lời tất cả câu hỏi trước khi nộp bài",
            );
            return;
        }
        computeAndSubmit();
    };

    if (submitted) {
        return (
            <Result
                status={score >= content.passingScore ? "success" : "error"}
                title={
                    score >= content.passingScore ?
                        "Chúc mừng bạn đã vượt qua kỳ thi!"
                    :   "Rất tiếc, bạn chưa đạt"
                }
                subTitle={`Điểm: ${score.toFixed(0)}% (Yêu cầu: ${content.passingScore}%)`}
            />
        );
    }

    return (
        <Card className="shadow-md">
            <div className="flex justify-between items-center mb-4">
                <Title level={3}>📌 Bài thi cuối kỳ</Title>
                <Progress
                    type="circle"
                    percent={(timeLeft / (content.timeLimit * 60)) * 100}
                    format={() => formatTime(Math.max(timeLeft, 0))}
                    width={80}
                />
            </div>
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
            <Button type="primary" danger onClick={handleSubmitClick}>
                Nộp bài thi
            </Button>
        </Card>
    );
};

export default ExamPlayer;
