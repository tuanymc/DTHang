import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "./auth.middleware";

/**
 * Đặt req.user khi có access_token hợp lệ; nếu không có hoặc hết hạn thì tiếp tục không lỗi.
 */
export const optionalAuthMiddleware = (
    req: Request,
    _: Response,
    next: NextFunction,
) => {
    try {
        const token = req.cookies.access_token;
        if (!token) return next();

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!,
        ) as JwtPayload;
        (req as any).user = decoded;
    } catch {
        /* không đăng nhập — bỏ qua */
    }
    next();
};
