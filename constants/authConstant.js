/**
 * authConstant.js
 * @description :: Constants for authentication .
 */

export const JWT ={
    USERAPP_SECRET:"myuserappsecrate",
    ADMIN_SECRET: "myadminsecrete",
    EXPIRE_IN:10000
}


export const USER_TYPE ={
    USER:"user",
    ADMIN:"admin"
}

export const PLATFORM = {
    USERAPP: "user",
    ADMIN: "admin",
  };

export const LOGIN_ACCESS ={
    [USER_TYPE.USER] :[PLATFORM.USERAPP],
    [USER_TYPE.ADMIN]:[PLATFORM.ADMIN]
}

export const MAX_RETRY_LIMIT=5;
export const LOGIN_REACTIVE_TIME=2;


export const FORGET_PASSWORD_WITH = {
    LINK:{
        sms:false,
        email:true
    },
    EXPIRE_IN:10
}




