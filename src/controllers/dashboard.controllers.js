const mongoose = require('mongoose');

const asynchandler = require("../utils/asynchandler");

const apierror = require("../utils/apierror");

const apiresponse = require("../utils/apiresponse");

const User = require("../models/user.models");

const Video = require("../models/videos.models");

const Like = require("../models/like.models");

const Subscription = require("../models/subscription.models");

const getchannelstats = asynchandler(async(req,res)=>{
    const {channelId} = req.params;

    if(!channelId){
        throw new apierror(400,"kindly provide me the channel id");
    }

    if(channelId.toString()!==req.user._id.toString()){
        throw new apierror(403,"you are not eligible to see the stats");
    }

    const subscriberscount = await Subscription.countDocuments({channel:channelId});

    const totalvideocount = await Video.countDocuments({owner:channelId});


    const totallikesonchannel = await Like.aggregate([
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"videosdata"
            }
        },{
            $unwind:"$videosdata"
        },
        {
            $match:{
                'videosdata.owner': new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $count:'likecount'
        }
    ]);

    const likecount = totallikesonchannel[0]?.likecount || 0;



    return res.status(200).json(
        new apiresponse(200,
            {subscriberscount,
            likecount,
            totallikesonchannel,
            totalvideocount,
        },
            "successfully fetched all the requirements"
        )
    );
});

const getchannelvideos = asynchandler(async(req,res)=>{
    const {channelId} = req.params;

    if(!channelId){
        throw new apierror(400,"channel id is required");
    }

     if(channelId.toString()!==req.user._id.toString()){
        throw new apierror(403,"you are not eligible to see the videos of the user");
    }

    const getallvideos = await Video.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(channelId),
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"allvideosdetails",
            }
        },
        {
            $unwind:"$allvideosdetails" 
        },
        {
            $project:{
                title:1,
                description:1,
                views:1,
                duration: 1,
                thumbnail: 1,
                createdAt: 1,
                owner: 1,
                "allvideosdetails.username": 1,
                "allvideosdetails.avatar": 1
            }
        }
    ]);

    if(getallvideos.length==0){
        return res.status(200).json(
            new apiresponse(200,[],"no videos uploaded by the user")
        )
    }

    return res.status(200).json(
        new apiresponse(200,getallvideos,"all the videos fetched successfully")
    )
});


module.exports = {getchannelvideos,getchannelstats};