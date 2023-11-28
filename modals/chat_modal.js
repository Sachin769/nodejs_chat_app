"use strict"
require("../connections/mongodb");
const httpContext = require("express-http-context");
const response = require("../utils/api_response").response;
const dbSchema = require("../modals/dbSchema");


module.exports.updateUserToken = async (userId,token,resp) => {
    try{
        const filter = {
            _id : userId,
            is_active : true
        }
        const update = {
            access_token : token,
            modified_date : new Date()
        }
        const options = {
            new : true
        }
        const fetchQuery = await dbSchema.Users.findByIdAndUpdate(filter,update,options);
        return fetchQuery;
    }catch(e){
        return response(500,"Error No. 8",e.message);
    }
}

module.exports.checkRegisterationExist = async (requestedEmail, resp) => {
    try {
        const filter = {
            email: requestedEmail,
            is_active: true
        }
        const fetchQuery = await dbSchema.Users.countDocuments(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error No. 2", e.message);
    }
}

module.exports.fetchUserProfile = async (requestedEmail, resp) => {
    try {
        const filter = {
            email: requestedEmail,
            is_active: true
        }
        const fetchQuery = await dbSchema.Users.findOne(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error No. 3", e.message);
    }
}

module.exports.fetchUserProfileViaId = async (userId, resp) => {
    try {
        const filter = {
            _id: userId,
            is_active: true
        }
        const fetchQuery = await dbSchema.Users.findById(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error No. 4", e.message);
    }
}

module.exports.insertNewRegisteration = async (req,userProfileImage, resp) => {
    try {
        const insertedObject = new dbSchema.Users({
            full_name : req.full_name,
            email : req.email,
            password : req.password,
            profile_pic : userProfileImage
        })
        const insertQuery = await insertedObject.save();
        return insertQuery;
    } catch (e) {
        return response(500, "Error No. 1", e.message);
    }
}

module.exports.fetchUserProfileViaLoginDetails = async (req,resp) => {
    try{
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            _id : loginDetails.user_id,
            is_active : true
        }
        const fetchQuery = await dbSchema.Users.findById(filter).lean();
        return fetchQuery;
    }catch(e){
        return response(500,"Error No. 234",e.message);
    }
}

module.exports.fetchUserSearch = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            $or: [
                { full_name: { $regex: req.search_data, $options: "i" } },
                { email: { $regex: req.search_data, $options: "i" } }
            ],
            is_active: true
        }
        const fetchQuery = await dbSchema.Users.find(filter).find({ _id: { $ne: loginDetails.user_id } }).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error No. 5", e.message);
    }
}