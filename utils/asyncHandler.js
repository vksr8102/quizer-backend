/**
 * asyncHandler.js
 * @description : error handleling for controller
 * @param {Object} requestHandler : request from controller function
 */

const asyncHandler =(requestHandler)=> (req,res,next)=>{
Promise.resolve(requestHandler(req,res,next)).catch((err)=>{
    next(err)
})
}

export {asyncHandler}