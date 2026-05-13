import { injectable } from "tsyringe";
import { Database } from "../config/database";

@injectable()
export class CategoryRepository {
    constructor(private db: Database) {}

     async createCate(category: any): Promise<any> {
        try {
            const sql = `select * from create_category($1, $2, $3, $4)`;

            const result = await this.db.query(sql, [category.id, category.name, category.slug, category.description]);

            return result.rows[0];
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async updateCate(category: any): Promise<any> {
        try {
            const sql = `select * from update_category($1, $2, $3, $4)`;

            const result = await this.db.query(sql, [category.id, category.name, category.slug, category.description]);

            return result.rows[0];
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async deleteCate(id: string): Promise<any> {
        try {
            const sql = `select * from delete_category($1)`;

            const result = await this.db.query(sql, [id]);

            return result.rows[0];
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async getPaginationCategory(cate: any): Promise<any> {
        try {
            const sql = `select * from fn_get_categories_list($1, $2, $3)`;

            const result = await this.db.query(sql, [cate.search, cate.page, cate.pageSize]);

            return result.rows[0];
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async getAllCategory(): Promise<any> {
        try {
            const sql = `select * from categories`;

            const result = await this.db.query(sql, []);

            return result.rows;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
}