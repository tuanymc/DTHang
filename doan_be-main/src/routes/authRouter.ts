import { NextFunction, Response, Router } from 'express';
import { container } from 'tsyringe';
import multer from 'multer';
import { AuthController } from '../controllers/authController';
import { authMiddleware } from '../middlewares/auth.middleware';

const authRouter = Router();
const authController = container.resolve(AuthController);
authRouter.post(
    '/login',
    authController.login.bind(authController),
);

authRouter.post(
    '/register',
    authController.regisUser.bind(authController),
);

authRouter.post(
    '/create-role',
    authController.createRole.bind(authController),
);

authRouter.post(
    '/refresh',
    authController.refreshToken.bind(authController),
);

authRouter.post(
    '/logout',
    authMiddleware,
    authController.logout.bind(authController),
);

authRouter.post(
    '/logout-all',
    authMiddleware,
    authController.logoutAllDevice.bind(authController),
);

authRouter.post(
    '/me',
    authMiddleware,
    authController.getProfile.bind(authController),
);

authRouter.post(
    '/list-user',
    authMiddleware,
    authController.getListUser.bind(authController),
);

authRouter.post(
    '/list-role',
    authMiddleware,
    authController.getListRole.bind(authController),
);


export default authRouter;
