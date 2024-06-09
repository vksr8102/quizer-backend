
import { Question } from "../../../model/questionShema.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import {ObjectId} from "mongodb"
import { count, create, deleteMany, deleteOne, findOne, paginate, updateMany, updateOne } from "../../../utils/dbServices.js";
import { findFilterKeys, schemaKeys, updateSchemaKeys } from "../../../utils/validation/questionValidation.js";
import { validateFilterWithJoi, validateParamsWithJoi } from "../../../utils/validationRequest.js";

/**
 * @description : create document of question in mongodb Coolection.
 * @param {object} req : request including body for creating  document.
 * @param {object} res : response for creating document.
 * @returns {object} : created Question {data ,status ,message}
 */



const createQuestion = asyncHandler(async(req,res)=>{
    try {
        const {questionText,options, correctOptions, difficulty,category,weight} = req.body;
        if(!questionText || !options || !correctOptions.length || !difficulty || !category || !weight){
           return res.badRequest({message:"Invalid Parameter Request!,questionText,options,correctOption, difficulty,category and weight are required fields"});
        }

        const validateRequest = validateParamsWithJoi(req.body,schemaKeys);

        if(!validateRequest.isValid){
            return res.validationError({message:` Invalid values in parameters, ${validateRequest.message}`});
        }

        let dataToCreate = { ...req.body || {} };
        dataToCreate.addedBy = req.user.id;
        console.log(dataToCreate)
         dataToCreate = new Question(dataToCreate);

        let result = await create(Question,dataToCreate);

        return res.success({data:result});
    } catch (error) {
        return res.internalServerError({message:error.message});
    }
    

});


 /**
 * @description : create mutiple document of questions in mongoDb collection.
 * @param {object} req :request including body for creating documents.
 * @param {object} res : response  to send back the result.
 * @return {object} : created Questions . {status , message ,data}.
 */

 const addBulkQuestions = asyncHandler(async (req, res) => {
    try {
      if (req.body && (!Array.isArray(req.body.data) || req.body.data.length < 1)) {
        return res.badRequest({ message: "Request body should be an array of questions with at least one question" });
      }
  
      let dataToCreate = [...req.body.data];
      for (let i = 0; i < dataToCreate.length; i++) {
        const { questionText, options, correctOption, difficulty, category, weight } = dataToCreate[i];
  
        if (!questionText || !options || !correctOption || typeof difficulty !== 'number' || !category) {
          return res.badRequest({
            message: `Invalid Parameter Request! Question at index ${i} is missing required fields or has invalid data. questionText, options, correctOption, difficulty, category are required fields`
          });
        }
  
        // Directly set weight equal to difficulty if weight is not provided
        dataToCreate[i] = {
          ...dataToCreate[i],
          addedBy: req.user.id,
          isActive: true,
          isDeleted: false,
          weight: weight || difficulty
        };
      }
  
      let createQuestion = await create(Question, dataToCreate);
      createQuestion = { count: createQuestion ? createQuestion.length : 0 };
  
      return res.success({ data: { count: createQuestion.count || 0 } });
    } catch (error) {
      return res.internalServerError({ message: error.message });
    }
  });
  


/**
 * @description : find all documents of Questions from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Question(s). {status, message, data}
 */
const findAllQuestions= asyncHandler(async(req,res)=>{
    try {
        let query ={};
        let options ={};
const validateRequest = validateFilterWithJoi(
    req.body,
findFilterKeys,
    Question.schema.obj
);

if(!validateRequest.isValid){
    return res.validationError({message:`this is not valid ${validateRequest.message}`});
}

if(typeof req.body.query ==="object" && req.body.query !== null){
    query ={...req.body.query}
}

if(req.body.isCountOnly){
    const totalRecord =await count(Question,query);
    return res.success({data:{totalRecord}})
}


if(typeof req.body.options ==="object" && req.body.options){
    options ={...req.body.options}
}

let foundQuestions = await paginate(Question,query,options);
if(!foundQuestions || !foundQuestions.data || !foundQuestions.data.length){
    return res.recordNotFound();
}

return res.success({data:foundQuestions})



    } catch (error) {
     return res.internalServerError({message:error.message})   
    }
});

/**
 * @description : find document of Questions from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found questions. {status, message, data}
 */

const getSingleQuestion = asyncHandler(async(req,res)=>{
    try {
        let query ={}
        if(!ObjectId.isValid(req.params.id)){
return res.validationError({message:"Invalid ObjectId"});
        }

        query._id = req.params.id;
        let options ={};
        const foundQuestion = await findOne(Question,query,options);

        if(!foundQuestion) {
            return res.recordNotFound();
        }

        return res.success({data:foundQuestion})
    } catch (error) {
        return res.internalServerError({message:error.message});
    }
});



/**
 * @description : update document of Question with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated question.
 * @return {Object} : updated Question. {status, message, data}
 */
const updateQuestion = async (req,res) => {
    try {
        if(!req.params.id){
return res.badRequest({message:"please provide question id"})
        }
      let dataToUpdate = {
        ...req.body,
        updatedBy:req.user.id,
      };

      let validateRequest =validateParamsWithJoi(
        dataToUpdate,
   updateSchemaKeys
      );
      if (!validateRequest.isValid) {
        return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
      }
      const query = { _id:req.params.id };
      let updatedQuestion = await updateOne(Question,query,dataToUpdate);
      if (!updatedQuestion){
        return res.recordNotFound();
      }
      return res.success({ data :updatedQuestion});
    } catch (error){
      return res.internalServerError({ message:error.message });
    }
  };


   /**
 * @description : update multiple records of Questions with data by filter.
 * @param {Object} req : request including filter and data in request body.
 * @param {Object} res : response of updated Questions.
 * @return {Object} : updated Questions. {status, message, data}
 */

 const updateBulk = asyncHandler(async(req,res)=>{
    try {
        let filter = req.body && req.body.filter ? {...req.body.filter} :{};
    
       
        let dataToUpdate = req.body && typeof req.body.data === "object" && req.body.data !== null ? { ...req.body.data } : {};
    
        dataToUpdate.updatedBy = req.user.id;
        if (dataToUpdate.hasOwnProperty('addedBy')) {
            delete dataToUpdate['addedBy'];
        }
        
        let updateQuestions= await updateMany(Question,filter,dataToUpdate);
    if(!updateQuestions){
        return res.recordNotFound();
    }
    
    return res.success({data:{count:updateQuestions}})
    } catch (error) {
        console.log(error.message)
      return res.internalServerError({message:error.message}) ;
    }
     })


   
        /**
 * @description : deactivate document of question from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated document of Product.
 * @return {Object} : deactivated question. {status, message, data}
 */

        const softDeletequestion =asyncHandler (async (req,res) => {
            try {
              if (!req.params.id){
                return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
              }
              let query = { _id:req.params.id };
              const updateBody = {
                isDeleted: true,
                isActive:false,
                updatedBy: req.user.id,
              };
              let updatedquestion = await updateOne(Question, query, updateBody);
              if (!updatedquestion){
                return res.recordNotFound();
              }
              return res.success({ data:updatedquestion });
            } catch (error){
              return res.internalServerError({ message:error.message }); 
            }
          });  


     /**
 * @description : delete document of Question from table.
 * @param {Object} req : request including id as req param.
 * @param {Object} res : response contains deleted document.
 * @return {Object} : deleted Question. {status, message, data}
 */

const DeleteQuestion = asyncHandler(async(req,res)=>{
    try {
        
        if(!req.params.id){
            return res.badRequest({message:"Insufficient parameters ! Please Provide product id"});
        }

        let query = {_id:req.params.id};
        let deleteQuestion = await deleteOne(Question,query);

        if(!deleteQuestion){
            return res.recordNotFound();
        }

        return res.success({message:"delete Successfully"});
    } catch (error) {
        return res.internalServerError({message:error.message});
    }
}); 

 /**
 * @description : delete documents of Question in table by using ids.
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
       const deletedQuestion = await deleteMany(Question,query);
       if(!deletedQuestion){
        return res.recordNotFound();
       }

       return res.success({ message:`${deletedQuestion}  ${deletedQuestion>1 ?"Questions":"question"} deleted Successfully` });
    } catch (error) {
        return res.internalServerError({message:error.message})
    }
 })

export {
    createQuestion,
    addBulkQuestions,
    findAllQuestions,
    getSingleQuestion,
    updateQuestion,
    updateBulk,
    softDeletequestion,
    DeleteQuestion,
    BulkDelete
}