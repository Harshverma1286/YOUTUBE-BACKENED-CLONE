require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const app = express();

const {DB_NAME} = require('./constants');
const connectdb = require('./db');



connectdb();

// ( async ()=>{
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
//         app.on("error :",(error)=>{
//             console.log("error",error);
//             throw error
//         })

//         app.listen(process.env.PORT,function(){
//             console.log(`CONNECTION SUCCESFULLY ESTABLISHED ON THE PORT ${process.env.PORT}`);
//         })
//     }catch(err){
//         console.log("error :",err);

//     }
// })();