import express, { NextFunction, Request, Response } from "express";
import "reflect-metadata";
import { Pool } from "pg"; // Thay thế mysql2 bằng pg
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes";
import cookieParser from "cookie-parser";

dotenv.config({ path: "../.env" });

const app = express();

// Phục vụ các tệp tĩnh
app.use("/api/uploads", express.static("/app/uploads"));

app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// Middleware để xử lý dữ liệu đầu vào
app.use(cookieParser());
// Sử dụng cors middleware
app.use(
    cors({
        origin: ["http://localhost:5173", "http://localhost:5174"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);

// Middleware để xử lý dữ liệu đầu vào với giới hạn kích thước
// const bodyParser = require('body-parser');
// app.use(bodyParser.json({ limit: '50mb' }));
// app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Sử dụng router
app.use("/api", router);

// Đăng ký middleware xử lý lỗi toàn cục
// app.use(errorHandler);

// Middleware tùy chỉnh để xử lý dữ liệu đầu vào
app.use((req: Request, _: Response, next: NextFunction) => {
    next();
});

app.use((_: Request, res: Response) => {
    res.json({ message: "Không tìm thấy đường dẫn" });
});

export default app;
