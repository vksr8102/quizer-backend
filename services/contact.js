import { sendEmail } from "./emailService.js";

const sendThankYoumailByContactingUsEmail = async(user)=>{
    try {
        console.log("user",user)
        let mailObj ={
            subject:'Thank You for Contacting Us!',
            to:user.email,
            template:'/views/email/thankyou',
            data:{
                isWidth:true,
                user:user ||'',
                message:""
            }
        }
        try {
         await sendEmail(mailObj)  
         return true;
        } catch (error) {
            console.log(error )
            return false
        }
    } catch (error) {
      console.log(error)
      return false
    }
  
  }

  export {
    sendThankYoumailByContactingUsEmail
  }