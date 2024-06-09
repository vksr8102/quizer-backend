import { responseStatus } from "./responseStatus.js";


export const responseBody ={
    success:(data ={})=>({
        status:responseStatus.success,
        message:data.message || "your request is successfully executed",
        data:data.data && Object.keys(data.data).length ? data.data :null
    }),
    failure:(data={})=>({
        status:responseStatus.failure,
        message:data.message || "Some error occured while performing action",
        data:data.data && Object.keys(data.data).length ? data.data :null
    }),
    internalServerError:(data={})=>({
        status:responseStatus.serverError,
        message:data.message || "Internal Server error.",
        data :data.data && Object.keys(data.data).length ? data.data :null
    }),
    badRequest:(data={})=>({
        status:responseStatus.badRequest,
        message:data.message || "Request parameter is invalid or missing.",
        data :data.data && Object.keys(data.data).length ? data.data :null
    }),
    recordNotFound:(data={})=>({
        status:responseStatus.recordNotFound,
        message:data.message || "Record(s) not found with specific criteria.",
        data :data.data && Object.keys(data.data).length ? data.data :null
    }),
    validationError:(data={})=>({
        status:responseStatus.validationError,
        message:data.message || "Invalid data,Validation failed.",
        data :data.data && Object.keys(data.data).length ? data.data :null
    }),
   Unauthorized:(data={})=>({
        status:responseStatus.unauthorized,
        message:data.message || "You are not authorized to access the request.",
        data :data.data && Object.keys(data.data).length ? data.data :null
    }),
}
   
