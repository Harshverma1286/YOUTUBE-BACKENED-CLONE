const asynchandler = require('../utils/asynchandler');

const ApiError = require("../utils/apierror");

const user = require("../models/user.models");

const uploadoncloudinary = require("../utils/cloudinary");

const ApiResponse = require("../utils/apiresponse");

const jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');

const cloudinary = require('cloudinary').v2;

const Video = require("../models/videos.models");
const { urlencoded } = require('express');

const deletefromcloudinary = async(userid) =>{
    if(!userid){
        throw new ApiError(400,"id has not been recived");
    }

    try {
        const deletetheimage = await cloudinary.uploader.destroy(userid);
        return deletetheimage;
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        throw new ApiError(500, "Cloudinary deletion failed");
    }
}

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

const getallvideos = asynchandler(async(req,res)=>{
      // i will do it later on
});

const publishavideo = asynchandler(async(req,res)=>{
    const{title,description,visibility} = req.body;

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

    let finalVisibility;

    if (visibility === "public") {
        finalVisibility = "public";
    } else if (visibility === "private") {
        finalVisibility = "private";
    } else if (visibility === "unlisted") {
        finalVisibility = "unlisted";
    } else {
        finalVisibility = "public"; 
    }

    const newVideo = await Video.create({
        videofile: video.secure_url,
        thumbnail: thumbnail.secure_url,
        title,
        description,
        visibility: finalVisibility,
        duration: video.duration || 0, // optional i will do it later on have to deal with cloudinary duration to do later
        owner: req.user._id
    });

    return res.status(200).json(
            new ApiResponse(200, newVideo, "Video uploaded successfully")
    );
});

const getvideobyid = asynchandler(async(req,res)=>{
    const {videoid} = req.params;

    if(!videoid?.trim()){
        throw new ApiError(400,"cant get from the url");
    }

    const video = await Video.findById(videoid);

    if(!video){
        throw new ApiError(400,"video not found or video does not exist");
    }

    const useracessing = req.user._id;

    if(video.visibility=="public" || video.visibility=="unlisted"){
        return res.status(200).json(
            new ApiResponse(200,video,"video fetched successfully")
        )
    }
    if(video.visibility=="private"){
        if(video.owner.toString()===useracessing.toString()){
             return res.status(200).json(
                 new ApiResponse(200,video,"video fetched successfully")
            )
        }
        else{
            throw new ApiError(403,"video accessed denied");
        }
    }
});

const updateavideo = asynchandler(async(req,res)=>{
    const {videoid} = req.params;

    if(!videoid){
        throw new ApiError(400,"the video not recived that user wants to update");
    }

    const video = await Video.findById(videoid);

    if(!video){
        throw new ApiError(403,"video nott found or video does not exist");
    }

    const usernow = req.user._id;

    if(video.owner.toString()!==usernow.toString()){
        throw new ApiError(400,"you are not eligible to update a video");
    }

    const {title,description} = req.body;

    if(!title?.trim()){
        throw new ApiError(400,"title not given");
    }
    if(!description?.trim()){
        throw new ApiError(400,"description not recieved yet");
    }

    const thumbnailfilepath = req.file?.path;

    if(!thumbnailfilepath){
        throw new ApiError(400,"thumbnail is missing");
    }

    const thumbnail = await uploadoncloudinary(thumbnailfilepath);

    if(!thumbnail?.url){
        throw new ApiError(500,"thumbnail cannot be uploaded on cloudinary");
    }

    const oldthumbnail = video.thumbnail;

    if(oldthumbnail){
        const publicId = getPublicIdFromUrl(oldthumbnail);
        await deletefromcloudinary(publicId);
    }

    const updated = await Video.findByIdAndUpdate(
        videoid,
        {
            $set:{
                title:title,
                description:description,
                thumbnail:thumbnail.url,
            }
        },
        {new:true}
    );

    return res.status(200).json(
        new ApiResponse(200,updated,"video updated successfully")
    )

})





module.exports = {publishavideo,getvideobyid,updateavideo};
