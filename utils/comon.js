/**
 * common.js
 * @description :: exports helper methods for project
 */

import { findOne } from "./dbServices.js";

/**
 * convertObjectToEnum : convert object to enum.
 * @param {Object} obj : object to be converted,
 * @returns {Array}  : converted array
 */


const   convertObjectToEnum = (obj) =>{
  let enumArr = [];
  Object.values(obj).map((value)=>enumArr.push(value));
  return enumArr

}

/**
 * checkUniqueFieldsInDatabase:check unique fields in database for insert and update
 *@param {object} model:mopngoose model instance of collection
 *@param {Object} data:data which will be inserted or updated
 *@param {Array} fieldsToCheck:array of fields to checked in database
 *@param {String} operation :operation identification.
 *@param {Object} filter : filter for query.
 *@return {Object}:information about duplicate fields.
 */

 const  checkUniqueFieldsInDatabase = async (model,data,fieldsToCheck,operation,filter={})=>{
console.log(fieldsToCheck)
    switch(operation){
      case "REGISTER":
        for(let field of fieldsToCheck){
console.log(data[field])
          let query;
          query = {
            ...filter,
            [field]:data[field]
          };

          let found = await findOne(model,query);
          if (found) {
            return {
              isDuplicate:true,
              field:field,
              value:data[field]
            }
          }
        }

       //cross field validation required when login with multiple fields are present, to prevent wrong user logged in. 
        break;
        default :{
          return{
            isDuplicate:false
          }
          break;
        }
    }
  
 }


 function getDifferenceOfTwoDatesInTime(currentDate,toDate){
let hours =toDate.diff(currentDate,'hour')
currentDate = currentDate.add(hours,'hour')
let minutes =toDate.diff(currentDate,'minute')
currentDate = currentDate.add(minutes,'minute')
let seconds =toDate.diff(currentDate,'second')
currentDate = currentDate.add(seconds,'second')

if(hours){
  return `${hours} hour ${minutes} minute and ${seconds} second`
}
return `${minutes} minute and ${seconds} second`

 }


 export {
  convertObjectToEnum,
  checkUniqueFieldsInDatabase,
  getDifferenceOfTwoDatesInTime,
}