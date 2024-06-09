import express from "express";
import { auth } from "../../../middleware/auth.js";
import { PLATFORM } from "../../../constants/authConstant.js";
import { BulkDelete, DeleteQuestion, addBulkQuestions, createQuestion, findAllQuestions, getSingleQuestion, softDeletequestion, updateBulk, updateQuestion } from "../../../controller/admin/v1/QuestionController.js";


const router = express.Router();


router.post("/create",auth(PLATFORM.ADMIN),createQuestion);
router.post("/add-bulk",auth(PLATFORM.ADMIN),addBulkQuestions);
router.post('/list',auth(PLATFORM.ADMIN),findAllQuestions);
router.get("/get/:id",auth(PLATFORM.ADMIN),getSingleQuestion);
router.put('/update/:id',auth(PLATFORM.ADMIN),updateQuestion);
router.put('/update-bulk',auth(PLATFORM.ADMIN),updateBulk);
router.delete('/soft-delete/:id',auth(PLATFORM.ADMIN),softDeletequestion);
router.delete('/delete/:id',auth(PLATFORM.ADMIN),DeleteQuestion);
router.post("/bulk-delete",auth(PLATFORM.ADMIN),BulkDelete);


export default router;