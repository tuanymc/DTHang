/** MinIO client yêu cầu `endPoint` là hostname/IP thuần, không chứa cổng. */
function resolveMinioHostPort(
    rawEndpoint: string | undefined,
    portFromEnv: string | undefined,
): { endPoint: string; port: number } {
    const fallbackPort =
        Number.parseInt(portFromEnv || "9000", 10) || 9000;
    const raw = rawEndpoint?.trim();
    if (!raw) {
        return { endPoint: "host.docker.internal", port: fallbackPort };
    }

    try {
        const url =
            raw.includes("://") ? new URL(raw)
            : new URL(`http://${raw}`);
        const parsedPort =
            url.port ?
                Number.parseInt(url.port, 10)
            :   fallbackPort;
        return {
            endPoint: url.hostname,
            port: parsedPort || fallbackPort,
        };
    } catch {
        return { endPoint: raw, port: fallbackPort };
    }
}

const resolved = resolveMinioHostPort(
    process.env.MINIO_ENDPOINT,
    process.env.MINIO_PORT,
);

export const minioConfig = {
    /** Tắt MinIO hoàn toàn (dev không có S3): MINIO_DISABLED=true */
    disabled: process.env.MINIO_DISABLED === "true",
    endPoint: resolved.endPoint,
    port: resolved.port,
    useSSL:
        process.env.MINIO_SSL === "true"
        || process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY || "your-access-key",
    secretKey: process.env.MINIO_SECRET_KEY || "your-secret-key",
    bucketName: process.env.MINIO_BUCKET || "your-bucket-name",
};
