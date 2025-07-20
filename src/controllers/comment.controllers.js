const asynchandler = require('../utils/asynchandler');

const apierror = require("../utils/apierror");

const apiresponse = require("../utils/apiresponse");

const Comment = require("../models/comment.models");

const Video = require("../models/videos.models");
const { default: mongoose } = require('mongoose');


const getallcomments = asynchandler(async(req,res)=>{
    const {videoId} = req.params;

    const {page =1 ,limit = 10}  = req.query;


    if(!videoId){
        throw new apierror(400,"video id does not recieved");
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new apierror(400,"video does not exist");
    }

    const comentcount = await Comment.countDocuments({video:videoId});

    const findallcomment =  await Comment.aggregate([
        {
            $match:{
                video:new mongoose.Types.ObjectId(videoId),
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",       
                foreignField: "_id",        
                as: "userinfo"
            }
        },
        {
            $unwind:"$userinfo"
        },
        {
            $skip:(parseInt(page)-1)*parseInt(limit),
        },
        {
            $limit:parseInt(limit),
        }
    ]);

    if(!findallcomment){
        throw new apierror(500,"something went wrong");
    }

    return res.status(200).json(
        new apiresponse(200,
            comentcount,
            findallcomment,
            "all the comments fetched successfully"
        )
    );

});

const addcomments = asynchandler(async(req,res)=>{
    const {videoId} = req.params;

    if(!videoId?.trim()){
        throw new apierror(400,"video id not recieved");
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new apierror(400,"video does not exist");
    }

    const {content} = req.body;

    if(!content?.trim()){
        throw new apierror(400,"kindly write something to upload it");
    }

    if(!req.user || !req.user._id){
        throw new apierror(401,"unauthorized user not logged in");
    }

    const comment = await Comment.create({
        content:content,
        video:video._id,
        owner:req.user._id,
    })

    return res.status(200).json(
        new apiresponse(200,comment,"your comment on the video is created successfully")
    )
});

const updatecomment = asynchandler(async(req,res)=>{
    const {commentid} = req.params;

    if(!commentid){
        throw new apierror(400,"comment id does not recieved");
    }

    const comment = await Comment.findById(commentid);

    if(!comment){
        throw new apierror(400,"comment does not exist");
    }

    if(comment.owner.toString()!==req.user._id.toString()){
        throw new apierror(402,"you are not allowed to change the comment");
    }

    const {content} = req.body;

    if(!content?.trim()){
        throw new apierror(400,"content does not recived");
    }

    const updatecomment = await Comment.findByIdAndUpdate(
        commentid,
        {
            $set:{
                content:content
            }
        },
        {new:true}
    );

    if(!updatecomment){
        throw new apierror(400,"something went wrong while updating comment");
    }

    return res.status(200).json(
        new apiresponse(200,updatecomment,"comment updated successfully")
    )

});

const deletecomment = asynchandler(async(req,res)=>{
    const {commentid} = req.params;

    if(!commentid){
        throw new apierror(400,"comment id does not found");
    }

    const comment = await Comment.findById(commentid);

    if(!comment){
        throw new apierror(400,"comment does not exist which you want to delete");
    }

    if(comment.owner.toString()!==req.user._id.toString()){
        throw new apierror(400,"sorry you cant do this");
    }

    await Comment.findByIdAndDelete(commentid);

    return res.status(200).json(
        new apiresponse(200,"comment deleted successfully")
    )
});




module.exports = {addcomments,updatecomment,deletecomment,getallcomments};

