const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const newUser = new Schema({
    full_name : {type: String, required: true},
    email : {type: String, required: true},
    password: {type: String, required: true},
    profile_pic: {type: String, required: true},
    access_token: {type: String, required: false},
    added_date : {type: Date, required: true, default:()=> new Date()},
    modified_date : {type: Date, required: true, default: () => new Date()},
    is_active : {type: Boolean, required: true, default: true}
})
const Users = mongoose.model("Users",newUser);

const chatBox = new Schema({
    chat_name : {type: String, required: true},
    users_id:[{type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
    last_message_id : {type: mongoose.Schema.Types.ObjectId, ref: "Messages"},
    added_by : {type: mongoose.Schema.Types.ObjectId, required: true},
    modified_by: {type: mongoose.Schema.Types.ObjectId, required: true},
    added_date : {type: Date, required: true, default : () => new Date()},
    modified_date : {type: Date, required: true, default: () => new Date()},
    is_active: {type: Boolean, required: true, default: ()=> new Date()}
})
const Chat = mongoose.model("Chat",chatBox);

const chatMessages = new Schema({
    sender: {type: mongoose.Types.ObjectId, ref: "Users"},
    message: {type: String, trim: true, required: true},
    chat_id : {type: mongoose.Schema.Types.ObjectId, required: true, ref: "Chat"},
    added_by : {type: mongoose.Schema.Types.ObjectId, required: true},
    modified_by: {type: mongoose.Schema.Types.ObjectId, required: true},
    added_date : {type: Date, required: true, default : () => new Date()},
    modified_date : {type: Date, required: true, default: () => new Date()},
    is_active: {type: Boolean, required: true, default: ()=> new Date()}
})
const Messages = mongoose.model("Messages",chatMessages);

module.exports = {
    Users: Users,
    Chat: Chat,
    Messages: Messages
}