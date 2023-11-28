"use strict"
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const httpContext = require("express-http-context");
const fileUpload = require("express-fileupload");
// require("dotenv").config({path: path.join(__dirname,"environment",".env.development")});

const chatController = require("./controllers/chat_controller");

const app = express();
app.use(bodyParser.json());
app.use(fileUpload());
app.use(httpContext.middleware);
const publicFolderPath = path.join(__dirname, "assests");
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


app.post("/api/user/registeration", chatController.insertRegisteration);
app.post("/api/user/login", chatController.userLogin);
app.get("/api/user/profile", chatController.verifyUserToken, chatController.fetchUserProfile);
app.get("/api/user/search", chatController.verifyUserToken, chatController.particularUserSearch);
app.get("/api/user/selected-chat", chatController.verifyUserToken, chatController.selectedChat);


//here this is used when we want to confirm backend server is running or not via browser.
app.get("/", (req, resp) => {
    resp.status(200).send("Welcome to Corewave Chat Backend APIs");
});




const port = process.env.PORT || 2000;
var server = app.listen(port, () => {
    console.log(`Server Started : Listen on : ${port}`)
})




const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
        // origin: "http://localhost:3001",
        origin: "*",
        // credentials: true,
    },
});

io.on("connection", (socket) => {
    console.log("Connected to socket.io");
    socket.on("setup", (userData) => {
        console.log("user_Data", userData);
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User Joined Room: " + room);
    });
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageRecieved) => {
        var chat = newMessageRecieved.chat;

        if (!chat.users) return console.log("chat.users not defined");

        chat.users.forEach((user) => {
            if (user._id == newMessageRecieved.sender._id) return;

            socket.in(user._id).emit("message recieved", newMessageRecieved);
        });
    });

    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    });
});