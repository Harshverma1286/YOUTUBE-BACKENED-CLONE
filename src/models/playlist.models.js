const mongoose = require('mongoose');

const playlistSchema = mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
        },
        description:{
            type:String,
            required:true
        },
        videos:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"video"
        }],
        owner:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
        }
    },
    {
        timestamps:true,
    }
);

module.exports = mongoose.model("playlist",playlistSchema);