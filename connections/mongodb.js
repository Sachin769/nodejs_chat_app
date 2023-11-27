//connection with mongoDB
"use strict"
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL).then((response)=>{
    console.log("*** New Connection Established with MongoDB ***");
}).catch((error)=>{
    console.log("Not Connected Error :",error.message);
});
module.exports.connection = mongoose.connection; 