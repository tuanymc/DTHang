import { Router } from "express";
import authRouter from "./authRouter";
import categoryRouter from "./categoryRouter";
import majorRouter from "./majorRouter";
import courseRouter from "./courseRouter";

const router = Router();
router.use("/auth", authRouter);
router.use("/category", categoryRouter);
router.use("/major", majorRouter);
router.use("/course", courseRouter);


export default router;
