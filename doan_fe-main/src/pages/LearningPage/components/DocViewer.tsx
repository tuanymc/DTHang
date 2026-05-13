import { Card, Typography } from "antd";
import type { CSSProperties } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Components } from "react-markdown";
import { DocsContent } from "../../../data/courseData";

const { Title } = Typography;

const codeStyle = vscDarkPlus as { [key: string]: CSSProperties };

interface DocViewerProps {
    content: DocsContent;
    title: string;
}

const DocViewer = ({ content, title }: DocViewerProps) => {
    const mdComponents: Components = {
        code({ className, children, ...rest }) {
            const match = /language-(\w+)/.exec(className || "");
            const inline = !className?.includes("language-");
            if (!inline && match) {
                return (
                    <SyntaxHighlighter
                        style={codeStyle}
                        language={match[1]}
                        PreTag="div"
                    >
                        {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                );
            }
            return (
                <code className={className} {...rest}>
                    {children}
                </code>
            );
        },
    };

    const renderContent = () => {
        switch (content.type) {
            case "markdown":
                return (
                    <ReactMarkdown components={mdComponents}>
                        {content.content}
                    </ReactMarkdown>
                );
            case "html":
                return (
                    <div dangerouslySetInnerHTML={{ __html: content.content }} />
                );
            case "text":
                return (
                    <pre className="whitespace-pre-wrap">{content.content}</pre>
                );
            case "pdf":
                return (
                    <iframe
                        src={content.content}
                        className="w-full h-[70vh]"
                        title={title}
                    />
                );
            default:
                return <div>Định dạng không hỗ trợ</div>;
        }
    };

    return (
        <Card className="shadow-md rounded-xl overflow-auto max-h-[calc(100vh-120px)]">
            <Title level={3} className="mb-4">
                {title}
            </Title>
            <div className="prose max-w-none">{renderContent()}</div>
        </Card>
    );
};

export default DocViewer;
