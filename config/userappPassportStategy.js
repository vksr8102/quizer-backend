/**
 * @description  : export authentication strategy for userapp using  passport.js
 * @params {object} passport : passport object for authentication
 * @returns {caallback} :: return callback to be used in middleware
 */


import { Strategy,ExtractJwt } from "passport-jwt";
import { user } from "../model/user.js";
import { JWT } from "../constants/authConstant.js";



export const userappPassportStategy =(passport)=>{
    const options = {};
    options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    options.secretOrKey = JWT.USERAPP_SECRET
   passport.use("userapp-rule",new Strategy(options, async(payload,done) =>{
    try {
       const result = await user.findOne({_id:payload.id}) ;
       console.log(result)
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
