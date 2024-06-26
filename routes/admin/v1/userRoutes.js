import express from "express"
import { PLATFORM } from "../../../constants/authConstant.js";
import { BulkDelete, addUser, deleteUser, findAllUsers, getLoggedinUser, getUser, getUserCount, softDeleteUser, updateUser } from "../../../controller/admin/v1/userController.js";
import { auth } from "../../../middleware/auth.js";


const router = express.Router();

router.get('/me',auth(PLATFORM.ADMIN),getLoggedinUser);
router.get('/get/:id',auth(PLATFORM.ADMIN),getUser);
router.post('/add',auth(PLATFORM.ADMIN),addUser);
router.put("/update/:id",auth(PLATFORM.ADMIN),updateUser);
router.delete("/soft-delete/:id",auth(PLATFORM.ADMIN),softDeleteUser)
router.post("/list",auth(PLATFORM.ADMIN),findAllUsers);
router.post("/count",auth(PLATFORM.ADMIN),getUserCount);
router.delete("/delete/:id",auth(PLATFORM.ADMIN),deleteUser);
router.post("/bulk-delete",auth(PLATFORM.ADMIN),BulkDelete);



export default router;