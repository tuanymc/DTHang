import * as Minio from "minio";
import { minioConfig } from "../config/minio";
import { injectable } from "tsyringe";

@injectable()
export class MinioService {
    private minioClient: Minio.Client | null;
    private bucketName: string;

    constructor() {
        this.bucketName = minioConfig.bucketName;

        if (minioConfig.disabled) {
            this.minioClient = null;
            console.warn(
                "[MinIO] Đã tắt (MINIO_DISABLED=true). Upload thumbnail/video sẽ lỗi cho đến khi bật lại.",
            );
            return;
        }

        this.minioClient = new Minio.Client({
            endPoint: minioConfig.endPoint,
            port: minioConfig.port,
            useSSL: minioConfig.useSSL,
            accessKey: minioConfig.accessKey,
            secretKey: minioConfig.secretKey,
        });

        void this.initializeBucket().catch((err: unknown) => {
            const msg = err instanceof Error ? err.message : String(err);
            console.warn(
                "[MinIO] Không đảm bảo bucket khi khởi động (mạng / firewall / MinIO down). API vẫn chạy. Chi tiết:",
                msg,
            );
        });
    }

    private assertClient(): Minio.Client {
        if (!this.minioClient) {
            throw new Error(
                "MinIO chưa bật. Đặt MINIO_DISABLED=false và cấu hình MINIO_* trong .env.",
            );
        }
        return this.minioClient;
    }

    private async initializeBucket(): Promise<void> {
        const client = this.assertClient();
        const bucketExists = await client.bucketExists(this.bucketName);
        if (!bucketExists) {
            await client.makeBucket(this.bucketName, "");
            await client.setBucketPolicy(
                this.bucketName,
                JSON.stringify({
                    Version: "2012-10-17",
                    Statement: [
                        {
                            Effect: "Allow",
                            Principal: "*",
                            Action: ["s3:GetObject"],
                            Resource: [`arn:aws:s3:::${this.bucketName}/*`],
                        },
                    ],
                }),
            );
        }
    }

    async uploadFile(
        file: Express.Multer.File,
        folderPath: string = "",
    ): Promise<{ url: string; key: string }> {
        const client = this.assertClient();
        const originalFileName = file.originalname;
        const key = `${folderPath}/${originalFileName}`.replace(/^\/+/, "");

        await client.putObject(this.bucketName, key, file.buffer, file.size, {
            "Content-Type": file.mimetype,
        });

        const scheme = minioConfig.useSSL ? "https" : "http";
        const url = `${scheme}://${minioConfig.endPoint}:${minioConfig.port}/${this.bucketName}/${key}`;
        return { url, key };
    }

    async uploadBuffer(
        buffer: Buffer,
        fileName: string,
        folderPath: string,
        contentType: string = "application/pdf",
    ): Promise<{ url: string; key: string }> {
        const client = this.assertClient();
        const key = `${folderPath}/${fileName}`.replace(/^\/+/, "");

        await client.putObject(this.bucketName, key, buffer, buffer.length, {
            "Content-Type": contentType,
        });

        const scheme = minioConfig.useSSL ? "https" : "http";
        const url = `${scheme}://${minioConfig.endPoint}:${minioConfig.port}/${this.bucketName}/${key}`;
        return { url, key };
    }

    async deleteFile(key: string): Promise<void> {
        await this.assertClient().removeObject(this.bucketName, key);
    }

    async getFileUrl(key: string): Promise<string> {
        const scheme = minioConfig.useSSL ? "https" : "http";
        return `${scheme}://${minioConfig.endPoint}:${minioConfig.port}/${this.bucketName}/${key}`;
    }

    async getPresignedUrl(
        key: string,
        expiry: number = 24 * 60 * 60,
    ): Promise<string> {
        return this.assertClient().presignedGetObject(
            this.bucketName,
            key,
            expiry,
        );
    }
}
