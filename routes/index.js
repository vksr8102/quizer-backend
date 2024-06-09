import express from "express";
import userApp from "./userapp/v1/index.js"
import admin from "./admin/v1/index.js"
import rateLimit from "express-rate-limit";
import googleRoute from "./googleRoutes.js"
const router = express.Router();
const rateLimiter =rateLimit({
    windowMs:2*60*1000,
    max:200,
    message:"Rate limit excideed .please try after two minutes"
})

router.use(rateLimiter,userApp)
router.use(rateLimiter,admin)
router.use(rateLimiter,googleRoute)

export default router;