const asynchandler = require('../utils/asynchandler');

const reqisteruser = asynchandler( async (req,res)=>{
    res.status(200).json({
        message:"USER REGISTERED!",
    })
})

module.exports = reqisteruser;