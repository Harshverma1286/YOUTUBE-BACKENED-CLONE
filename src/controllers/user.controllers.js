const asynchandler = require('../utils/asynchandler');

const ApiError = require("../utils/apierror");

const user = require("../models/user.models");

const uploadoncloudinary = require("../utils/cloudinary");

const ApiResponse = require("../utils/apiresponse");

const generateaccessandrefereshtokens = async(userid)=>{
    try {
        const users = await user.findById(userid);
        const accesstoken = await users.generateAccessToken();
        const refreshtoken = await users.generateRefreshToken();


        users.refreshtoken = refreshtoken;
        await users.save({ validateBeforeSave: false });
        return {accesstoken,refreshtoken};

    } catch (error) {
        throw new ApiError(500,"something went wrong while generating access and refresh token");
    }
}
const registeruser = asynchandler( async (req,res)=>{
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

    console.log(req.files);

    const avatarlocalfilepath = req.files?.avatar[0].path; // this is path // to check the images and avatar

    const coverimagelocalpath = req.files?.coverimage[0].path;

    if(!avatarlocalfilepath){
        throw new ApiError(400,"avatar file is required");
    }

    const avatar = await uploadoncloudinary(avatarlocalfilepath);

    const coverimage = await uploadoncloudinary(coverimagelocalpath);

    console.log("Cloudinary avatar response:", avatar);

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

const loginuser = asynchandler( async(req,res)=>{
    const{email,username,password} = req.body;

    if(!username && !email){
        throw new ApiError(400,"username or email required");
    }

    const users = await user.findOne({
        $or:[{username},{email}]
    })// this is done to use either email or username

    if(!users){
        throw new ApiError(401,"user does not exist kindly register first!");
    }

    const check = await users.isPasswordCorrect(password);

    if(!check){
        throw new ApiError(400,"password is incorrect kindly enter the correct password");
    }

    const {accesstoken,refreshtoken} = await generateaccessandrefereshtokens(users._id);



    const loggedinuser = await user.findById(users._id).select(
        "-password -refreshtoken"
    )


    const options = {
        httpOnly: true,
        secure:true
    }

    return res.status(200).
    cookie("accesstoken",accesstoken,options).
    cookie("refereshtoken",refreshtoken,options). 
    json(
        new ApiResponse(200,
            {
                users:loggedinuser,accesstoken,refreshtoken
            },
            "user loggedin successfully",
        )
    )
})

const logoutuser = asynchandler( async(req,res)=>{
    await user.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshtoken:undefined
            }
        },
        {
            new:true   
        }
    )

    const options = {
        httpOnly: true,
        secure:true
    }


    return res.status(200).
    clearCookie("accesstoken", options).
    clearCookie("refreshtoken", options).
    json(new ApiResponse(200,{},"user logged out successfully"))
})

module.exports = {registeruser,loginuser,logoutuser};