import { user } from "../../../model/user.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { checkUniqueFieldsInDatabase } from "../../../utils/comon.js";
import { findOne, updateOne } from "../../../utils/dbServices.js";
import { updateSchemaKeys } from "../../../utils/validation/userValidation.js";
import { validateParamsWithJoi } from "../../../utils/validationRequest.js";

 /**
 * @description : get information of logged-in User.
 * @param {Object} req : authentication token is required
 * @param {Object} res : Logged-in user information
 * @return {Object} : Logged-in user information {status, message, data}
 */

const getLoggedinUser = asyncHandler(async(req,res)=>{
    try {
        const queryData ={
            _id :req.user.id,
            isActive:true
        }

        const foundUser = await findOne(user,queryData);
        if(!foundUser){
            return res.recordNotFound();
        }
        return res.success({data:foundUser});

    } catch (error) {
        return res.internalServerError({message:error.message})  
    }
})

 /**
 * @description : update document of User with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated User.
 * @return {Object} : updated User. {status, message, data}
 */


const updateUser = asyncHandler(async(req,res)=>{
    
try {
    if(!req.params.id){
        return res.badRequest({message:"Insufficient parameters ! id is required."})
    }

    if(req.body.password){
        return res.validationError({message:"Password is not update using this method"})
    }

    let dataToUpdate = {...req.body}
    let validationRequest = validateParamsWithJoi(dataToUpdate,updateSchemaKeys)
    if(!validationRequest.isValid){
return res.validationError({message:`Invalid  parameter ${validationRequest.message}`})
    }

    
    if(req.body.email){
        let checkuniqueField = await checkUniqueFieldsInDatabase(user,dataToUpdate,['email'],'REGISTER');
        if(checkuniqueField?.isDuplicate){
return res.validationError({message:`${checkuniqueField.value} already exist. Unique ${checkuniqueField.field} are allowed.`})
        }
    } 

    if(req.body.phone){
        let checkuniqueField = await checkUniqueFieldsInDatabase(user,dataToUpdate,['phone'],'REGISTER');
        if(checkuniqueField?.isDuplicate){
return res.validationError({message:`${checkuniqueField.value} already exist. Unique ${checkuniqueField.field} are allowed.`})
        }
    }

    let query ={_id:req.params.id};
  
    const updatedUser =await updateOne(user,query,dataToUpdate);
    if(!updateUser){
        return res.recordNotFound()
    }

    return res.success({data:updatedUser})

} catch (error) {
    return res.internalServerError({message:error.message})
}
})


/**
 * @description : deactivate document of user from table by id;
 * @param {object} req : request including id in request params.
 * @param {object} res : response contains updated document of User.
 * @return {Object} : deactivated User. {status,data,message}
 */

const softDeleteUser = asyncHandler(async(req,res)=>{
    try {
        if(!req.params.id){
            return res.badRequest({message:"insufficient  parameters ! , id is required"});
        }
let query = {_id:req.params.id}

let  dataToUpdate={isDeleted:true,isActive:false};

let updateUserData = await updateOne(user,query,dataToUpdate);
if (!updateUserData) {
    return res.recordNotFound();
}

return res.success({data:updateUserData});
    } catch (error) {
        return res.internalServerError({message:error.message})
    }
})
export {
    getLoggedinUser,
    updateUser,
    softDeleteUser
}