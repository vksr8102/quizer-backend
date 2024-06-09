import express from "express";
import { auth } from "../../../middleware/auth.js";
import { PLATFORM } from "../../../constants/authConstant.js";
import { startQuiz, submitAnswer } from "../../../controller/userapp/v1/QuizController.js";
import { findAllQuizs } from "../../../controller/admin/v1/QuizController.js";



const router = express.Router();

router.get('/start/:quizId',auth(PLATFORM.USERAPP),startQuiz);
router.post('/submit-answer',auth(PLATFORM.USERAPP),submitAnswer);
router.post("/list",auth(PLATFORM.USERAPP),findAllQuizs);


export default router;