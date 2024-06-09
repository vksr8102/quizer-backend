import express from "express";
import { auth } from "../../../middleware/auth.js";
import { PLATFORM } from "../../../constants/authConstant.js";
import { getLoggedinUser, softDeleteUser, updateUser } from "../../../controller/userapp/v1/userController.js";



const router = express.Router();

router.get('/me',auth(PLATFORM.USERAPP),getLoggedinUser);
router.put('/update/:id',auth(PLATFORM.USERAPP),updateUser)
router.delete("/soft-delete/:id",auth(PLATFORM.USERAPP),softDeleteUser)

export default router;