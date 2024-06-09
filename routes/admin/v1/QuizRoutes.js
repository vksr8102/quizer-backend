import express from "express";
import { auth } from "../../../middleware/auth.js";
import { PLATFORM } from "../../../constants/authConstant.js";
import { BulkDelete, DeleteQuiz, createQuiz, findAllQuizs, getSingleQuiz, softDeleteQuiz, updateQuiz } from "../../../controller/admin/v1/QuizController.js";
import { givePermission } from "../../../controller/admin/v1/dashBoardController.js";


const router = express.Router();


router.post('/create',auth(PLATFORM.ADMIN),createQuiz);
router.post('/list',auth(PLATFORM.ADMIN),findAllQuizs);
router.get('/get/:id',auth(PLATFORM.ADMIN),getSingleQuiz);
router.put('/update/:id',auth(PLATFORM.ADMIN),updateQuiz);
router.delete('/soft-delete/:id',auth(PLATFORM.ADMIN),softDeleteQuiz);
router.delete('/delete/:id',auth(PLATFORM.ADMIN),DeleteQuiz);
router.post("/bulk-delete",auth(PLATFORM.ADMIN),BulkDelete);
router.post('/give-permission',auth(PLATFORM.ADMIN),givePermission);



export default router;