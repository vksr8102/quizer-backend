import express from  'express';
import authRouter from "./authRoutes.js"
import userRouter from "./userRoutes.js"
import QuizRouter from "./QuizRoutes.js"
const router = express.Router();






router.use('/userApp/auth',authRouter);
router.use('/userapp/user',userRouter);
router.use('/userapp/quiz',QuizRouter);



export default router;