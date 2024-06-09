import GoogleStategy from "passport-google-oauth20";
  import { USER_TYPE } from "../constants/authConstant.js";
import { create, findOne, updateOne } from "../utils/dbServices.js";
import { user } from "../model/user.js";
import { sendWelcomeEmailByRegisterEmail } from "../services/auth.js";


/**
 * @description : exports authentication strategy for google using passport.js
 * @params {Object} passport : passport object for authentication
 * @return {callback} : returns callback to be used in middleware
 */
const googlePassportStatgy = passport =>{
    passport.serializeUser(function(user,cb){
        cb(null,user)
    })

    passport.deserializeUser(function(user,cb){
        cb(null,user);
    });

    passport.use(new GoogleStategy.Strategy({
        clientID:process.env.GOOGLE_CLIENTID,
        clientSecret:process.env.GOOGLE_CLIENTSECRET,
        callbackURL:process.env.GOOGLE_CALLBACKURL
    },
    async function(accessToken,refreshToken,profile ,done){
        if(profile){
                let userObj = {
                    'ssoAuth': { 'googleId': profile.id },
                    'name': profile.displayName && profile.displayName !== undefined && profile.displayName,
                    'email': profile.emails !== undefined ? profile.emails[0].value : '',
                    'password':'',
                    'userType':USER_TYPE.USER
                  };
                let found = await findOne(user,{'email':userObj.email}) ;
                if(found){
                    let id = found.id;
                    await updateOne(user,{_id:id},userObj);
                }else{
                    let result = await create(user,userObj);
                    console.log(result,"google stategy")
                    if(result.email){
                        await sendWelcomeEmailByRegisterEmail(result);
                    }
                }
            let User = await findOne(user,{'': profile.id});
            return done(null,User);
        }
        return done(null,null);
    }
));

    
}

export {
    googlePassportStatgy
}