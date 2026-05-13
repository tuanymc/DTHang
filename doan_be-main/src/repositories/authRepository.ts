import { injectable } from "tsyringe";
import { Database } from "../config/database";
import { User, UserLoginDTO, UserRegisDTO } from "../types/user";

@injectable()
export class AuthRepository {
    constructor(private db: Database) {}

    async login(email: string): Promise<any> {
        try {
            const sql = `select * from fn_get_user_by_email($1::text)`;

            const result = await this.db.query(sql, [email]);

            console.log(result);

            return result.rows[0];
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async createSession(session: any): Promise<any> {
        try {
            const sql = `select * from fn_create_session(
                $1::text,
                $2::text,
                $3::text,
                $4::text,
                $5::text,
                $6::timestamptz
            )`;

            const result = await this.db.query(sql, [
                session.id,
                session.user_id,
                session.refresh_token_hash,
                session.device_info,
                session.ip_address,
                session.expires_at,
            ]);

            return result.rows[0];
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async regisUser(user: UserRegisDTO): Promise<any> {
        try {
            const sql = `select * from auth_register_user(
                $1::text,
                $2::text,
                $3::text,
                $4::text,
                $5::text,
                $6::text,
                $7::text
            )`;

            const result = await this.db.query(sql, [
                user.id,
                user.code_unique,
                user.email,
                user.password_hash,
                user.first_name,
                user.last_name,
                user.role_id,
            ]);

            return result.rows[0];
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async createRole(role: any): Promise<any> {
        try {
            const sql = `select * from fn_create_role(
                $1::text,
                $2::text,
                $3::text
            )`;

            const result = await this.db.query(sql, [
                role.id,
                role.role_name,
                role.description,
            ]);

            return result.rows[0];
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async getSessionByRefreshToken(token_hash: any): Promise<any> {
        try {
            const sql = `select * from fn_get_session_by_refresh_token(
                $1::text
            )`;

            const result = await this.db.query(sql, [token_hash]);

            return result.rows[0];
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async rotateRefreshToken(
        sessionId: string,
        newHash: string,
        exp: Date,
    ): Promise<any> {
        try {
            const sql = `select * from fn_rotate_refresh_token(
                $1, $2, $3
            )`;

            const result = await this.db.query(sql, [sessionId, newHash, exp]);

            return result.rows[0];
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async revokeSession(sessionId: string): Promise<any> {
        try {
            const sql = `select * from fn_revoke_session(
                $1
            )`;

            const result = await this.db.query(sql, [sessionId]);

            return result.rows[0];
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async revokeAllSessions(userId: string): Promise<any> {
        try {
            const sql = `select * from fn_revoke_all_sessions(
                $1
            )`;

            const result = await this.db.query(sql, [userId]);

            return result.rows[0];
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async getProfile(userId: string): Promise<any> {
        try {
            const sql = `select * from fn_get_profile($1)`;

            const result = await this.db.query(sql, [userId]);

            return result.rows[0];
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async getListUser(search: any): Promise<any> {
        try {
            const sql = `select * from fn_get_users_list(
                $1, $2, $3, $4
            )`;

            const result = await this.db.query(sql, [
                search.search,
                search.role,
                search.page,
                search.pageSize,
            ]);

            return result.rows[0];
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async getListRole(): Promise<any> {
        try {
            const sql = `select * from roles`;

            const result = await this.db.query(sql, []);

            return result.rows;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
}
