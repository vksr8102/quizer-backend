import express from "express";
import authRouter from "./authRoutes.js"
import userRouter from "./userRoutes.js";
import questionRouter from "./questionRoutes.js"
import quizRouter from "./QuizRoutes.js"
const router = express.Router();

router.use('/admin/auth',authRouter);
router.use('/admin/user',userRouter);
router.use('/admin/question',questionRouter);
router.use('/admin/quiz',quizRouter);


export default router;