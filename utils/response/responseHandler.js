/**
 * responseHandler.js
 * @description :: exports all handler for response format.
 */

import { responseBody } from "./index.js"
import { responseCode } from "./responseCode.js"


/**
 * @param {obj} req : req from controller.
 * @param {obj} res : res from controller.
 * @param {*} next : executes the middleware succeeding the current midlewares.
 */

export const responseHandler =(req,res,next)=>{
    res.success =(data={})=>{
        res.status(responseCode.sucesss).json(responseBody.success(data));
    };
    res.failure =(data={})=>{
        res.status(responseCode.badRequest).json(responseBody.failure(data));
    };
    res.internalServerError=(data={})=>{
        res.status(responseCode.internalServerError).json(responseBody.internalServerError(data));
    };
    res.badRequest=(data={})=>{
        res.status(responseCode.badRequest).json(responseBody.badRequest(data));
    };
    res.recordNotFound=(data={})=>{
        res.status(responseCode.recordNotFound).json(responseBody.recordNotFound(data));
    };
    res.validationError=(data={})=>{
        res.status(responseCode.validationError).json(responseBody.validationError(data));
    };
    res.unAuthorized=(data={})=>{
        res.status(responseCode.unAuthorized).json(responseBody.Unauthorized(data));
    };
    next();
}