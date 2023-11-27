"use strict"

//standard response for all APIs

module.exports.response = (code,msg,data) => {
    return {code : code, message : msg, data: data};
} 
