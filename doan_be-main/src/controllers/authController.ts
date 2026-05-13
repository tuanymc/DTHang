import { injectable } from "tsyringe";
import { AuthService } from "../services/auth.service";
import { UserLoginDTO, UserRegisDTO } from "../types/user";
import { Request, Response } from "express";

@injectable()
export class AuthController {
    constructor(
        private authService: AuthService,
        // private minioService: MinioService
    ) {}

    async login(req: Request, res: Response): Promise<any> {
        console.log(req.body);
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({ message: "Thiếu thông tin đăng nhập." });
                return;
            }

            // Kiểm tra và ép kiểu đúng
            const userLoginDto: UserLoginDTO = {
                email,
                password,
            };

            const ip =
                req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
                req.socket.remoteAddress;

            const deviceInfo = req.headers["user-agent"];

            // const { token, user } = await this.authService.loginUser(
            //     userLoginDto,
            //     { ip, deviceInfo },
            // );

            const result = await this.authService.loginUser(
                { email, password },
                { ip, deviceInfo },
            );

            res.cookie("access_token", result.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 15 * 60 * 1000,
            });

            res.cookie("refresh_token", result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            // Trả về token và thông tin người dùng
            return res.status(200).json({
                message: "Login successfully",
                user: result.user,
            });
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }

    async regisUser(req: Request, res: Response): Promise<any> {
        console.log(req.body);
        try {
            const {
                code_unique,
                email,
                password_hash,
                first_name,
                last_name,
                role_id,
            } = req.body;

            console.log(req.body);

            if (!email || !password_hash) {
                res.status(400).json({ message: "Thiếu thông tin đăng ký." });
                return;
            }

            const result = await this.authService.regisUser({ ...req.body });

            // Trả về token và thông tin người dùng
            return res.status(200).json({
                message: "Register successfully",
                user: result.user,
            });
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }

    async createRole(req: Request, res: Response): Promise<any> {
        console.log(req.body);
        try {
            const { id, role_name, description } = req.body;

            if (!role_name || !description) {
                res.status(400).json({ message: "Thiếu thông tin." });
                return;
            }

            const result = await this.authService.createRole({
                role_name,
                description,
            });

            return res.status(200).json({
                message: "Create role successfully",
                role: result,
            });
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }

    async refreshToken(req: Request, res: Response): Promise<any> {
        try {
            const refreshToken = req.cookies.refresh_token;

            if (!refreshToken) {
                return res.status(401).json({
                    message: "No refresh token",
                });
            }

            const tokens = await this.authService.refreshToken(refreshToken);

            res.cookie("refresh_token", tokens.refreshToken, {
                httpOnly: true,
                sameSite: "strict",
                secure: false,
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.cookie("access_token", tokens.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 15 * 60 * 1000,
            });

            return res.json({
                accessToken: tokens.accessToken,
            });
        } catch (error: any) {
            return res.status(401).json({
                message: error.message,
            });
        }
    }

    async logout(req: Request, res: Response): Promise<any> {
        try {
            // const sessionId = req.user?.sid;

            // await this.authService.logout(sessionId);
            const user = (req as any).user;

            console.log("user", user);

            if (!user?.sid) {
                return res.status(401).json({
                    message: "Unauthorized",
                });
            }

            await this.authService.logout(user.sid);
            res.clearCookie("refresh_token");

            return res.json({
                message: "Logged out",
            });
        } catch (error: any) {
            return res.status(401).json({
                message: error.message,
            });
        }
    }

    async logoutAllDevice(req: Request, res: Response): Promise<any> {
        try {
            // const userId = req.user.sub;

            // await this.authService.logoutAllDevice(userId);

            const user = (req as any).user;

            if (!user?.sub) {
                return res.status(401).json({
                    message: "Unauthorized",
                });
            }

            await this.authService.logoutAllDevice(user.sub);
            res.clearCookie("refresh_token");

            return res.json({
                message: "All session revoked",
            });
        } catch (error: any) {
            return res.status(401).json({
                message: error.message,
            });
        }
    }

    async getProfile(req: Request, res: Response): Promise<any> {
        try {
            const userReq = (req as any).user;

            if (!userReq?.sub) {
                return res.status(401).json({
                    message: "Unauthorized",
                });
            }

            const user = await this.authService.getProfile(userReq.sub);

            return res.status(200).json({
                user,
            });
        } catch (error: any) {
            return res.status(401).json({
                message: error.message,
            });
        }
    }

    async getListUser(req: Request, res: Response): Promise<any> {
        try {
            const { search, role, page, pageSize } = req.body;

            const result = await this.authService.getListUser({
                search,
                role,
                page,
                pageSize,
            });

            return res.status(200).json({
                message: "Get list user successfully",
                result: result,
            });
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }

    async getListRole(req: Request, res: Response): Promise<any> {
        try {
            const result = await this.authService.getListRole();

            return res.status(200).json({
                message: "Get list role successfully",
                result: result,
            });
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }
}
