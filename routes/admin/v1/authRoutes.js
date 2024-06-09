import express from "express";
import { login, register, resetPassword, sendOtpForResetPassword, validateOtp } from "../../../controller/admin/v1/authController.js";

const router = express.Router();

router.post('/register',register);
router.post('/login',login);
router.post('/send-otp',sendOtpForResetPassword);
router.post('/reset-password',resetPassword);
router.post('/validate-otp',validateOtp)


export default router;