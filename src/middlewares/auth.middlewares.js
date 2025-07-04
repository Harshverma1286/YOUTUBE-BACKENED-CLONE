const asynchandler = require("../utils/asynchandler");

const user = require("../models/user.models");

const jwt = require('jsonwebtoken');
const ApiError = require("../utils/apierror");

const verifyjwt = asynchandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ","");

        

        console.log("Received Token (raw):", token);
        console.log("Type of token:", typeof token);


        console.log("Received Token:", token);
        if (!token || typeof token !== "string") {
            throw new ApiError(401, "Access token missing or invalid");
        }

        console.log("Received Token:", token);
        const decodedtoken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);

        const actualuser = await user.findById(decodedtoken?._id).select(
            "-password -refreshtoken"
        );

        if(!actualuser){
            throw new ApiError(401,"invalid access token");
        }

        req.user = actualuser;
        next();

    } catch (error) {
        throw new ApiError(401,error?.message || "invalid access token");
    }
})

module.exports = verifyjwt;