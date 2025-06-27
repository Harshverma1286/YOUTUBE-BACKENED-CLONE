const asynchandler = require('../utils/asynchandler');

const reqisteruser = asynchandler( async (req,res)=>{
    return res.status(200).json({
        message:"everything is working great"
    })
})

module.exports = reqisteruser;