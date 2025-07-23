const mongoose = require("mongoose");

const asynchandler = require("../utils/asynchandler");

const apierror = require("../utils/apierror");

const apiresponse = require("../utils/apiresponse")

const Tweet = require("../models/tweet.models");

const User = require("../models/user.models");
const { json } = require("express");
const userModels = require("../models/user.models");

const getuseralltweets = asynchandler(async(req,res)=>{
    const {UserId,page = 1,limit = 10} = req.params;

    if(!UserId){
        throw new apierror(400,"plz provide the userid");
    }

    const findall = await Tweet.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(UserId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"alltweets"
            }
        },
        {
            $unwind:"$alltweets"
        },
        {
            $skip:(parseInt(page)-1)*parseInt(limit),
        },
        {
            $limit:parseInt(limit),
        }
    ]);

    if (findall.length === 0) {
        throw new apierror(404, "No tweets found for this user");
    }

    return res.status(200).json(
        new apiresponse(200,findall,"all tweets successfully fetched")
    )
});


const createtweet = asynchandler(async(req,res)=>{
    const {content} = req.body;

    if(!content?.trim()){
        throw new apierror(400,"plz provide something to create the content");
    }

    const tweet = await Tweet.create({
        content,
        owner:req.user._id
    })

    if(!tweet){
        throw new apierror(400,"something went wrong");
    }


    return res.status(200).json(
        new apiresponse(200,tweet,"tweet created successfully")
    )
});

const updatetweet = asynchandler(async(req,res)=>{
    const {TweetId} = req.params;

    if(!TweetId){
        throw new apierror(400,"plz provide the tweetid");
    }

    const tweet  = await Tweet.findById(TweetId);

    if(!tweet){
        throw new apierror(400,"tweet does not exist");
    }

    if(tweet.owner.toString()!==req.user._id.toString()){
        throw new apierror(400,"you cant update the tweet");
    }

    const {content} = req.body;

    if(!content?.trim()){
        throw new apierror(400,"kindly plz provide the content to update it");
    }

    const tweetupdate = await Tweet.findByIdAndUpdate(
        TweetId,
        {
            $set:{
                content:content
            }
        },
        {new:true},
    );

    if(!tweetupdate){
        throw new apierror(500,"something went wrong");
    }

    return res.status(200).json(
        new apiresponse(200,tweetupdate,"tweet updated successfully")
    )

});

const deletetweet = asynchandler(async(req,res)=>{
    const {TweetId} = req.params;

    if(!TweetId){
        throw new apierror(400,"kindly provide me the tweet id");
    }

    const tweet = await Tweet.findById(TweetId);

    if(!tweet){
        throw new apierror(400,"Tweet does not exist");
    }

    if(tweet.owner.toString()!==req.user._id.toString()){
        throw new apierror(402,"request denied");
    }

    await Tweet.findByIdAndDelete(TweetId);

    return res.status(200).json(
        new apiresponse(200,null,"tweet deleted successfully")
    );
});


module.exports = {createtweet,updatetweet,deletetweet,getuseralltweets};

