"use strict"
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const httpContext = require("express-http-context");
const fileUpload = require("express-fileupload");
require("dotenv").config({path: path.join(__dirname,"environment",".env.development")});

const chatController = require("./controllers/chat_controller");

const app = express();
app.use(bodyParser.json());
app.use(fileUpload());
app.use(httpContext.middleware);
const publicFolderPath = path.join(__dirname,"assests");
app.use(express.static(publicFolderPath));



// console.log("process")
// require("dotenv").config();

//Enable CORS for HTTP methods
app.use((req, resp, next) => {
    resp.header("Access-Control-Allow-Origin", "*",);
    resp.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    resp.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,Authorization,Content-Type,Accept");
    next();
});


app.post("/api/user/registeration",chatController.insertRegisteration);
app.post("/api/user/login",chatController.userLogin);
app.get("/api/user/profile",chatController.verifyUserToken,chatController.fetchUserProfile);
app.get("/api/user/search",chatController.verifyUserToken,chatController.particularUserSearch);


//here this is used when we want to confirm backend server is running or not via browser.
app.get("/", (req, resp) => {
    resp.status(200).send("Welcome to Corewave Chat Backend APIs");
});




const port = process.env.PORT || 2000;
var server = app.listen(port, () => {
    console.log(`Server Started : Listen on : ${port}`)
})