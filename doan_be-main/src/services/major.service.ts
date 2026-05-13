import { injectable } from "tsyringe";
import * as bcrypt from "bcrypt";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { MajorRepository } from "../repositories/majorRepository";

@injectable()
export class MajorService {
    constructor(private majorRepository: MajorRepository) {}

    async createMajor(major: any): Promise<any> {
        const {
            id, name, description
        } = major;


        const newMajor = {
            ...major,
            id: uuidv4()
        };

        const result = await this.majorRepository.createMajor(newMajor);

        if (!result) {
            throw new Error("Create major failed");
        }
        return result;
    }

    async updateMajor(major: any): Promise<any> {
        const {
            id, name, description
        } = major;

        const result = await this.majorRepository.updateMajor(major);

        if (!result) {
            throw new Error("Update major failed");
        }
        return result;
    }

    async deleteMajor(id: string): Promise<any> {

        const result = await this.majorRepository.deleteMajor(id);

        if (!result) {
            throw new Error("Delete major failed");
        }
        return result;
    }

    async getPaginationMajor(major: any): Promise<any> {
        const {
            search, page, pageSize
        } = major;

        const result = await this.majorRepository.getPaginationMajor(major);

        if (!result) {
            throw new Error("Get list major failed");
        }
        return result;
    }

    async getAllMajor(): Promise<any> {

        const result = await this.majorRepository.getAllMajor();

        if (!result) {
            throw new Error("Get list major failed");
        }
        return result;
    }
}