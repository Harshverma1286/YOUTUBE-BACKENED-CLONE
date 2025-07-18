const asynchandler = require('../utils/asynchandler');

const ApiError = require("../utils/apierror");

const user = require("../models/user.models");

const {uploadoncloudinary,deletefromcloudinary} = require("../utils/cloudinary");

const ApiResponse = require("../utils/apiresponse");

const { default: mongoose } = require('mongoose');

const cloudinary = require('cloudinary').v2;

const Video = require("../models/videos.models");
const { urlencoded } = require('express');



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
      const {page = 1,limit = 10,sortBy,sortType,userId} = req.params;

      if(!userId){
        throw new ApiError(400,"user id is required");
      }


      const videos = await Video.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId),
            }
        },
        {
           $lookup: {
                from: "users",
                localField: "owner",       
                foreignField: "_id",        
                as: "ownerdetails"
            }
        },
        {
            $unwind:"$ownerdetails"
        },
        {
            $sort:{
                [sortBy]:sortType==="asc" ? 1 : -1
            }
        },
        {
            $skip:(parseInt(page)-1)*parseInt(limit),
        },
        {
            $limit:parseInt(limit),
        }
      ]);

       res.status(200).json(new ApiResponse(200,videos, "video fetched successfully"));
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

    const newVideo = await Video.create({
        videofile: video.secure_url,
        thumbnail: thumbnail.secure_url,
        title,
        description,
        duration: video.duration || 0, // optional i will do it later on have to deal with cloudinary duration to do later
        owner: req.user._id,
        ispublished:true,
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

    if(!video || video.ispublished === false){
        throw new ApiError(400,"video not found or video does not exist");
    }

    return res.status(200).json(new ApiResponse(200,video,"video fetched successfully"));
});

const updateavideo = asynchandler(async(req,res)=>{
    const {videoid} = req.params;

    if(!videoid){
        throw new ApiError(400,"the video not recived that user wants to update");
    }

    const video = await Video.findById(videoid);

    if(!video){
        throw new ApiError(403,"video not found or video does not exist");
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

const deleteavideo = asynchandler(async(req,res)=>{
    const {videoid} = req.params;

    if(!videoid){
        throw new ApiError(400,"videoid does not got");
    }

    const video = await Video.findById(videoid);

    if(!video){
        throw new ApiError(400,"video does not exist which u want to delete");
    }

    if(req.user._id.toString()!==video.owner.toString()){
        throw new ApiError(403, "You are not authorized to delete this video");
    }

    // const videoPublicId = getPublicIdFromUrl(video.videoUrl);
    // await deletefromcloudinary(videoPublicId, "video");

    // if(video.thumbnail){
    //     const thumbnailPublicId = getPublicIdFromUrl(video.thumbnail);
    //     await deletefromcloudinary(thumbnailPublicId, "image");
    // }

    // await Video.findByIdAndDelete(videoPublicId); this is the optional way 

    // best way is 

    await Video.findByIdAndUpdate(videoid, { ispublished: false });

    return res.status(200).json(
        new ApiResponse(200,"video deleted successfully")
    )

});

const togglepublishstatus = asynchandler(async(req,res)=>{
    const {videoid} = req.params;

    if(!videoid){
        throw new ApiError(400,"video id does not recieved");
    }


    const video = await  Video.findById(videoid);

    if(!video){
        throw new ApiError(400,"video does not exist");
    }


    if(req.user._id.toString()!==video.owner.toString()){
        throw new ApiError(400,"permisiion denied to delete a video");
    }

    video.ispublished = !video.ispublished;

    await  video.save();

    return res.status(200).json(new ApiResponse(200,"video toggled successfully"))
})


module.exports = {publishavideo,getvideobyid,updateavideo,deleteavideo,togglepublishstatus,getallvideos};
