/**
 * @description  : export authentication strategy for userapp using  passport.js
 * @params {object} passport : passport object for authentication
 * @returns {caallback} :: return callback to be used in middleware
 */


import { Strategy,ExtractJwt } from "passport-jwt";
import { JWT } from "../constants/authConstant.js";
import { user } from "../model/user.js";



export const adminPassportStategy =(passport)=>{
    const options = {};
    options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    options.secretOrKey = JWT.ADMIN_SECRET;
   passport.use("admin-rule",new Strategy(options, async(payload,done) =>{
    try {
       const result = await user.findOne({_id:payload.id}) ;
       if(result){
        return  done(null,result.toJSON());
       }else{
        return done("User Not Found",{});
       }
    } catch (error) {
      return done(error,{})  
    }
   }))

}
