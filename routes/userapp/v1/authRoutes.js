import express from "express";
import { googleLogin, login, register, resetPassword, sendOtpForResetPassword, validateOtp } from "../../../controller/userapp/v1/authController.js";



const router = express.Router();

router.post('/register',register)
router.post('/login',login)
router.post('/send-otp',sendOtpForResetPassword)
router.post('/reset-password',resetPassword)
router.post('/firebase/google',googleLogin);
router.post('validate-otp',validateOtp)


export default router;