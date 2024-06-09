import joi from 'joi';
import { isCountOnly, options, populate, select } from './commonFilterValidation.js';

/** Validation keys and properties of quiz for creation */
const quizSchemaKeys = joi.object({
  title: joi.string().required(),
  questions: joi.array().items(joi.string().regex(/^[0-9a-fA-F]{24}$/)).required(), // Array of question IDs
  createdAt: joi.date().default(Date.now)
}).unknown(true);

/** Validation keys and properties of quiz for updation */
const updateQuizSchemaKeys = joi.object({
  title: joi.string(),
  questions: joi.array().items(joi.string().regex(/^[0-9a-fA-F]{24}$/)),
  createdAt: joi.date()
}).unknown(true);

/** Validation keys and properties of quiz for filtering documents from collection */
let keys = ['query', 'where'];
const findQuizFilterKeys = joi.object({
  options: options,
  ...Object.fromEntries(
    keys.map(key => [key, joi.object({
      title: joi.alternatives().try(joi.array().items(joi.string()), joi.string(), joi.object()).allow(null).allow(''),
      questions: joi.alternatives().try(joi.array().items(joi.array().items(joi.string().regex(/^[0-9a-fA-F]{24}$/))), joi.string(), joi.object()).allow(null).allow(''),
      createdAt: joi.alternatives().try(joi.array().items(joi.date()), joi.date(), joi.object()).allow(null).allow(''),
      id: joi.any(),
      _id: joi.alternatives().try(joi.array(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object())
    }).unknown(true)
  ])
  ),
  isCountOnly: isCountOnly,
  populate: joi.array().items(populate),
  select: select
}).unknown(true);

export {
  quizSchemaKeys,
  updateQuizSchemaKeys,
  findQuizFilterKeys
}
