import { NextFunction, Response, Router } from "express";
import { container } from "tsyringe";
import { authMiddleware } from "../middlewares/auth.middleware";
import { CategoryController } from "../controllers/categoryController";
import { MajorController } from "../controllers/majorController";

const majorRouter = Router();
const majorController = container.resolve(MajorController);
majorRouter.post(
    "/create-major",
    majorController.createMajor.bind(majorController),
);

majorRouter.post(
    "/update-major",
    majorController.updateMajor.bind(majorController),
);

majorRouter.post(
    "/delete-major",
    majorController.deleteMajor.bind(majorController),
);

majorRouter.post(
    "/list-major",
    majorController.getPaginationMajor.bind(majorController),
);

majorRouter.post(
    "/all-major",
    majorController.getAllMajor.bind(majorController),
);

export default majorRouter;
