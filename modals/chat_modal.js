"use strict"
require("../connections/mongodb");
const httpContext = require("express-http-context");
const response = require("../utils/api_response").response;
const dbSchema = require("../modals/dbSchema");


module.exports.updateUserToken = async (userId, token, resp) => {
    try {
        const filter = {
            _id: userId,
            is_active: true
        }
        const update = {
            access_token: token,
            modified_date: new Date()
        }
        const options = {
            new: true
        }
        const fetchQuery = await dbSchema.Users.findByIdAndUpdate(filter, update, options);
        return fetchQuery;
    } catch (e) {
        return response(500, "Error No. 8", e.message);
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

module.exports.insertNewRegisteration = async (req, userProfileImage, resp) => {
    try {
        const insertedObject = new dbSchema.Users({
            full_name: req.full_name,
            email: req.email,
            password: req.password,
            profile_pic: userProfileImage
        })
        const insertQuery = await insertedObject.save();
        return insertQuery;
    } catch (e) {
        return response(500, "Error No. 1", e.message);
    }
}

module.exports.fetchUserProfileViaLoginDetails = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            _id: loginDetails.user_id,
            is_active: true
        }
        const fetchQuery = await dbSchema.Users.findById(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error No. 234", e.message);
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

module.exports.fetchSelectedChat = async (req, resp) => {
    try {
        const filter = {
            $and: [
                { users_id: { $elemMatch: { $eq: req.sender_id } } },
                { users_id: { $elemMatch: { $eq: req.reciever_id } } },
            ],
            // $and: [
            //     {users_id : req.sender_id},
            //     {users_id : req.reciever_id},
            // ],
            is_active: true
        }
        const fetchQuery = await dbSchema.Chat.findOne(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error NO. 345", e.message);
    }
}

module.exports.createNewChat = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        console.log("loginDetails", loginDetails);
        const insertedObject = new dbSchema.Chat({
            chat_name: "Sender",
            users_id: [req.sender_id, req.reciever_id],
            added_by: loginDetails.user_id,
            modified_by: loginDetails.user_id
        })
        const insertQuery = await insertedObject.save();
        return insertQuery;
    } catch (e) {
        return response(500, "Error No. 345", e.message);
    }
}


module.exports.fetchSelectedChatAllMessage = async (req, resp) => {
    try {
        const filter = {
            chat_id: req.chat_id,
            is_active: true
        }
        const fetchQuery = await dbSchema.Messages.find(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, 'Error No. 345', e.message);
    }
}

module.exports.insertSenderMessage = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const insertedObject = new dbSchema.Messages({
            sender: loginDetails.user_id,
            message: req.message,
            chat_id: req.chat_id,
            added_by: loginDetails.user_id,
            modified_by: loginDetails.user_id,
        })
        const insertQuery = await insertedObject.save();
        return insertQuery;
    } catch (e) {
        return response(500, "Error In 3Q456", e.message);
    }
}

module.exports.updateLastMessage = async (chatId, insertedMessage, resp) => {
    try {
        console.log("req.",insertedMessage);
        const loginDetails = httpContext.get("loginDetails");
        console.log("loginDetails",loginDetails);
        const filter = {
            _id: chatId
        }
        const update = {
            last_message_id: insertedMessage._id,
            modified_by : loginDetails.user_id,
            modified_date : new Date()
        }
        const options = {
            new: true
        }
        console.log("filter",filter,update,options);
        const updateQuery = await dbSchema.Chat.findByIdAndUpdate(filter, update, options);
        return updateQuery;
    } catch (e) {
        return response(500, "Error In Modal 45678", e.message);
    }
}

module.exports.fetchAllUserChat = async (req,resp) => {
    try{
        const filter = {
            $or: [
                { users_id: { $elemMatch: { $eq: req.sender_id } } },
                { users_id: { $elemMatch: { $eq: req.reciever_id } } },
            ],
            is_active: true
        }
        const fetchQuery = await dbSchema.Chat.find(filter).populate({path: "users_id",modal: "Users",select:"full_name email profile_pic"}).populate("last_message_id","sender message");
        console.log("fetchQuery",fetchQuery);
        return fetchQuery;
    }catch(e){
        return response(500,"Error In Modal. 435",e.message);
    }
}