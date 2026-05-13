import {Pool, PoolClient} from 'pg'
import { injectable } from "tsyringe";
import { config } from "./config";

const connectionConfig = {
    host: config.db.host,
    port: config.db.port,
    user: config.db.username,
    password: config.db.password,
    database: config.db.database,
}

@injectable()
export class Database {
    private pool: Pool;
    constructor() {
        this.pool = new Pool(connectionConfig)
    }

    public async query(sql: string, values: any[] = []): Promise<any> {
        let client: PoolClient | null = null;
        try {
            client = await this.pool.connect();
            const result = await client.query(sql, values);
            return result;
        } catch (error) {
            throw error;
        } finally {
            if (client) {
                client.release();
            }
        }
    }
    
    public async queryList(sql: string, values: any[]): Promise<any> {
        let client: PoolClient | null = null;
        try {
            client = await this.pool.connect();
            const result = await client.query(sql, values);
            return result;
        } catch (error) {
            throw error;
        } finally {
            if (client) {
                client.release();
            }
        }
    }
}