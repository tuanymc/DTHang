import { NextFunction, Response, Router } from 'express';
import { container } from 'tsyringe';
import { authMiddleware } from '../middlewares/auth.middleware';
import { CategoryController } from '../controllers/categoryController';

const categoryRouter = Router();
const categoryController = container.resolve(CategoryController);
categoryRouter.post(
    '/create-cate',
    categoryController.createCate.bind(categoryController),
);

categoryRouter.post(
    '/update-cate',
    categoryController.updateCate.bind(categoryController),
);

categoryRouter.post(
    '/delete-cate',
    categoryController.deleteCate.bind(categoryController),
);

categoryRouter.post(
    '/list-cate',
    categoryController.getPaginationCategory.bind(categoryController),
);

categoryRouter.post(
    '/all-cate',
    categoryController.getAllCategory.bind(categoryController),
);

export default categoryRouter;