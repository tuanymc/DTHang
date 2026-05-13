import { injectable } from "tsyringe";
import { Request, Response } from "express";
import { MajorService } from "../services/major.service";

@injectable()
export class MajorController {
    constructor(
        private majorService: MajorService,
    ) {}

    async createMajor(req: Request, res: Response): Promise<any> {
        try {
            const { name, description } = req.body;

            if (!name) {
                res.status(400).json({ message: "Thiếu thông tin." });
                return;
            }

            const result = await this.majorService.createMajor({
                name,
                description,
            });

            return res.status(200).json({
                message: "Create major successfully",
                result: result,
            });
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }

    async updateMajor(req: Request, res: Response): Promise<any> {
        try {
            const {id, name, description } = req.body;

            if (!id) {
                res.status(400).json({ message: "Thiếu thông tin." });
                return;
            }

            const result = await this.majorService.updateMajor({
                id,
                name,
                description,
            });

            return res.status(200).json({
                message: "Update major successfully",
                result: result,
            });
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }

    async deleteMajor(req: Request, res: Response): Promise<any> {
        try {
            const {id } = req.body;

            if (!id) {
                res.status(400).json({ message: "Thiếu thông tin." });
                return;
            }

            const result = await this.majorService.deleteMajor(
                id
            );

            return res.status(200).json({
                message: "Delete major successfully",
                result: result,
            });
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }

    async getPaginationMajor(req: Request, res: Response): Promise<any> {
        try {
            const {search, page, pageSize } = req.body;

            const result = await this.majorService.getPaginationMajor({
                search,
                page,
                pageSize,
            });

            return res.status(200).json({
                message: "Get list major successfully",
                result: result.fn_get_major_list,
            });
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }

    async getAllMajor(req: Request, res: Response): Promise<any> {
        try {

            const result = await this.majorService.getAllMajor();

            return res.status(200).json({
                message: "Get list major successfully",
                result: result,
            });
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }
}