const asynchandler = require('../utils/asynchandler');

const ApiError = require("../utils/apierror");

const user = require("../models/user.models");

const uploadoncloudinary = require("../utils/cloudinary");

const ApiResponse = require("../utils/apiresponse");

const reqisteruser = asynchandler( async (req,res)=>{
    const {fullname,email,username,password} = req.body;

    if(!fullname || fullname.trim()===""){
        throw new ApiError(400,"full name is required");
    }
    if(!email || email.trim()===""){
        throw new ApiError(400,"email is necessary");
    }
    if(!username || username.trim()===""){
        throw new ApiError(400,"username is required");
    }

    const findfullname = await user.findOne({fullname});
    const findemail = await user.findOne({email});
    const findusername = await user.findOne({username});
    if(findfullname){
        throw new ApiError(400,"user already exist");
    }
    if(findemail){
        throw new ApiError(400,"user already exist");
    }
    if(findusername){
        throw new ApiError(400,"user already exist");
    }

    const avatarlocalfilepath = req.files?.avatar[0].path; // this is path // to check the images and avatar

    const coverimagelocalpath = req.files?.coverimage[0].path;

    if(!avatarlocalfilepath){
        throw new ApiError(400,"avatar file is required");
    }

    const avatar = await uploadoncloudinary(avatarlocalfilepath);

    const coverimage = await uploadoncloudinary(coverimagelocalpath);

    if(!avatar){
        throw new ApiError(400,"avatar file is required"); 
    }

    const users = await user.create({
        fullname,
        email,
        avatar:avatar.url,
        coverimage:coverimage.url || "",
        password,
        username:username.toLowerCase(),
    })

    const createduser = await user.findById(users._id).select(
        "-password -refreshtoken"
    )

    if(!createduser){
        throw new ApiError(500,"something went wrong while regestering the user");
    }

    return res.status(201).json(
        new ApiResponse(200,createduser,"user registered successfully")
    )


})

module.exports = reqisteruser;