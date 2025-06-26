const asynchandler = require('../utils/asynchandler');

const reqisteruser = asynchandler( async (req,res)=>{

    const{username,email,password,fullname} = req.body;
})

module.exports = reqisteruser;