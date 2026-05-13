import { injectable } from "tsyringe";
import { AuthRepository } from "../repositories/authRepository";
import * as bcrypt from "bcrypt";
import { UserLoginDTO, UserRegisDTO } from "../types/user";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

@injectable()
export class AuthService {
    constructor(private authRepository: AuthRepository) {}

    async loginUser(
        login: UserLoginDTO,
        meta: { ip?: string; deviceInfo?: string },
    ): Promise<any> {
        const { email, password } = login;

        const user = await this.authRepository.login(email);

        if (!user) throw new Error("Invalid credentials");

        console.log("user res:", user);

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password_hash,
        );

        if (!isPasswordValid) {
            throw new Error("Invalid credentials");
        }

        const refreshToken = crypto.randomBytes(64).toString("hex");

        const refreshTokenHash = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");

        const sessionId = uuidv4();

        const refreshExpires = new Date();
        refreshExpires.setDate(refreshExpires.getDate() + 30);

        await this.authRepository.createSession({
            id: sessionId,
            user_id: user.id,
            refresh_token_hash: refreshTokenHash,
            device_info: meta.deviceInfo,
            ip_address: meta.ip,
            expires_at: refreshExpires,
        });

        const accessToken = jwt.sign(
            { sub: user.id, sid: sessionId },
            process.env.JWT_SECRET!,
            { expiresIn: "15m" },
        );

        const { password_hash: _, ...safeUser } = user;
        return {
            accessToken,
            refreshToken,
            user: safeUser,
        };
    }

    generateCode = () => {
        return "GUEST" + Math.floor(100000 + Math.random() * 900000);
    };

    async regisUser(user: UserRegisDTO): Promise<any> {
        const {
            email,
            password_hash,
            first_name,
            last_name,
            role_id,
        } = user;

        const passwordHash = await bcrypt.hash(password_hash, 10);

        const newUser: UserRegisDTO = {
            id: uuidv4(),
            ...user,
            password_hash: passwordHash,
            code_unique: this.generateCode()
        };

        const result = await this.authRepository.regisUser(newUser);

        if (!result) {
            throw new Error("Register failed");
        }
        return result;
    }

    async createRole(role: any): Promise<any> {
        const { id, role_name, description } = role;

        const newRole = {
            ...role,
            id: uuidv4(),
        };

        const result = await this.authRepository.createRole(newRole);

        if (!result) {
            throw new Error("Create role failed");
        }
        return result;
    }

    async refreshToken(oldRefreshToken: string): Promise<any> {
        const oldHashToken = crypto
            .createHash("sha256")
            .update(oldRefreshToken)
            .digest("hex");

        const session =
            await this.authRepository.getSessionByRefreshToken(oldHashToken);

        console.log("oldhashtoken", oldHashToken);
        console.log("session", session);

        if (!session) {
            throw new Error("Invalid refresh token");
        }
        if (session.revoked_at) {
            throw new Error("Session revoked");
        }

        if (new Date(session.expires_at) < new Date())
            throw new Error("Refresh token expired");

        const accessToken = jwt.sign(
            { sub: session.user_id, sid: session.id },
            process.env.JWT_SECRET!,
            { expiresIn: "15m" },
        );

        const newRefreshToken = crypto.randomBytes(64).toString("hex");

        const newHash = crypto
            .createHash("sha256")
            .update(newRefreshToken)
            .digest("hex");

        const newExp = new Date();
        newExp.setDate(newExp.getDate() + 7);

        await this.authRepository.rotateRefreshToken(
            session.id,
            newHash,
            newExp,
        );

        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    }

    async logout(session_id: string): Promise<any> {
        const result = await this.authRepository.revokeSession(session_id);

        return result;
    }

    async logoutAllDevice(user_id: string): Promise<any> {
        const result = await this.authRepository.revokeAllSessions(user_id);

        return result;
    }

    async getProfile(user_id: string): Promise<any> {
        const result = await this.authRepository.getProfile(user_id);

        return result;
    }

    async getListUser(param: any): Promise<any> {
        const {
            search, role, page, pageSize
        } = param;

        const result = await this.authRepository.getListUser(param);

        if (!result) {
            throw new Error("Get list user failed");
        }
        return result.fn_get_users_list;
    }

    async getListRole(): Promise<any> {
        const result = await this.authRepository.getListRole();

        if (!result) {
            throw new Error("Get list role failed");
        }
        return result;
    }
}
