
import { user } from "../../../model/user.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { checkUniqueFieldsInDatabase } from "../../../utils/comon.js";
import { count, create, deleteMany, deleteOne, findOne, paginate, updateOne } from "../../../utils/dbServices.js";
import { findFilterKeys, schemaKeys, updateSchemaKeys } from "../../../utils/validation/userValidation.js";
import { validateFilterWithJoi, validateParamsWithJoi } from "../../../utils/validationRequest.js";

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


/**
 * @description : create document of user in mongodb Coolection.
 * @param {object} req : request including body for creating  document.
 * @param {object} res : response for creating document.
 * @returns {object} : created user {data ,status ,message}
 */


const addUser = async (req, res) => {
    try {
      let {
        name,email,createdBy
      } = req.body;
      console.log(!createdBy || !name )
      if (!createdBy || !email || !name) {
        return res.badRequest({ message: 'Insufficient request parameters! email , name  and admin  is required.' });
      }
      
      if(req.user.id.toString()!==createdBy.toString())
      return res.unAuthorized({ message: 'Unautherized User' });
  
      let dataToCreate = { ...req.body || {} };
      let validateRequest = validateParamsWithJoi(
        dataToCreate,
        schemaKeys);
      if (!validateRequest.isValid) {
        return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
      }
  
       // check data availble in database or not
      
       if(req.body.email){
        let checkUniqueFields = await checkUniqueFieldsInDatabase(user,dataToCreate,["email"],"REGISTER");
        if(checkUniqueFields?.isDuplicate){
            return res.validationError({message:`${checkUniqueFields.value} already exists.Unique ${checkUniqueFields.field} are allowed.`})
        }
    }

 
      let createdUser = await create(user,dataToCreate);
    
      return res.success({ data : createdUser });
    } catch (error) {
      return res.internalServerError({ message:error.message }); 
    }
  };
  



  const findAllUsers = asyncHandler(async(req,res)=>{
    try {
        // console.log( req.body)
        let query = {}
        let options = {};
        let validateRequest = validateFilterWithJoi(
            req.body,
            findFilterKeys,
            user.schema.obj
        );
        if(!validateRequest.isValid){
            return res.validationError({message:`${validateRequest.message}`})
        }
       

        if(typeof req.body.query === 'object' && req.body.query !==null){
            query ={...req.body.query};
        }

        query._id =  {$ne : req.user.id} ;
        if(req?.body?.query?._id){
            // query ={ "_id": { "$in": [req.body.query._id] } }
            query._id.$in = [req.body.query._id]
        }

        
        if(req.body.isCountOnly){   
            const totalCount = await count(user,query);
            return res.success({data:{totalCount}});
        }

        // console.log(req.body.options ==='object')
        if(req.body && typeof req.body.options ==="object" && req.body.options !==null){
            options ={...req.body.options};
        }
        let foundUsers = await paginate(user,query,options);
        if(!foundUsers && !foundUsers.data && !foundUsers.data.length){
            return res.recordNotFound()
        }

        return res.success({data:foundUsers})


    } catch (error) {
        return res.internalServerError({message:error.message});
    }
})


/**
 * @description : returns total number of documents of User.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getUserCount = asyncHandler(async(req,res)=>{
    try {
        let where = {};
      const validateRequest = validateFilterWithJoi(
        req.body,
        findFilterKeys,
        user.schema.obj
    )  ;
    if(!validateRequest.isValid){
        return res.validationError({message:`${validateRequest.message}`});
    }

if(typeof req.body.where === 'object' && req.body.where !==null){
    where = {...req.body.where}
}

const countUser = await count(user,where);

return res.success({data:{count:countUser}})

    } catch (error) {
       return res.internalServerError({message:error.message}) 
    }
})


const getUser =asyncHandler(async(req,res)=>{
    try {
       const userId = req.params.id;
       if(!userId){
return res.badRequest({ message: 'Insufficient request parameters! id  is required'})
       }
       let query = {_id:userId}
       const userData= await findOne(user,query);

       if(!userData){
        return res.recordNotFound();
       }
       return res.success({data:userData})
    } catch (error) {
        return res.internalServerError({message:error.message}) 
    }
})

/**
 * @description :deleted  document of user from table by id;
 * @param {object} req : request including id in request body.
 * @param {object} res : response contains deleted document of User.
 * @return {object} : deleted user {status,data,message}.
 */

const deleteUser = asyncHandler(async(req,res)=>{
    try {
        if(!req.params.id){
return res.badRequest({message:"insufficient parameter !  , id is required"});
        }
let query = {_id:req.params.id};
const deleteUser = await deleteOne(user,query);
if (!deleteUser) {
     return res.recordNotFound();
   }
   return res.success({data:deleteUser, message:"Record has been Deleted Successfully."});
    
    } catch (error) {
        
    }
});


/**
 * @description : delete documents of users in table by using ids.
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains no of documents deleted.
 * @return {Object} : no of documents deleted. {status, message, data}
 */

const BulkDelete = asyncHandler(async(req,res)=>{
    try {
       let ids = req.body.ids;
       if(!ids || !Array.isArray(ids) || ids.length<1){
        return res.badRequest();
       } 

       const query = {_id:{$in:ids}};
       const deletedQuestion = await deleteMany(user,query);
       if(!deletedQuestion){
        return res.recordNotFound();
       }

       return res.success({ message:`${deletedQuestion}  ${deletedQuestion>1 ?"users":"user"} deleted Successfully` });
    } catch (error) {
        return res.internalServerError({message:error.message})
    }
 })
export {
    getLoggedinUser,
    updateUser,
    softDeleteUser,
    addUser,
    findAllUsers,
    getUserCount,
    deleteUser,
    getUser,
    BulkDelete
}