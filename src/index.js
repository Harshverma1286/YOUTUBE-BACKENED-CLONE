require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const app = express();

const {DB_NAME} = require('./constants');
const connectdb = require('./db');



connectdb().
then(()=>{
    app.on("error",(error)=>{
        console.log("error",error);
        throw error;
    })
    app.listen(process.env.PORT || 3000,function(){
        console.log(`The server is successfully working on ${process.env.PORT}`);
    })
}).catch((err)=>{
    console.log("ERROR : ",err);
})

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