import joi from "joi";

/**
 * commonFilterValidation.js
 * @description :: helper to validate filter.
 */


/**options which contains attributes of querying data. */
const options =joi.object({
pagination:joi.boolean(),
collation:joi.alternatives().try(joi.string(), joi.object()).allow(null).allow(''),
sort:joi.alternatives().try(joi.array().items(),joi.string(),joi.object()).allow(null).allow(''),
populate:joi.alternatives().try(joi.array().items(),joi.object(),joi.string()).allow(null).allow(''),
projection:joi.alternatives().try(joi.array().items(),joi.string(),joi.object()).allow(null).allow(''),
lean:joi.boolean(),
page:joi.number().integer(),
limit:joi.number(),
useEstimatedCount:joi.boolean(),
useCustomCountFn:joi.boolean(),
forceCountFn:joi.boolean(),
read:joi.any(),
options:joi.any()
}).unknown(true);

/** joi boolean attribute for count */

const isCountOnly = joi.boolean();

/** validation attribute for mongoose populate */

const populate = joi.object({
 path:joi.string().allow(null).allow(''),
 select: joi.array()
}).unknown(true);


/** projection attribute for mongoose document */
const select = joi.alternatives().try(joi.array().items(),joi.string(),joi.object()).allow(null).allow('')


export{
    options,
    isCountOnly,
    populate,
    select
}