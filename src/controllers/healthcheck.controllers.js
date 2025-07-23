const mongoose = require('mongoose');

const asynchandler = require("../utils/asynchandler");

const apierror = require("../utils/apierror");

const apiresponse = require("../utils/apiresponse");

const healthcheck = asynchandler(async(req,res)=>{
    return res.status(200).json(
        new apiresponse(200,"everything is working fine")
    )
});




module.exports = {healthcheck};