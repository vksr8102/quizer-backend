
import passport from "passport";
import { LOGIN_ACCESS, PLATFORM } from "../constants/authConstant.js";

/**
 * @description :returns callbackthat verifies require right and access.
 * @param req : request for a route.
 * @param {callback} resolve : resolve the sceccinding process.
 * @param {callback} reject :reject for an error.
 * @param {string} plateForm : platform to check if user has access or not.
 */



const verifyCallback = (req, resolve, reject, platform) => async (error, user, info) => {
  // console.log(info)
    if (error || info || !user) {
      return reject('Unauthorized User');
    }
    req.user = user;
    // console.log(user)
    if (!user.isActive || user.isDeleted) {
      return reject('User is deactivated');
    }

    if (user.userType) {
      let allowedPlatforms = LOGIN_ACCESS[user.userType] ? LOGIN_ACCESS[user.userType] : [];
      // console.log(allowedPlatforms);
      if (!allowedPlatforms.includes(platform)) {
        return reject('Unauthorized user');
      }
    }
    resolve();
  };


/**
 * @description : authentication middleware for request.
 * @param {Object} req : request of route.
 * @param {Object} res : response of route.
 * @param {callback} next : executes the next middleware succeeding the current middleware.
 * @param {int} platform : platform
 */


 export const auth = (platform) => async (req, res, next) => {

    if (platform == PLATFORM.USERAPP) {
      return new Promise((resolve, reject) => {
        passport.authenticate('userapp-rule', { session: false }, verifyCallback(req, resolve, reject, platform))(
          req,
          res,
          next
        );
      })
        .then(() => next())
        .catch((error) => {
          return res.unAuthorized({ message: error.message });
        });
    }
    else if (platform == PLATFORM.ADMIN) {
      return new Promise((resolve, reject) => {
        passport.authenticate('admin-rule', { session: false }, verifyCallback(req, resolve, reject, platform))(
          req,
          res,
          next
        );
      })
        .then(() => next())
        .catch((error) => {
          return res.unAuthorized({ message: error.message });
        });
    }
   
  };

