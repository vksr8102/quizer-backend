/**
 * validationRequest.js
 * @description :: exports methods for validating parameters of request body using joi validation.
 */

import { FILTER_KEY } from "../constants/filterkeys.js";

/**
 * @description:: validate request body parametrs with joi.
 * @param  {Object} payload - body from request.
 * @param {Object} schemaKeys - model wise schema keys. ex.user Validation.
 * @returns : return validation with message {isValid, message}
 */

const validateParamsWithJoi = (payload, schemaKeys) => {
  // console.log("payload",payload,schemaKeys)

  const { error } = schemaKeys.validate(payload, {
    convert: false,
    abortEarly: false,
  });
  // console.log("error",error)
  if (error) {
    const message = error.details.map((el) => el.message).join("\n");
    // console.log("message",message)
    return {
      isValid: false,
      message,
    };
  } else {
    return { isValid: true };
  }
};

const validateFilterWithJoi = (payload, schemaKeys, modelSchema) => {
  // console.log(payload.options,modelSchema)
  const keys = [];
  let isValid = true;
  if (modelSchema) {
    keys.push(...Object.keys(modelSchema), ...Object.values(FILTER_KEY));
    if (payload.options && payload.options.select) {
      if (Array.isArray(payload.options.select)) {
        isValid = keys.some((item) => payload.options.select.includes(item));
      } else if (typeof payload.options.select === "string") {
        payload.options.select = payload.options.select.split(" ");
        isValid = keys.some((item) => payload.options.select.includes(item));
      }
    }
  } else if (payload && payload.select) {
    if (Array.isArray(payload.select)) {
      isValid = keys.some((ai) => payload.select.includes(ai));
    } else if (typeof payload.select === "string") {
      payload.select = payload.select.split(" ");
      isValid = keys.some((ai) => payload.select.includes(ai));
    } else {
      isValid = keys.some((ai) => Object.keys(payload.select).includes(ai));
    }
  }

  if (!isValid) {
    return {
      isValid: false,
      message: "invalid attributes in options.select",
    };
  }

  const { error } = schemaKeys.validate(payload, {
    abortEarly: false,
    convert: false,
  });
  if (error) {
    const message = error.details.map((el) => el.message).join("\n");
    return {
      isValid: false,
      message,
    };
  }
  return { isValid: true };
};

export { validateParamsWithJoi, validateFilterWithJoi };
