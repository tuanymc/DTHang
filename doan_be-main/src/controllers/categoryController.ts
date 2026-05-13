import { injectable } from "tsyringe";
import { Request, Response } from "express";
import { CategoryService } from "../services/category.service";

@injectable()
export class CategoryController {
    constructor(
        private categoryService: CategoryService,
    ) {}

    async createCate(req: Request, res: Response): Promise<any> {
        try {
            const { name, slug, description } = req.body;

            if (!name || !slug) {
                res.status(400).json({ message: "Thiếu thông tin." });
                return;
            }

            const result = await this.categoryService.createCate({
                name,
                slug,
                description,
            });

            return res.status(200).json({
                message: "Create category successfully",
                result: result,
            });
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }

    async updateCate(req: Request, res: Response): Promise<any> {
        try {
            const {id, name, slug, description } = req.body;

            if (!id) {
                res.status(400).json({ message: "Thiếu thông tin." });
                return;
            }

            const result = await this.categoryService.updateCate({
                id,
                name,
                slug,
                description,
            });

            return res.status(200).json({
                message: "Update category successfully",
                result: result,
            });
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }

    async deleteCate(req: Request, res: Response): Promise<any> {
        try {
            const {id } = req.body;

            if (!id) {
                res.status(400).json({ message: "Thiếu thông tin." });
                return;
            }

            const result = await this.categoryService.deleteCate(
                id
            );

            return res.status(200).json({
                message: "Delete category successfully",
                result: result,
            });
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }

    async getPaginationCategory(req: Request, res: Response): Promise<any> {
        try {
            const {search, page, pageSize } = req.body;

            const result = await this.categoryService.getPaginationCategory({
                search,
                page,
                pageSize,
            });

            return res.status(200).json({
                message: "Get list cate successfully",
                result: result,
            });
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }

    async getAllCategory(req: Request, res: Response): Promise<any> {
        try {

            const result = await this.categoryService.getAllCategory();

            return res.status(200).json({
                message: "Get list cate successfully",
                result: result,
            });
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }
}