"use strict"
const path = require("path");
const jwt = require("jsonwebtoken");
const httpContext = require("express-http-context");

const chatModal = require("../modals/chat_modal");
const response = require("../utils/api_response").response;
const constantFilePath = require("../utils/constant_file_path").constantFilePath;

let dataSet = {};


module.exports.verifyUserToken = async (req, resp, next) => {
    try {
        if (!(req.headers.authorization)) {
            dataSet = response(422, "Authorization Code is Missing");
            resp.status(422).json(dataSet);
            return;
        }
        const access_token = req.headers.authorization;
        const validateToken = jwt.verify(req.headers.authorization, process.env.ACCESS_TOKEN_SALT);
        const fetchUserProfile = await chatModal.fetchUserProfileViaId(validateToken.user_id);
        if (fetchUserProfile.code === 500) {
            return resp.status(500).json(fetchUserProfile);
        }
        if (access_token !== fetchUserProfile.access_token) {
            dataSet = response(422, "Invalid Token", access_token);
            resp.status(422).json(dataSet);
            return;
        }
        httpContext.set("loginDetails", validateToken);
        next();
    } catch (e) {
        dataSet = response(422, "Something Went Wrong In Token", e.message);
        resp.status(422).json(dataSet);
    }
}


module.exports.insertRegisteration = async (req, resp) => {
    try {
        const checkAllReadyRegister = await chatModal.checkRegisterationExist(req.body.email);
        if (checkAllReadyRegister > 0) {
            dataSet = response(200, "All Ready Registered");
            return resp.status(200).json(dataSet);
        }
        let imageFilePath;
        if (req.files.user_profile_photo) {
            const fileExtension = path.extname(req.files.user_profile_photo.name).toLowerCase();
            if (fileExtension === ".jpg" || fileExtension === ".jpeg" || fileExtension === ".png") {
                const inputFile = req.files.user_profile_photo;
                const destFileName = Date.now() + `${fileExtension}`;
                imageFilePath = path.join("user_profile_photo", destFileName);
                const storeFilePath = path.join(constantFilePath, imageFilePath);
                await inputFile.mv(storeFilePath);
            }
        }
        const insertNewRegisteration = await chatModal.insertNewRegisteration(req.body, imageFilePath);
        if (insertNewRegisteration.code === 500) {
            return resp.status(422).json(insertNewRegisteration);
        }
        const token = jwt.sign({ user_id: insertNewRegisteration._id, email: insertNewRegisteration.email, full_name: insertNewRegisteration.full_name }, process.env.ACCESS_TOKEN_SALT);
        const updateToken = await chatModal.updateUserToken(insertNewRegisteration._id, token);
        if (updateToken.code === 500) {
            return resp.status(500).json(updateToken);
        }
        dataSet = response(200, "Inserted Successfully", { token: token, user_id: insertNewRegisteration._id });
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Something Went Wrong", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.userLogin = async (req, resp) => {
    try {
        const fetchLoginData = await chatModal.fetchUserProfile(req.body.email);
        if (fetchLoginData.code === 500) {
            return resp.status(500).json(fetchLoginData);
        }
        if (fetchLoginData.length <= 0) {
            dataSet = response(422, "Invalid Email", fetchLoginData);
            resp.status(422).json(dataSet);
        }
        if (fetchLoginData.password !== req.body.password) {
            dataSet = response(422, "Invalid Password");
            resp.status(422).json(dataSet);
        }
        if (fetchLoginData.password === req.body.password) {
            const token = jwt.sign({ user_id: fetchLoginData._id, email: fetchLoginData.email, full_name: fetchLoginData.full_name }, process.env.ACCESS_TOKEN_SALT);
            const updateToken = await chatModal.updateUserToken(fetchLoginData._id, token);
            if (updateToken.code === 500) {
                return resp.status(500).json(updateToken);
            }
            dataSet = response(200, "Login Successfully", { token: token, user_id: fetchLoginData._id });
            resp.status(200).json(dataSet);
        }
    } catch (e) {
        dataSet = response(422, "Something Went Wrong", e.message);
        resp.status(422).json(dataSet);
    }
}


module.exports.fetchUserProfile = async (req, resp) => {
    try {
        const fetchUserProfile = await chatModal.fetchUserProfileViaLoginDetails();
        if (fetchUserProfile.code === 500) {
            return resp.status(500).json(fetchUserProfile);
        }
        if (fetchUserProfile.profile_pic) {
            fetchUserProfile.profile_pic = process.env.IMAGE_FILE_PATH + "/" + fetchUserProfile.profile_pic;
        }
        dataSet = response(200, "User Profile", fetchUserProfile);
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Something Went Wrong", e.message);
        resp.status(422).json(dataSet);
    }
}


module.exports.particularUserSearch = async (req, resp) => {
    try {
        const fetchSearchList = await chatModal.fetchUserSearch(req.query);
        if (fetchSearchList.code === 500) {
            return resp.status(500).json();
        }
        for (let i = 0; i < fetchSearchList.length; i++) {
            fetchSearchList[i].profile_pic = process.env.IMAGE_FILE_PATH + "/" + fetchSearchList[i].profile_pic;
        }
        dataSet = response(200, "User Search List", fetchSearchList);
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Something Went Wrong", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.selectedChat = async (req, resp) => {
    try {
        const findParticularChat = await chatModal.fetchSelectedChat(req.body);
        if (findParticularChat?.code === 500) {
            return resp.status(500).json(findParticularChat);
        }
        if (findParticularChat) {
            dataSet = response(200, "Fetch Chat Sucess", findParticularChat);
            resp.status(200).json(dataSet);
        }
        if (!(findParticularChat)) {
            const createParticularChat = await chatModal.createNewChat(req.body);
            if (createParticularChat.code === 500) {
                return resp.status(500).json(createParticularChat);
            }
            dataSet = response(200, "Chat Created Success", createParticularChat);
            resp.status(200).json(dataSet);
        }
    } catch (e) {
        dataSet = response(422, "Something Went Wrong", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.allSelectedChatMessage = async (req, resp) => {
    try {
        const fetchSelectedChatMessage = await chatModal.fetchSelectedChatAllMessage(req.query);
        if (fetchSelectedChatMessage.code === 500) {
            return resp.status(500).json(fetchSelectedChatMessage);
        }
        dataSet = response(200, "All Message Listing", fetchSelectedChatMessage);
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Something Went Wrong", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.sendMessage = async (req, resp) => {
    try {
        const insertSenderMessage = await chatModal.insertSenderMessage(req.body);
        if (insertSenderMessage.code === 500) {
            return resp.status(500).json(insertSenderMessage);
        }
        const updateLastMessage = await chatModal.updateLastMessage(req.body.chat_id, insertSenderMessage);
        if (updateLastMessage.code === 500) {
            return resp.status(500).json(updateLastMessage);
        }
        const responseForSocketObject = {
            message: insertSenderMessage.message,
            users_id: updateLastMessage.users_id,
            chat_id: updateLastMessage._id,
            sender_id: insertSenderMessage.sender,
            received_message: {
                _id: insertSenderMessage._id,
                sender: insertSenderMessage.sender,
                message: insertSenderMessage.message,
                chat_id: insertSenderMessage.chat_id,
                added_by: insertSenderMessage.added_by,
                modified_by: insertSenderMessage.modified_by,
                is_active: true,
                added_date: insertSenderMessage.added_date,
                modified_date: insertSenderMessage.modified_date,
                __v: 0
            }
        }
        dataSet = response(200, "Inserted Sender Message Successfully", responseForSocketObject);
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Something Went Wrong", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.allUserChat = async (req, resp) => {
    try {
        const fetchAllUserChat = await chatModal.fetchAllUserChat(req.query);
        if (fetchAllUserChat.code === 500) {
            return resp.status(500).json(fetchAllUserChat);
        }
        dataSet = response(200, "All User Chat List", fetchAllUserChat);
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Something Went Wrong", e.message);
        resp.status(422).json(dataSet);
    }
}

