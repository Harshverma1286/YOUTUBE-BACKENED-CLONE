const asynchandler = require('../utils/asynchandler');

const apierror = require("../utils/apierror");

const apiresponse = require("../utils/apiresponse");

const Comments = require("../models/comment.models");

const Video = require("../models/videos.models");



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

    const comment = await Comments.create({
        content:content,
        video:video._id,
        owner:req.user._id,
    })

    return res.status(200).json(
        new apiresponse(200,comment,"your comment on the video is created successfully")
    )
});


module.exports = {addcomments};

