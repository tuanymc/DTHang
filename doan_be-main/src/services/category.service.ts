import { injectable } from "tsyringe";
import * as bcrypt from "bcrypt";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { CategoryRepository } from "../repositories/categoryRepository";

@injectable()
export class CategoryService {
    constructor(private categoryRepository: CategoryRepository) {}

    async createCate(cate: any): Promise<any> {
        const {
            id, name, slug, description
        } = cate;


        const newCate = {
            ...cate,
            id: uuidv4()
        };

        const result = await this.categoryRepository.createCate(newCate);

        if (!result) {
            throw new Error("Create cate failed");
        }
        return result;
    }

    async updateCate(cate: any): Promise<any> {
        const {
            id, name, slug, description
        } = cate;

        const result = await this.categoryRepository.updateCate(cate);

        if (!result) {
            throw new Error("Update cate failed");
        }
        return result;
    }

    async deleteCate(id: string): Promise<any> {

        const result = await this.categoryRepository.deleteCate(id);

        if (!result) {
            throw new Error("Delete cate failed");
        }
        return result;
    }

    async getPaginationCategory(cate: any): Promise<any> {
        const {
            search, page, pageSize
        } = cate;

        const result = await this.categoryRepository.getPaginationCategory(cate);

        if (!result) {
            throw new Error("Get list cate failed");
        }
        return result;
    }

    async getAllCategory(): Promise<any> {

        const result = await this.categoryRepository.getAllCategory();

        if (!result) {
            throw new Error("Get list cate failed");
        }
        return result;
    }
}