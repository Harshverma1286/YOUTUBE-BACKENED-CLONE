const mongoose = require('mongoose');

const asynchandler = require("../utils/asynchandler");

const apierror = require("../utils/apierror");

const apiresponse = require("../utils/apiresponse");

const Playlist = require("../models/playlist.models");

const Video = require("../models/videos.models");

const User = require("../models/user.models");


const createplaylist = asynchandler(async(req,res)=>{
    const {name,description} = req.body;

    if(!name?.trim()){
        throw new apierror(400,"kindly provide the playlist name");
    }

    if(!description?.trim()){
        throw new apierror(400,"kindly provide the description");
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner:req.user._id
    });

    return res.status(200).json(
        new apiresponse(200,playlist,"playlist created successfully")
    )

}); // working well 

const getplaylistbyid = asynchandler(async(req,res)=>{
    const {PlaylistId} = req.params;

    if(!PlaylistId){
        throw new apierror(400,"plz provide the playlist id");
    }

    const playlist = await Playlist.findById(PlaylistId);

    if(!playlist){
        throw new apierror(400,"playlist does not exist");
    }

    return res.status(200).json(
        new apiresponse(200,playlist,"playlist fetched successfully")
    )
});// working well

const addvideotoplaylist = asynchandler(async(req,res)=>{
    const {PlaylistId,videoId} = req.params;

    if(!PlaylistId){
        throw new apierror(400,"kindly provide the playlist id");
    }

    if(!videoId){
        throw new apierror(400,"kindly provide me the video id");
    }

    const playlist = await Playlist.findById(PlaylistId);

    if(!playlist){
        throw new apierror(404,"playlist does not found");
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new apierror(404,"video does not exist");
    }

    // if(playlist.videos.includes(videoId)){
    //     throw new apierror(400,"video already exist in the playlist");
    // } other way to find

    const exists = await Playlist.findOne({
        _id:PlaylistId,
        videos:videoId
    })

    if(exists){
        throw new apierror(400,"video already exist");
    }

    playlist.videos.push(videoId);

    await playlist.save();

    return res.status(200).json(
        new apiresponse(200,"video added in the playlist successfully")
    )


});//working well

const deletevideosfromplaylist = asynchandler(async(req,res)=>{
    const {PlaylistId,videoId} = req.params;

    if(!PlaylistId){
        throw new apierror(400,"playlistid required");
    }

    if(!videoId){
        throw new apierror(400,"videoid required");
    }

    const playlist = await Playlist.findById(PlaylistId);

    if(!playlist){
        throw new apierror(404,"playlist does not exist");
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new apierror(400,"video does not exist");
    }

    const exist = await Playlist.findOne({
        _id:PlaylistId,
        videos:videoId,
    });

    if(!exist){
        throw new apierror(400,"video does not exist in the playlist");
    }

    playlist.videos.pull(videoId);

    await playlist.save();

    return res.status(200).json(
        new apiresponse(200,"video has been succesffuly removed from the playlist")
    )
});//working well

const deleteplaylist = asynchandler(async(req,res)=>{
    const{PlaylistId} = req.params;

    if(!PlaylistId){
        throw new apierror(400,"kindly provide the playlist id");
    }

    const playlist = await Playlist.findById(PlaylistId);

    if(!playlist){
        throw new apierror(404,"playlist does not exist");
    }

    if(playlist.owner.toString()!==req.user._id.toString()){
        throw new apierror(403,"you are not eligible to delete the playlist");
    }

    await Playlist.deleteOne();


    return res.status(200).json(
        new apiresponse(200,"playlist deleted successfully")
    )
});//working well

const updateplaylist = asynchandler(async(req,res)=>{
    const {PlaylistId} = req.params;

    if(!PlaylistId){
        throw new apierror(400,"kindly provide me the playlist id");
    }

    const playlist = await Playlist.findById(PlaylistId);

    if(!playlist){
        throw new apierror(404,"playlist does not found ");
    }

    if(playlist.owner.toString()!==req.user._id.toString()){
        throw new apierror(403,"you are not eligible to make changes in the playlist");
    }

    const {name,description} = req.body;

    if(!name?.trim() && !description?.trim()){
        throw new apierror(400,"atleast provide me one out of two");
    }

    const updatefields = {};
    if(name?.trim()){
        updatefields.name = name.trim();
    }
    if(description.trim()){
        updatefields.description = description.trim();
    }


    const playlistupdate = await Playlist.findByIdAndUpdate(
        PlaylistId,
        {
            $set:updatefields,
        },
        {new:true},
    )

    if(!playlistupdate){
        throw new apierror(500,"something went wrong");
    }

    return res.status(200).json(
        new apiresponse(200,playlistupdate,"playlist updated successfully")
    )
});//working well


const getuserplaylists = asynchandler(async(req,res)=>{
    const {userId} = req.params;

    if(!userId){
        throw new apierror(200,"kindly provide me the user id");
    }

    const playlists = await Playlist.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId),
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",       
                foreignField: "_id",        
                as: "user"
            }
        },
        {
            $unwind:"$user"
        }
    ]);

    if(playlists.length==0){
        throw new apierror(404,"user has not made any playlist");
    }

    return res.status(200).json(
        new apiresponse(200,playlists,"users all playlist fetched successfully")
    )


});// working well




module.exports = {createplaylist,getplaylistbyid,addvideotoplaylist,deletevideosfromplaylist,deleteplaylist,updateplaylist,getuserplaylists};