import dayjs from "dayjs";
import { JWT, PLATFORM, USER_TYPE } from "../../../constants/authConstant.js";
import { user } from "../../../model/user.js";
import { generateToken, resetPasswordData, sendWelcomeEmailByRegisterEmail, sentResetPasswordotpNotification, userLogin } from "../../../services/auth.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { checkUniqueFieldsInDatabase } from "../../../utils/comon.js";
import { create, findOne } from "../../../utils/dbServices.js";
import { schemaKeys } from "../../../utils/validation/userValidation.js";
import { validateParamsWithJoi } from "../../../utils/validationRequest.js";
import { verifyToken } from "../../../services/firebase/verifyToken.js";



/**
 * @description : user Registation
 * @param {Object} req : request for register
 * @param {Object} res : response for register
 * @returns {Object} : response for register {status, message,data}
 */



const register = asyncHandler(async(req,res)=>{
    try {
      const {email,password,name} = req.body;
      
      if(!email || !name ){
          return res.badRequest({message: 'Insufficient request parameters! email and username  is required.' })
      }
      if(!password){
         return res.badRequest({message: 'Insufficient request parameters! password  is required.' })
      }

 let validationRequest = validateParamsWithJoi(req.body,schemaKeys)
 if(!validationRequest.isValid){
     return res.validationError({message:` Invalid values in parameters, ${validationRequest.message}`})
 }
 
 const data = new user({
     ...req.body,
     userType:USER_TYPE.USER
 })
 
 //check uniqueness
 if(req.body.email){
     let checkUniqueFields = await checkUniqueFieldsInDatabase(user,data,["email"],"REGISTER");
 // console.log("checkUniqueFields",checkUniqueFields)
     if(checkUniqueFields?.isDuplicate){
         return res.validationError({message:`${checkUniqueFields.value} already exists.Unique ${checkUniqueFields.field} are allowed.`})
     }
 }

 
 // create user
 const result = await create(user,data);
 
 //Send welcome email 
 if(req.body.email){
     await sendWelcomeEmailByRegisterEmail({
         ...req.body
     })
 }
 
 return res.success({data:result})
 
    } catch (error) {
     return res.internalServerError({data:error.message})
    }
 
 
 })

  /**
 * @description : user login
 * @param {Object} req :request from  client
 * @param {Object} res :response for the request
 * @returns {Object} : response for login {status,msg,data}
 */

const login = asyncHandler(async(req,res)=>{
    try {
        const {username,password} = req.body;
    
        if(!username){
            return  res.badRequest({message:"Username is required!"});
        }
        if(!password){
            return   res.badRequest({message:"Password is required!"});
        }
    
    
      
        const result = await userLogin(username,password,PLATFORM.USERAPP)
    
        if(result.flag){
            return res.badRequest({message:result.data});
        }
    
        return res.success({
            data:result.data,
            message:"Login successfully"
        })
    } catch (error) {
      return res.internalServerError({data:error.message}) 
    }
})
 /**
 * @description : Otp send for reset the password on email or phone
 * @param {Object} req :request from  client
 * @param {Object} res :response for the request
 * @returns {Object} : response for forgotPassword {status, message, data}
 */


const sendOtpForResetPassword =asyncHandler(async(req,res)=>{
    try {
        
        let params = req.body;
        if(!params.email ){
            return res.badRequest({data:"Insufficient parametr. email is required "})
        }

        let where ;

        if(params.email){
            where = {email:params.email};
            where.isActive = true;
                     where.isDeleted =false;
            params.email = params.email.toString().toLowerCase();

        }
     

        let found = await findOne(user,where);
        if(!found){
            return res.recordNotFound({data:'User not found'});
        }


const {resultOfEmail}  =  await sentResetPasswordotpNotification(found);

if(resultOfEmail){
    return res.success({message:"otp sent successfully to your email"});
}else{
    return res.failure({message:"otp can not be sent due to some issue try agin later"});
}
    } catch (error) {
        return res.internalServerError({data:error.message});
    }
})

 //validate otp
/**
 * @description : reset password with  OTP and new password
 * @param {Object} req : resquest for forget password
 * @param {Object} res : response  for resetpassword 
 * @return {Object} : response for resetPassword {status, message, data}
 */

const resetPassword = asyncHandler(async(req,res)=>{
    const params = req.body;
    try {
       if(!params.code || !params.newPassword){
  return res.badRequest({message:"Insufficient request parameters . code and  new Password are required fields."});
       } 
  
       const where = {
        'resetPasswordLink.code':params.code,
        isActive:true,
        isDeleted:false
       }
    //    console.log(where)
       let found = await findOne(user,where);
    //    console.log(found)
       if (!found || !found.resetPasswordLink.expireTime) {
           return res.failure({ message: 'Invalid Code' });
        }
  
      if(dayjs(new Date()).isAfter(dayjs(found.resetPasswordLink.expireTime))){
        return res.failure({message:" your reset password is expire or Invalid"});
      }
  
      let response = await resetPasswordData(found,params.newPassword);
      if(!response || response.flag){
        return res.failure({message:response.data})
      }
     return res.success({message:response.data})
    } catch (error) {
      return res.internalServerError({message:error.message})  
    }
  })

  /**
 * @description : validate OTP
 * @param {Object} req : request for validateResetPasswordOtp
 * @param {Object} res : response for validateResetPasswordOtp
 * @return {Object} : response for validateResetPasswordOtp  {status, message, data}
 */
  const validateOtp = async (req, res) => {
    const params = req.body;
    try {
      if (!params.otp) {
        return res.badRequest({ message: 'Insufficient request parameters! otp is required.' });
      }
      const where = {
        'resetPasswordLink.code': params.otp,
        isActive: true,
        isDeleted: false,
      };
      let found = await findOne(user, where);
      console.log(found)
      if (!found || !found.resetPasswordLink.expireTime) {
        return res.failure({ message: 'Invalid OTP' });
      }
      if (dayjs(new Date()).isAfter(dayjs(found.resetPasswordLink.expireTime))) {
        return res.failure({ message: 'Your reset password link is expired or invalid' });
      }
     let a = await updateOne(user, {_id:found.id}, { resetPasswordLink: {} });
     console.log(a)
      return res.success({ message: 'OTP verified' });
    } catch (error) {
      return res.internalServerError({ data: error.message });
    }
  };



/**
 * @description : google login using firebase
 * @param {*} req request of body
 * @param {*} res response  of result
 * @returns user data docs with token
 */

  const googleLogin  = async(req,res)=>{
    try {
        const {credentials} = req.body;
        // console.log(credentials);
        if(!credentials){
            return res.badRequest({message : "Insufficient credentials"})
        }
        const check = await verifyToken(credentials)

        let objVal = {
            name: check.name,
            email: check.email,
            phone:check.phone
        }
        let User = await findOne(user,{email:check.email})
        if(!User){
            User = await create(user,objVal)
        }
        let userData = User.toJSON();

        let token = await  generateToken(userData,JWT.USERAPP_SECRET);
        // console.log(token)

      const result = {...userData,token:token} 
      let expire = dayjs().add(JWT.EXPIRE_IN*60, 'second').toDate();
      res.cookie("authtoken", token, { httpOnly: true, sameSite: 'none', secure: true, expires:expire })
        return res.success({data:result})
    } catch (error) {
        console.log(error);
    }
}



 export {
    register,
    login,
    sendOtpForResetPassword,
    resetPassword,
    googleLogin,
    validateOtp
 }