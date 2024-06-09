import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2"
import { convertObjectToEnum } from "../utils/comon.js";
import { USER_TYPE } from "../constants/authConstant.js";
import idValidator from "mongoose-id-validator"
import uniqueValidator from "mongoose-unique-validator"
import bcrypt from "bcrypt"

const myCustomLables ={
    totalDocs :"itemsCount",
    docs:"data",
    limit:"perPage",
    page: "currentPage" ,
    nextPages:"next",
    prevPages:"prev",
    totalPages:"pageCount",
    pagingCounter:"slNo",
    meta:"paginator"
    }

 mongoosePaginate.paginate.options ={customLabels:myCustomLables}; 
 const Schema = mongoose.Schema;
const UserSchema = new Schema({
email:{
type:String
},
name:{
    type:String
},
password:{
type:String
},
userType:{
type:String,
enum:convertObjectToEnum(USER_TYPE),
require:true
},
location:{
type:String
},
resetPasswordLink:{
    code:String,
    expireTime:Date
},
loginRetryLimit:{
    type:Number,
    default:0
},
loginReactiveTime:{type:Date},
ssoAuth:{googleId:{type:String}},
createdBy:{
    ref:'user',
    type:Schema.Types.ObjectId
},
updatedBy:{
    ref:'user',
    type:Schema.Types.ObjectId
},
countrycode:{
type:Number,
default:91
},
isActive:{type:Boolean},
isDeleted:{type:Boolean},
createdAt:{
    type:Date
},
updatedAt:{
    type:Date
}

},{timestamps:{
    createdAt:'createdAt',
    updatedAt:'updatedAt'
}})

UserSchema.pre('save',async function(next){
    this.isDeleted=false;
    this.isActive = true;
    if(this.password){
this.password = await bcrypt.hash(this.password,8) 
    }
    next();
})

UserSchema.pre('insertMany', async function (next,docs){
    if(docs && docs.length ){
        for(let i=0;i<docs.length;i++){
            const element = docs[i];
            element.isDeleted = false;
            element.isActive = true;
        }
    }
    next()
})

UserSchema.methods.isPasswordMatch = async function(password){
    const user = this;
    return bcrypt.compare(password,user.password);
}

UserSchema.method('toJSON',function(){
    const {
        _id,_v,...Object} = this.toObject({virtuals:true});
    Object.id = _id;
    delete Object.password;
    return  Object;
})

UserSchema.plugin(mongoosePaginate)
UserSchema.plugin(idValidator);
UserSchema.plugin(uniqueValidator,{message:'Error,expected {VALUE} to be unique.'});
export const user = mongoose.model("user",UserSchema);