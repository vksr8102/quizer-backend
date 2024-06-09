import express from "express";
import passport from "passport";
import dotenv from "dotenv";
import { socialLogin } from "../services/auth.js";

const router = express.Router();
dotenv.config({ path: ".env" });

router.get('/auth/google/error',(req,res)=>{
    res.failure({message:"login failed"})
});

router.get("/auth/google",passport.authenticate('google',{
    scope:['profile','email'],
    session:false
}));


router.get('/auth/google/callback',
  (req,res,next)=>{
    passport.authenticate('google', { failureRedirect: process.env.GOOGLE_ERRORURL }, async (error, user , info) => {
      if (error){
        return res.internalServerError({ message:error.message });
      }
      if (user){
        try {
            console.log(user)
          let result = await socialLogin(user.email, req.session.platform);
          if (result.flag) {
            return res.failure({ message: result.data });
          }
          res.cookie("authCookie",result.data.token)
          res.redirect(process.env.GOOGLE_REDIRECTURL)
        } catch (error) {
          return res.internalServerError({ message: error.message });
        }
      }
    })(req,res,next);
  }); 


  
export default router;