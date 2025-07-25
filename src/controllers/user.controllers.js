const asynchandler = require('../utils/asynchandler');

const ApiError = require("../utils/apierror");

const user = require("../models/user.models");

const {uploadoncloudinary,deletefromcloudinary} = require("../utils/cloudinary");

const ApiResponse = require("../utils/apiresponse");

const jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');

const cloudinary = require('cloudinary').v2;

const getPublicIdFromUrl = (url) => {
    try {
        const parts = url.split("/");

        const fileWithExt = parts[parts.length - 1];

        const fileName = fileWithExt.split(".")[0];

        const folder = parts[parts.length - 2];

        return `${folder}/${fileName}`;
    } catch (error) {
        console.error("Failed to extract public_id from URL:", error);
        return null;
    }
};

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
            $unset:{
                refreshtoken:1
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

const refreshacesstoken = asynchandler(async(req,res)=>{
    console.log("Request body is:", req.body);
    const incomingrefreshtoken = req.cookies.refreshtoken || req.body.refreshtoken;

    if(!incomingrefreshtoken){
        throw new ApiError(401,"unauthorized request");
    }

    try {
        const decodedtoken = jwt.verify(incomingrefreshtoken,process.env.REFRESH_TOKEN_SECRET);

        const users = await user.findById(decodedtoken?._id);

        if(!users){
            throw new ApiError(401,"invalid refresh token");
        }

        if(incomingrefreshtoken!==users?.refreshtoken){
            throw new ApiError(401,"refresh token is expired or used");
        }

        const {accesstoken,newrefreshtoken} = await generateaccessandrefereshtokens(users._id);

        const options = {
            httpOnly: true,
            secure:true
        }

        return res.status(200).
        cookie("accesstoken",accesstoken,options).
        cookie("refreshtoken",newrefreshtoken,options).
        json(
            new ApiResponse(
                200,
                {accesstoken,refreshtoken:newrefreshtoken},
                "access token refreshed",
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "invalid refresh token")
    }
})

const changecurrentpassword = asynchandler(async(req,res)=>{
    const {currentpassword,newpassword} = req.body;

    if(!currentpassword || !newpassword){
        throw new ApiError(400,"havent gotten the password from frontened");
    }

    const users = await user.findById(req.user?._id);

    const passwordcheck = await users.isPasswordCorrect(currentpassword);

    if(!passwordcheck){
        throw new ApiError(400,"invalid user password");
    }

    users.password = newpassword;

    await users.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200,{},"password changed successfully"));
});


const getcurrentuser = asynchandler(async(req,res)=>{
    return res.status(200)
    .json(new ApiResponse(200,req.user,"user fetched successfully"));
})

const updateaccountdetails = asynchandler(async(req,res)=>{
    const{fullname,email} = req.body;

    if(!fullname || !email){
        throw new ApiError(400,"user details not recieved");
    }
    console.log(req.user);

    const users = await user.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname,
                email:email,
            }
        },
        {new:true},
    ).select("-password")

    
    if (!users) {
        throw new ApiError(404, "User not found or not updated");
    }

    return res.status(200).json(
       new ApiResponse( 200,
        users,
        "user details updated successfully")
    )
});


const updateavatarorfiles = asynchandler(async(req,res)=>{
    const avatarlocalpath = req.file?.path;

    if(!avatarlocalpath){
        throw new ApiError(400,"avatat file is missing");
    }


    const avatar = await uploadoncloudinary(avatarlocalpath);

    if(!avatar.url){
        throw new ApiError(400,"error while uploading avatar");
    }

    const currentUser = await user.findById(req.user._id);
    const oldAvatarUrl = currentUser.avatar;

    const users = await user.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                avatar:avatar.url,
            }
        },
        {new:true}
    ).select("-password");

    if(oldAvatarUrl){
        const publicId = getPublicIdFromUrl(oldAvatarUrl);
        await deletefromcloudinary(publicId);
    }

    return res.status(200).json(
        new ApiResponse(200,
        users,
        "avatar is successfully uploaded")
    );
})

const updatecoverimageorfiles = asynchandler(async(req,res)=>{
    const coverimagelocalpath = req.file?.path;
    if(!coverimagelocalpath){
        throw new ApiError(400,"cover image file is missing");
    }

    const coverimage = await uploadoncloudinary(coverimagelocalpath);

    if(!coverimage.url){
        throw new ApiError(400,"error while uploading cover image");
    }

    const currentUser = await user.findById(req.user._id);
    const oldAvatarUrl = currentUser.avatar;

    const users = await user.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                coverimage:coverimage.url,
            }
        },
        {
            new:true,
        }
    ).select("-password");

    if(oldAvatarUrl){
        const publicId = getPublicIdFromUrl(oldAvatarUrl);
        await deletefromcloudinary(publicId);
    }


    return res.status(200).json(
        new ApiResponse(200,users,"cover image updated successfully")
    );
})

const getuserchannelprofile = asynchandler(async(req,res)=>{
    const {username} = req.params;

    if(!username?.trim()){
        throw new ApiError(400,"username is missing");
    }


    const channel = await user.aggregate([{
        $match:{
            username:username?.toLowerCase(),
        }
    },
    {
        $lookup:{
            from:"subscription",
            localField:"_id",//here it means i am finding based on the channels example how much subscriber does chai aur code channel has it means this 
            foreignField:"channel",
            as:"subscribersofthefollowingchannel"
        }
    },
    {
        $lookup:{
            from:"subscription",
            localField:"_id",
            foreignField:"subscriber",
            as:"subscribedto" // here it means the following channel i have subscribed to example how much channel example harsh has subscribed to 
        }
    },
    {
        $addFields:{
            subscribercount:{
                $size:"$subscribersofthefollowingchannel"
            },
            subscribedtocount:{
                $size:"$subscribedto"
            },
            issubscribed:{
                $cond:{
                    if:{$in:[req.user?._id,"$subscribersofthefollowingchannel.subscriber"]},
                    then:true,
                    else:false
                }
            }
        }
    },
    {
        $project:{
            fullname:1,
            username:1,
            subscribersofthefollowingchannel:1,
            subscribedto:1,
            subscribercount:1,
            subscribedtocount:1,
            issubscribed:1,
            avatar:1,
            coverimage:1,
            email:1

        }
    }
    ]);

    if(!channel?.length){
        throw new ApiError(404,"channel not found")
    }

    return res.status(200).json(
        new ApiResponse(200,channel[0],"user channel fetched successfully")
    )
})



const getuserwatchhistory = asynchandler(async(req,res)=>{
    const users = await user.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id),
            }
        },
        {
            $lookup:{
                from:"video",
                localField:"watchhistory",
                foreignField:"_id",
                as:"watch_history",
                pipeline:[
                    {
                        $lookup:{
                            from:"user",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200,users[0].watchhistory,"watch history fetched successfully")
    )
})





module.exports = {registeruser,loginuser,logoutuser,refreshacesstoken,changecurrentpassword,getcurrentuser,updateaccountdetails,updateavatarorfiles,updatecoverimageorfiles,getuserchannelprofile,getuserwatchhistory};