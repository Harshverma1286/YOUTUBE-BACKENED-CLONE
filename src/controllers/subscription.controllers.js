const mongoose = require('mongoose');

const asynchandler = require('../utils/asynchandler');

const apierror = require("../utils/apierror");

const apiresponse = require("../utils/apiresponse");

const User = require("../models/user.models");

const Subscription = require("../models/subscription.models");

const togglesubscription = asynchandler(async(req,res)=>{
    const {channelId } = req.params;

    if(!channelId){
        throw new apierror(400,"channel does not found");
    }


    const user = await User.findById(channelId);

    if(!user){
        throw new apierror(404,"user does not exists");
    }

    const issubscribed = await Subscription.findOne({
        subscriber:req.user._id,
        channel:channelId,
    });

    if(issubscribed){
        await issubscribed.deleteOne();

        return res.status(200).json(
            new apiresponse(200,"user unsubscribed successfully")
        )
    }
    else{
        const subscribingtochannel = await Subscription.create({
            subscriber:req.user._id,
            channel:channelId
        })


        if(!subscribingtochannel){
            throw new apierror(500,"something went wrong");
        }


        return res.status(200).json(
            new apiresponse(200,subscribingtochannel,"channel subscribed successfully")
        )
    }


});

const getuserchannelsubscribers = asynchandler(async(req,res)=>{
    const {channelId} = req.params;

    if(!channelId){
        throw new apierror(400,"kindly provide the channelid");
    }

    const usersubscribing = await Subscription.aggregate([
        {
            $match:{
                channel:new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "subscriber",       
                foreignField: "_id",        
                as: "allusers"
            }
        },
        {
            $unwind:"$allusers"
        },
        {
            $project:{
                username:"$allusers.username",
                email:"$allusers.email",
                subscriberid:"$subscriber",
                avatar:"$allusers.avatar",
                fullname: "$allusers.fullname",
            }
        }
    ]);

    if(usersubscribing.length==0){
        return res.status(200).json(
            new apiresponse(200,[],"no subscribers found")
        )
    }

    return res.status(200).json(
        new apiresponse(200,usersubscribing,"all users subscribed to the channel fetched successfully")
    )

});

const getsubscribedchannels = asynchandler(async(req,res)=>{
    const {subscriberId} = req.params;

    if(!subscriberId){
        throw new apierror(400,"kindly provide me the subscriber id");
    }

    const allsubscribedchannels = await Subscription.aggregate([
        {
            $match:{
                subscriber:new mongoose.Types.ObjectId(subscriberId),
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"allchannels"
            }
        },
        {
            $unwind:"$allchannels"
        },
        {
            $project:{
                username:"$allchannels.username",
                email:"$allchannels.email",
                channelid:"$channel",
                avatar:"$allchannels.avatar",
                fullname: "$allchannels.fullname",
                subscribedAt: "$createdAt"
            }
        }
    ]);


    if(allsubscribedchannels.length==0){
        return res.status(200).json(
            new apiresponse(200,[],"no channel have ben subscribed by the user")
        )
    }

    return res.status(200).json(
        new apiresponse(200,allsubscribedchannels,"channels that the user has subscribed to")
    )
});



module.exports = {togglesubscription,getuserchannelsubscribers,getsubscribedchannels};



