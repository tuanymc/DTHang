import { injectable } from "tsyringe";
import { Database } from "../config/database";

@injectable()
export class MajorRepository {
    constructor(private db: Database) {}

     async createMajor(major: any): Promise<any> {
        try {
            const sql = `select * from create_major($1, $2, $3)`;

            const result = await this.db.query(sql, [major.id, major.name, major.description]);

            return result.rows[0];
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async updateMajor(major: any): Promise<any> {
        try {
            const sql = `select * from update_major($1, $2, $3)`;

            const result = await this.db.query(sql, [major.id, major.name, major.description]);

            return result.rows[0];
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async deleteMajor(id: string): Promise<any> {
        try {
            const sql = `select * from delete_major($1)`;

            const result = await this.db.query(sql, [id]);

            return result.rows[0];
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async getPaginationMajor(major: any): Promise<any> {
        try {
            const sql = `select * from fn_get_major_list($1, $2, $3)`;

            const result = await this.db.query(sql, [major.search, major.page, major.pageSize]);

            return result.rows[0];
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async getAllMajor(): Promise<any> {
        try {
            const sql = `select * from major`;

            const result = await this.db.query(sql, []);

            return result.rows;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
}