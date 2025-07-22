const mongoose = require("mongoose");

const asynchandler = require("../utils/asynchandler");

const apierror = require("../utils/apierror");

const apiresponse = require("../utils/apiresponse");

const User = require("../models/user.models");

const Video = require("../models/videos.models");
const Like =  require("../models/like.models");

const Tweet = require("../models/tweet.models");
const Comment = require("../models/comment.models");

const togglevideolike  = asynchandler(async(req,res)=>{
    const {VideoId} = req.params;

    if(!VideoId){
        throw new apierror(400,"kindly provide me the videoid");
    }

    const video = await Video.findById(VideoId);

    if(!video){
        throw new apierror(400,"video does not exist");
    }

    const existinglike = await Like.findOne({
        video:VideoId,
        likedby:req.user._id,
    });

    if(existinglike){
        await existinglike.deleteOne(); // so this is used because we have already search before in the database but now we do not need to again perform search from the entire database so this is used 

        return res.status(200).json(
            new apiresponse(200,"video like removed successfully")
        )
    }
    else{
        const like = await Like.create({
            video:VideoId,
            likedby:req.user._id
        })

        if(!like){
            throw new apierror(500,"something went wrong");
        }

        return res.status(200).json(
            new apiresponse(200,like,"video liked successfully")
        )
    }

});

const togglecommentlike = asynchandler(async(req,res)=>{
    const {CommentId} = req.params;

    if(!CommentId){
        throw new apierror(400,"kindly provide me the comment id");
    }

    const comment = await Comment.findById(CommentId);

    if(!comment){
        throw new apierror(404,"comment does not exist");
    }

    const existingcommentlike = await Like.findOne({
        comment:CommentId,
        likedby:req.user._id,
    });

    if(existingcommentlike){
        await existingcommentlike.deleteOne();

        res.status(200).json(
            new apiresponse(200,"like removed from the comment successfully")
        )
    }
    else{
        const commentlike = await Like.create({
            comment:CommentId,
            likedby:req.user._id,
        });

        if(!commentlike){
            throw new apierror(500,"something went wrong");
        }

        return res.status(200).json(
            new apiresponse(200,commentlike,"comment liked successfully")
        )
    }
});

const togletweetlike = asynchandler(async(req,res)=>{
    const {TweetId} = req.params;

    if(!TweetId){
        throw new apierror(400,"kindly provide me the tweet id");
    }

    const tweet = await Tweet.findById(TweetId);

    if(!tweet){
        throw new apierror(403,"tweet does not found");
    }

    const checktweetlike = await Like.findOne({
        tweet:TweetId,
        likedby:req.user._id,
    });

    if(checktweetlike){
        await checktweetlike.deleteOne();

        return res.status(200).json(
            new apiresponse(200,"like removed from tweet successfully")
        )
    }
    else{
        const tweetlike = await Like.create({
            tweet:TweetId,
            likedby:req.user._id,
        })

        if(!tweetlike){
            throw new apierror(500,"something went wrong");
        }

        return res.status(200).json(
            new apiresponse(200,tweetlike,"tweet liked successfully")
        )
    }

});

const getlikedvideos = asynchandler(async(req,res)=>{
    
})



module.exports = {togglevideolike,togglecommentlike,togletweetlike,getlikedvideos};