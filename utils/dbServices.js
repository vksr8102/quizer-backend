export const create =async(model,data)=>{
    try {
        const  newData=await model.create(data)
        return newData;
    } catch (error) {
       throw error; 
    }
}

//update single document  that will be return updated documant
export const updateOne = async (model, filter, data, options = { new: true }) => {
    try {
     
      const doc = await model.findOneAndUpdate(filter, data, options);
      return doc;
    } catch (err) {
      throw err;
    }
  };

//delete single document that will be return updated  documents
export const deleteOne = async (model, filter, data, options = { new: true }) => {
    try {
      const doc = await model.findOneAndDelete(filter, data, options);
      return doc;
    } catch (err) {
      throw err;
    }
  };



  // update  multiple document and return number of affected documents
export const updateMany=async(model,filter,options)=>{
  try {
    const result = await model.updateMany(filter,options)
    if(result){
      return result
    }else{
      return 
    }
  } catch (error) {
    console.log("Error in DB Service",error.message ? error.message : error)
  }

}

//find Single document by query
export const findOne = async(model,filter,options={})=>{
  try {
    const result = await model.findOne(filter,options);
    if(result){
      return result;
    }
  } catch (error) {
    throw error;
  }
}

// find  multiple documents
export const findMany = async(model,filter,options={})=>{
  try {
    const result = await model.find(filter,options);
    if(result){
      return result;
    }
  } catch (error) {
    throw error;
  }
}

//delete many document that will be return updated  documents
export const deleteMany = async (model, filter) => {
  try {
    const result = await model.deleteMany(filter);
    return result.deletedCount;
  } catch (error) {
    throw error;
  }
};

//count documents
export const count = async (model, filter) => {
  try {
    const result = await model.countDocuments(filter);
    return result;
  } catch (error) {
    throw error;
  }
};


// find Document with pagination
export const paginate = async (model, filter,options) => {
  try {
    const result = await model.paginate(filter, options);
    console.log(result)
    if(result){
      return result;
    }
  } catch (error) {
    throw error;
  }
}

