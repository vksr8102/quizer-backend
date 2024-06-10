import dayjs from "dayjs";
import { FORGET_PASSWORD_WITH, JWT, LOGIN_ACCESS, LOGIN_REACTIVE_TIME, MAX_RETRY_LIMIT, PLATFORM } from "../constants/authConstant.js";
import { getDifferenceOfTwoDatesInTime } from "../utils/comon.js";
import { sendEmail } from "./emailService.js";
import jwt from "jsonwebtoken"
import { user } from "../model/user.js";
import {  findOne, updateOne } from "../utils/dbServices.js";
import otpGenerator from "otp-generator"
import { asyncHandler } from "../utils/asyncHandler.js";
import bcrypt from "bcrypt"

const generateToken = async (user, secret) => {
    return jwt.sign({ id: user.id, 'email': user.email }, secret, {
        expiresIn: JWT.EXPIRE_IN * 60
    });
  }
/**
 * @description :: send welcome via SMS by Register email
 * @param  {Object} user:user document
 * @returns {boolean} : return status wether the email sent or not 
 */




const sendWelcomeEmailByRegisterEmail = async(user)=>{
    try {
        console.log(user)
        let mailObj ={
            subject:'Welcome to Quizer',
            to:user.email,
            template:'/views/email/',
            data:{
                isWidth:true,
                user:user ||'',
                message:"Welcome to Quizer"
            }
        }
        try {
         await sendEmail(mailObj)  
         return true;
        } catch (error) {
            // console.log(error )
            return false
        }
    } catch (error) {
      console.log(error)
      return false
    }
  
  }
/**
 * @description :: send welcome via SMS by Register email
 * @param  {Object} user:user document
 * @returns {boolean} : return status wether the email sent or not 
 */




const sendInvitationEamilforQuiz = async(email,password,quiz)=>{
    try {
        // console.log("email",email,"password",password);
        let mailObj ={
            subject:'Welcome to Quizer - Online Quiz PlateForm',
            to:email,
            template:'/views/email/InvitationMail/',
            data:{
                isWidth:true,
                email:email||"",
                password:password||"",
                quiz:quiz||"",
                message:"Welcome to Quizer"
            }
        }
        try {
          // console.log(mailObj)
         await sendEmail(mailObj)  
         return true;
        } catch (error) {
            // console.log(error )
            return false
        }
    } catch (error) {
      console.log(error)
      return false
    }
  
  }

  
/**
 * @description : login user.
 * @param {string} username : username of user.
 * @param {string} password : password of user.
 * @param {string} platform : platform.
 * @param {boolean} roleAccess: a flag to request user`s role access
 * @return {Object} : returns authentication status. {flag, data}
 */


const userLogin = async(username,password,plateform)=>{
  try {
    let data ;
   
      data={email:username}
    
  data.isActive=true;
  data.isDeleted=false;
  const userData=  await findOne(user,data);
  if(userData){
  if(userData.loginRetryLimit >= MAX_RETRY_LIMIT){
    let now =dayjs()
    if (userData.loginReactiveTime) {
      let limitTime = dayjs(userData.loginReactiveTime);
      if (limitTime > now) {
          let expireTime = dayjs().add(LOGIN_REACTIVE_TIME, 'minute');
          if (!(limitTime > expireTime)) {
              return {
                  flag: true,
                  data: `you have exceed the number of limit.you can login after ${getDifferenceOfTwoDatesInTime(now, limitTime)}.`
              };
          }
          await updateOne(user, { _id: userData.id }, {
              loginReactiveTime: expireTime.toISOString(),
              loginRetryLimit: user.loginRetryLimit + 1
          });
          return {
              flag: true,
              data: `you have exceed the number of limit.you can login after ${getDifferenceOfTwoDatesInTime(now, expireTime)}.`
          };
      } else {
          user = await updateOne(user, { _id: userData.id }, {
              loginReactiveTime: '',
              loginRetryLimit: 0
          }, { new: true });
      }
  } else {
      // send error
      let expireTime = dayjs().add(LOGIN_REACTIVE_TIME, 'minute');
      await updateOne(user,
          { _id: userData.id, isDeleted: false },
          {
              loginReactiveTime: expireTime.toISOString(),
              loginRetryLimit: userData.loginRetryLimit + 1
          });
      return {
          flag: true,
          data: `you have exceed the number of limit.you can login after ${getDifferenceOfTwoDatesInTime(now, expireTime)}.`
      };
  }
  }
  if(password){
    const isPasswordMatched = await userData.isPasswordMatch(password);
    
    if (!isPasswordMatched) {
      await updateOne(user,
        {_id:userData.id,isActive:true,isDeleted:false},
        {
          loginRetryLimit:userData.loginRetryLimit+1
        }
        );
        return  {flag:true,data:"Invalid Credential"}
  }
  
  }
  
  let userJsonData = userData.toJSON();
  let token ;
  if(!userData.userType){
    return {flag:true,data:"you are not asign for any role"}
  }
  
  if(plateform == PLATFORM.USERAPP){
    if(!LOGIN_ACCESS[userData.userType].includes(PLATFORM.USERAPP)){
      return {flag:true,message:"You are not authorizes  to access this plateform"};
    }
  token = await generateToken(userJsonData,JWT.USERAPP_SECRET)

  }
  else if(plateform == PLATFORM.ADMIN){
    if(!LOGIN_ACCESS[userData.userType].includes(PLATFORM.ADMIN)){
      return {flag:true,message:"You are not authorizes  to access this plateform"};
    }
  token = await generateToken(userJsonData,JWT.ADMIN_SECRET)
  }
  
  
  
  let userReturnData = {...userJsonData,token};

  return {flag:false,data:userReturnData}
  }else{
    return {flag:true,data:"user doesn't exist"}
  }
  } catch (error) {
    throw new Error(error.message);
  }
  }


  /**
 * @description :Send notification on reset password.
 * @param {Object} user : user document
 * @return {Object} : returns status whether notification send or not.
 */

const sentResetPasswordotpNotification = async(userData)=>{
    try {
      let resultOfEmail = false;
      let where ={
        _id:userData.id,
        isActive:true,
        isDeleted:false
      }
      let token = otpGenerator.generate(6, {digits:true,lowerCaseAlphabets:false, upperCaseAlphabets: false, specialChars: false });
      // console.log("token",token)
  
      let expire = dayjs();
      expire = expire.add(FORGET_PASSWORD_WITH.EXPIRE_IN,'minute').toISOString();
      // console.log(expire)
   const res =   await updateOne(user,where,{
        resetPasswordLink:{code:token,expireTime:expire}
      });
      console.log(res,"res")
      if(userData.email){
        let mailObj = {
          subject:"Techpyro Reset Password Otp",
          to:userData.email,
          template:"/views/email/Otp/resetPasswordTemplate",
          data:{
            isWidth:true,
            user:userData||'-',
            token:token
          }
        }
  
        try {
          await sendEmail(mailObj);
          resultOfEmail= true;
        } catch (error) {
          console.log(error)
        }
      }
  
      return {resultOfEmail};
    } catch (error) {
      throw new Error(error.message);
    }
  } 
  /**
 * @description : reset password.
 * @param {Object} user : user document
 * @param {string} newPassword : new password to be set.
 * @return {}  : returns status whether new password is set or not. {flag, data}
 */

const resetPasswordData = async(userData,newPassword)=>{
  // console.log("userData",userData)
  try {
    let where ={
      _id:userData.id,
      isActive:true,
      isDeleted:false
    }
    const dbUser = await findOne(user,where);
// console.log("dbUser",dbUser)
    if(!dbUser){
      return {
        flag:true,
        message:"User Not found"
      }
    }
newPassword = await bcrypt.hash(newPassword,8);
const res =await updateOne(user,where,{"password":newPassword,resetPasswordLink:{},loginRetryLimit:0});
// console.log("res",res)
return {
  flag: false,
  message:"reset password successfully"
}
  } catch (error) {
    throw new Error(error.message);
  }
}
  
 /**
   * @description :  Social Login.
   * @param {string} email : email of user.
   * @param {platform} platform : platform that user wants to access.
   * @return {boolean}  : returns status whether SMS is sent or not.
   */
const socialLogin = async(email,platform="userapp")=>{
  try {
    // console.log(email)
    const User = await findOne(user,{email});
    // console.log(User)
    if(User&&User.email){
      const {...userData} = User.toJSON();
      if(!User.userType){
        return {flag:true,data:"you have not been asigned any role"};
      }
      if(platform ===undefined){
        return {flag:true,data:'please login through Plateform'};
      }
      if(!PLATFORM[platform.toUpperCase()] || !JWT[`${platform.toUpperCase()}_SECRET`]){
  return {
    flag:true,
    data:"plateform not exist"
  }
      }
      if(!LOGIN_ACCESS[User.userType].includes(PLATFORM[platform.toUpperCase()])){
        return {
          flag: true,
          data:`your account doesnot have permission for this plateform.`
        };
      }
      let token =await generateToken(userData,JWT[`${platform.toUpperCase()}_SECRET`]);
     
      let expire = dayjs().add(JWT.EXPIRE_IN*60, 'second').toDate();
      res.cookie("authtoken", token, { httpOnly: true, sameSite: 'none', secure: true, expires:expire })
  
      const userReturn = {...userData,token};
      return {flag:false,data:userReturn}
    }
    else {
      return { flag: true, data: 'User/Email not exists' }
  }
  } catch (error) {
    throw new Error(error.message);
  }
  }

  export {
    sendWelcomeEmailByRegisterEmail,
    userLogin,
    sentResetPasswordotpNotification,
    resetPasswordData,
    generateToken,
    socialLogin,
    sendInvitationEamilforQuiz
  }