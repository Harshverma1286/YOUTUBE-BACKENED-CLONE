const mongoose = require("mongoose");
const { DB_NAME } = require("../constants");

const connectdb = async()=>{
    try{
        const moongoseconnection = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`\n MONGODB SUCCESSFULLY CONNECTED!! DB HOST : ${moongoseconnection.connection.host}`);
    }catch(err){
        console.log("MONGODB CONNECTION ERROR :",err);
        process.exit(1);
    }
}

module.exports = connectdb;