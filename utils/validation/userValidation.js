import joi from 'joi'
import { isCountOnly, options, populate, select } from './commonFilterValidation.js';
/**
 * userValidtion.js
 * @description :: validate post and put request as per user model
 */



/** validation keys and properties of user */

const schemaKeys = joi.object({
    password:joi.string().allow(null).allow(''),
    email:joi.string().email({ tlds :{allow:false}}),
    userType:joi.string().allow(null).allow(''),
    isActive:joi.boolean(),
    isDeleted:joi.boolean()
}).unknown(true);

/** validation keys and properties of user for updation */

const updateSchemaKeys =joi.object({
    password:joi.string().allow(null).allow(''),
    email:joi.string().email({ tlds :{allow:false}}),
    userType:joi.string().allow(null).allow(''),
    isActive:joi.boolean(),
    isDeleted:joi.boolean()
}).unknown(true);


/** validation keys and properties of user for filter documents from collection */
let keys = ['query', 'where'];
const findFilterKeys=joi.object({
    options:options,
    ...Object.fromEntries(
        keys.map(key=>[key,joi.object({
            password:joi.alternatives().try(joi.array().items(),joi.string(),joi.object()).allow(null).allow(''),
            email:joi.alternatives().try(joi.array().items(),joi.string(),joi.object()).allow(null).allow(''),
            isActive:joi.alternatives().try(joi.array().items(),joi.boolean(),joi.object()).allow(null).allow(''),
            isDeleted:joi.alternatives().try(joi.array().items(),joi.boolean(),joi.object()).allow(null).allow(''),
            userType:joi.alternatives().try(joi.array().items(),joi.string(),joi.object()).allow(null).allow(''),
            id:joi.any(),
            _id:joi.alternatives().try(joi.array(),joi.string().regex(/^[0-9a-fA-F]{24}$/),joi.object() )
        }).unknown(true)
    ])
    ),
    isCountOnly:isCountOnly,
    populate:joi.array().items(populate),
    select:select
}).unknown(true)

export {
    schemaKeys,
    updateSchemaKeys,
    findFilterKeys
}