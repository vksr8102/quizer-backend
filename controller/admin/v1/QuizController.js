import { Quiz } from "../../../model/QuizSchema.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { count, create, deleteMany, deleteOne, findOne, paginate, updateOne } from "../../../utils/dbServices.js";
import { findQuizFilterKeys, quizSchemaKeys, updateQuizSchemaKeys } from "../../../utils/validation/QuizValidation.js";
import { validateFilterWithJoi, validateParamsWithJoi } from "../../../utils/validationRequest.js";
import {ObjectId} from "mongodb";
/**
 * @description : create document of Quiz in mongodb Coolection.
 * @param {object} req : request including body for creating  document.
 * @param {object} res : response for creating document.
 * @returns {object} : created Quiz {data ,status ,message}
 */

const createQuiz = asyncHandler(async (req, res) => {
    try {
      const { title, questions } = req.body;
  
      if (!title) {
        return res.badRequest({ message: "Invalid Parameter Request!, title is a required field" });
      }
  
      if(questions.length !==20){
        return res.badRequest({message:"quiz	should	have	20 Questions"});
      }
      const validateRequest = validateParamsWithJoi(req.body, quizSchemaKeys);
  
      if (!validateRequest.isValid) {
        return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
      }
  
      let dataToCreate = { ...req.body };
      dataToCreate.addedBy = req.user.id;
  
      const newQuiz = new Quiz(dataToCreate);
  
      const result = await create(Quiz, newQuiz);
  
      return res.success({ data: result });
    } catch (error) {
      return res.internalServerError({ message: error.message });
    }
  });


/**
 * @description : Find all documents of Quizs from collection based on query and options.
 * @param {Object} req : Request including option and query. {query, options: {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : Response contains data found from collection.
 * @return {Object} : Found Quiz(s). {status, message, data}
 */
const findAllQuizs = asyncHandler(async (req, res) => {
    try {
      let query = {};
      let options = {};
      
      const validateRequest = validateFilterWithJoi(
        req.body,
        findQuizFilterKeys,
        Quiz.schema.obj
      );
  
      if (!validateRequest.isValid) {
        return res.validationError({ message: `Invalid request: ${validateRequest.message}` });
      }
  
      if (typeof req.body.query === "object" && req.body.query !== null) {
        query = { ...req.body.query };
      }
  
      if (req.body.isCountOnly) {
        const totalRecord = await count(Quiz, query);
        return res.success({ data: { totalRecord } });
      }
  
      if (typeof req.body.options === "object" && req.body.options) {
        options = { ...req.body.options };
      }
  
      const foundQuizs = await paginate(Quiz, query, options);
      if (!foundQuizs || !foundQuizs.data || !foundQuizs.data.length) {
        return res.recordNotFound();
      }
  
      return res.success({ data: foundQuizs });
    } catch (error) {
      return res.internalServerError({ message: error.message });
    }
  });


  /**
 * @description : find document of Quizs from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Quizs. {status, message, data}
 */

const getSingleQuiz = asyncHandler(async(req,res)=>{
    try {
        let query ={}
        if(!ObjectId.isValid(req.params.id)){
return res.validationError({message:"Invalid ObjectId"});
        }

        query._id = req.params.id;
        let options ={};
        const foundQuiz = await findOne(Quiz,query,options);
console.log(query,options)
        if(!foundQuiz) {
            return res.recordNotFound();
        }
        return res.success({data:foundQuiz})
    } catch (error) {
        return res.internalServerError({message:error.message});
    }
});


/**
 * @description : update document of Quiz with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Quiz.
 * @return {Object} : updated Quiz. {status, message, data}
 */
const updateQuiz = async (req,res) => {
  try {
      if(!req.params.id){
return res.badRequest({message:"please provide Quiz id"})
      }
    let dataToUpdate = {
      ...req.body,
      updatedBy:req.user.id,
    };

    let validateRequest =validateParamsWithJoi(
      dataToUpdate,
 updateQuizSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }
    const query = { _id:req.params.id };
    let updatedQuiz = await updateOne(Quiz,query,dataToUpdate);
    if (!updatedQuiz){
      return res.recordNotFound();
    }
    return res.success({ data :updatedQuiz});
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};

        /**
 * @description : deactivate document of Quiz from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated document of Product.
 * @return {Object} : deactivated Quiz. {status, message, data}
 */
 const softDeleteQuiz =asyncHandler (async (req,res) => {
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
            let updatedQuiz = await updateOne(Quiz, query, updateBody);
            if (!updatedQuiz){
              return res.recordNotFound();
            }
            return res.success({ data:updatedQuiz });
          } catch (error){
            return res.internalServerError({ message:error.message }); 
          }
        });
        
         /**
 * @description : delete document of Quiz from table.
 * @param {Object} req : request including id as req param.
 * @param {Object} res : response contains deleted document.
 * @return {Object} : deleted Quiz. {status, message, data}
 */

const DeleteQuiz = asyncHandler(async(req,res)=>{
  try {
      
      if(!req.params.id){
          return res.badRequest({message:"Insufficient parameters ! Please Provide Quiz id"});
      }

      let query = {_id:req.params.id};
      let deleteQuiz = await deleteOne(Quiz,query);

      if(!deleteQuiz){
          return res.recordNotFound();
      }

      return res.success({message:"delete Successfully"});
  } catch (error) {
      return res.internalServerError({message:error.message});
  }
});

 /**
 * @description : delete documents of Quiz in table by using ids.
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
     const deletedQuiz = await deleteMany(Quiz,query);
     if(!deletedQuiz){
      return res.recordNotFound();
     }

     return res.success({ message:`${deletedQuiz}  ${deletedQuiz>1 ?"Quizs":"Quiz"} deleted Successfully` });
  } catch (error) {
      return res.internalServerError({message:error.message})
  }
});




export {
    createQuiz,
    findAllQuizs,
    getSingleQuiz,
    updateQuiz,
    softDeleteQuiz,
    DeleteQuiz,
    BulkDelete
}

