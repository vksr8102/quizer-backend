import Joi from 'joi';
import { isCountOnly, options, populate, select } from './commonFilterValidation.js';

/**
 * questionValidation.js
 * @description :: validate post and put request as per question model
 */

/** Validation keys and properties of question */
const schemaKeys = Joi.object({
    questionText: Joi.string().required(),
    options: Joi.array().items(Joi.string()).required(),
    correctOptions: Joi.array().items(Joi.number().integer()).required(), 
    difficulty: Joi.number().integer().required(),
    category: Joi.string().required(),
    weight: Joi.number().integer().required(),
    isActive: Joi.boolean(),
    isDeleted: Joi.boolean()
}).unknown(true);

/** Validation keys and properties of question for updating */
const updateSchemaKeys = Joi.object({
    questionText: Joi.string(),
    options: Joi.array().items(Joi.string()),
    correctOptions: Joi.array().items(Joi.number().integer()), 
    difficulty: Joi.number().integer(),
    category: Joi.string(),
    weight: Joi.number().integer(),
    isActive: Joi.boolean(),
    isDeleted: Joi.boolean()
}).unknown(true);

/** Validation keys and properties of question for filtering documents from collection */
let keys = ['query', 'where'];
const findFilterKeys = Joi.object({
    options: options,
    ...Object.fromEntries(
        keys.map(key => [key, Joi.object({
            questionText: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string(), Joi.object()).allow(null).allow(''),
            options: Joi.alternatives().try(Joi.array().items(Joi.array().items(Joi.string())), Joi.string(), Joi.object()).allow(null).allow(''),
            correctOptions: Joi.alternatives().try(Joi.array().items(Joi.number().integer()), Joi.array().items(Joi.object()), Joi.object()).allow(null).allow(''), // Adjusted to allow array of objects
            difficulty: Joi.alternatives().try(Joi.array().items(Joi.number().integer()), Joi.number().integer().min(1).max(5), Joi.object()).allow(null).allow(''), // Assuming difficulty range 1-5
            category: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string(), Joi.object()).allow(null).allow(''),
            weight: Joi.alternatives().try(Joi.array().items(Joi.number().integer()), Joi.number().integer(), Joi.object()).allow(null).allow(''),
            id: Joi.any(),
            _id: Joi.alternatives().try(Joi.array(), Joi.string().regex(/^[0-9a-fA-F]{24}$/), Joi.object())
        }).unknown(true)
        ])
    ),
    isCountOnly: isCountOnly,
    populate: Joi.array().items(populate),
    select: select
}).unknown(true);

export {
    schemaKeys,
    updateSchemaKeys,
    findFilterKeys
};
