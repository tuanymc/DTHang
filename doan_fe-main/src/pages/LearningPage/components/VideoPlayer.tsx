import { Card, Button } from "antd";

interface VideoPlayerProps {
    url?: string;
    videoUrl?: string;
    title: string;
    poster?: string;
    onPlaybackComplete?: () => void;
}

function toEmbedYoutube(url: string): string | null {
    const trimmed = url.trim();
    let m = trimmed.match(/youtube\.com\/embed\/([\w-]+)/i);
    if (m) return `https://www.youtube.com/embed/${m[1]}`;
    m = trimmed.match(/[?&]v=([\w-]+)/);
    if (m) return `https://www.youtube.com/embed/${m[1]}`;
    m = trimmed.match(/youtu\.be\/([\w-]+)/);
    if (m) return `https://www.youtube.com/embed/${m[1]}`;
    return null;
}

const VideoPlayer = ({
    url,
    videoUrl,
    title,
    poster,
    onPlaybackComplete,
}: VideoPlayerProps) => {
    const src = url || videoUrl || "";
    const yt = src ? toEmbedYoutube(src) : null;

    return (
        <Card className="shadow-md rounded-xl overflow-hidden">
            <div className="w-full aspect-video bg-black">
                {yt ? (
                    <iframe
                        title={title}
                        src={yt}
                        className="w-full h-full border-0"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                ) : (
                    <video
                        src={src}
                        controls
                        className="w-full aspect-video bg-black"
                        poster={
                            poster ||
                            "https://via.placeholder.com/800x450?text=LMS+Video"
                        }
                        onEnded={() => onPlaybackComplete?.()}
                    >
                        Trình duyệt không hỗ trợ phát video.
                    </video>
                )}
            </div>
            <div className="p-3">
                <h3 className="text-lg font-semibold">{title}</h3>
                {yt && onPlaybackComplete ? (
                    <Button
                        type="primary"
                        className="mt-2"
                        onClick={() => onPlaybackComplete()}
                    >
                        Đánh dấu đã xem
                    </Button>
                ) : null}
            </div>
        </Card>
    );
};

export default VideoPlayer;
