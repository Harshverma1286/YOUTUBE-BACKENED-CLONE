const asynchandler = require('../utils/asynchandler');

const ApiError = require("../utils/apierror");

const user = require("../models/user.models");

const uploadoncloudinary = require("../utils/cloudinary");

const ApiResponse = require("../utils/apiresponse");

const jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');

const cloudinary = require('cloudinary').v2;

const getallvideos = asynchandler(async(req,res)=>{
      // i will do it later on
});

const publishavideo = asynchandler(async(req,res)=>{
    const{title,description} = req.body;

    if(!title){
        throw new ApiError(400,"title is required");
    }
    if(!description){
        throw new ApiError(400,"description is required");
    }

    const videofilepath = req.files?.videofile[0].path;

    const thumbnailfilepath = req.files?.thumbnail[0].path;

    if(!videofilepath){
        throw new ApiError(500,"something went wrong while uploading the video");
    }
    if(!thumbnailfilepath){
        throw new ApiError(500,"something went wrong while uplaoding thumbnail");
    }

    const video = await uploadoncloudinary(videofilepath);

    const thumbnail = await uploadoncloudinary(thumbnailfilepath);

    if(!video){
        throw new ApiError(500,"something went wrong while uploading the video");
    }
    if(!thumbnail){
        throw new ApiError(500,"something went wrong while uploading thumbnail");
    }

    return res.status(200).json(
            new ApiResponse(200, {
            videoUrl: video.secure_url,         
            thumbnailUrl: thumbnail.secure_url,
            title,
            description,
    }, "Video uploaded successfully")
);

})

module.exports = {publishavideo};
